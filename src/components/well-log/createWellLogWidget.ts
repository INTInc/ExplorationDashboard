import { WellLogWidget } from '@int/geotoolkit/welllog/widgets/WellLogWidget';
import { HeaderType } from '@int/geotoolkit/welllog/header/LogAxisVisualHeader';
import { LogMarker } from '@int/geotoolkit/welllog/LogMarker';
import { LineStyle } from '@int/geotoolkit/attributes/LineStyle';
import { AnchorType } from '@int/geotoolkit/util/AnchorType';
import { Events as PlotEvents, Plot } from '@int/geotoolkit/plot/Plot';
import { Orientation } from '@int/geotoolkit/util/Orientation';
import { LogAxis } from '@int/geotoolkit/welllog/LogAxis';
import { CrossHair, Events as CrossHairEvents } from '@int/geotoolkit/controls/tools/CrossHair';
import { CrossHairEventArgs } from '@int/geotoolkit/controls/tools/CrossHairEventArgs';

import { Styleable } from '@/common/styling/Styleable';
import { StretchablePlot } from '@/common/layout/StretchablePlot';
import { WellLogSource } from '@/components/well-log/WellLogSource';
import { WellAnnotations } from '@/common/model/WellAnnotations';

type CrossHairMovedCallback = (y: number | null) => void;
type HeaderScrollPosition = 'top' | 'bottom';

export async function createWellLogWidget(
	canvasElement: HTMLCanvasElement,
	referenceElement: HTMLElement,
	source: WellLogSource,
	templateUrl: string,
	limits: number[],
	tracksCountToFit = 1,
	initialHeaderScrollPosition: HeaderScrollPosition = 'top',
	annotations: WellAnnotations,
	onCrossHairMoved: CrossHairMovedCallback
) {

	async function fetchTemplate(): Promise<string> {
		const response = await fetch(templateUrl);
		return await response.text();
	}

	function createWidget(template: string) {
		return new (Styleable(WellLogWidget))({
			horizontalscrollable: false,
			verticalscrollable: false
		})
			.setDataBinding(source.binding)
			.setDepthLimits(limits[0], limits[1])
			.setAxisHeaderType(HeaderType.Simple)
			.loadTemplate(template)
	}

	function createAnnotations(widget: WellLogWidget) {
		annotations.data.forEach(annotation => {
			const marker = new LogMarker(annotation.depth, annotation.text)
				.setLineStyle(new LineStyle({ color: annotation.color, width: 2 }))
				.setVerticalTextOffset(-5)
				.setHorizontalTextOffset(5)
				.setNameLabelPosition(AnchorType.RightTop)
				.setDepthLabelPosition(AnchorType.RightBottom)
				.setFillStyleDepth(annotation.color)
				.setFillStyleName(annotation.color)
				.setFillDepthLabel(true)
				.setFillNameLabel(true);
			widget
				.getTrackContainer()
				.addChild(marker);
		});
	}

	function createPlot(widget: WellLogWidget) {
		return new StretchablePlot({
			canvaselement: canvasElement,
			root: widget
		})
			.on(PlotEvents.Resized, (_: never, plot: Plot) => resizeTracks(plot, widget))
			.setRefElement(referenceElement)
	}

	function resizeTracks(plot: Plot, widget: WellLogWidget) {
		const limit = widget.getOrientation() === Orientation.Vertical
			? plot.getWidth()
			: plot.getHeight();

		const indexTrackWidth = 35;
		const curveTrackWidth = Math.floor((limit - indexTrackWidth) / tracksCountToFit);

		for (let i = 0; i < widget.getTracksCount(); i++) {
			const track = widget.getTrackAt(i);
			track.setWidth(track.getChild(0) && track.getChild(0) instanceof LogAxis
				? indexTrackWidth
				: curveTrackWidth);
		}
	}

	function configureCrossHairTool(widget: WellLogWidget) {
		const crossHair = widget.getToolByName('cross-hair');
		if (crossHair !== null) {
			(crossHair as CrossHair)
				.setEnabled(true)
				.setProperties({
					east: {
						visible: true
					}
				})
				.addListener(CrossHairEvents.onPositionChanged, onCrossHairPositionChanged);
			canvasElement.addEventListener('mouseleave', onContainerMouseLeave)
		}
	}

	function onCrossHairPositionChanged(_: never, event: CrossHairEventArgs) {
		onCrossHairMoved(event.getPosition().getY());
	}

	function onContainerMouseLeave() {
		onCrossHairMoved(null);
	}

	function scrollHeader(widget: WellLogWidget) {
		switch (initialHeaderScrollPosition) {
			case 'top': return widget.getHeaderContainer().scrollToTop();
			case 'bottom': return widget.getHeaderContainer().scrollToBottom();
			default: return;
		}
	}

	return source.loaded
		.then(fetchTemplate)
		.then(createWidget)
		.then(widget => {
			createPlot(widget);
			createAnnotations(widget);
			configureCrossHairTool(widget);
			scrollHeader(widget);

			return widget.fitToHeight();
		})
}