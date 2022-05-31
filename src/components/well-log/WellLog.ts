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
import { StretchablePlot } from '@/common/layout/StretchablePlot';
import { WellLogSource } from '@/components/well-log/WellLogSource';
import { WellAnnotations } from '@/common/model/WellAnnotations';
import { ToolkitCssLoader } from '@/common/styling/ToolkitCssLoader';
import { ToolkitCssStyleable } from '@/common/styling/ToolkitCssStyleable';

type CrossHairMovedCallback = (y: number | null) => void;
type HeaderScrollPosition = 'top' | 'bottom';

export class WellLog extends ToolkitCssStyleable<WellLogWidget> {

	constructor(
		private canvasElement: HTMLCanvasElement,
		private referenceElement: HTMLElement,
		private source: WellLogSource,
		private template: string,
		private limits: number[],
		private tracksCountToFit = 1,
		private initialHeaderScrollPosition: HeaderScrollPosition = 'top',
		private annotations: WellAnnotations,
		themesLoader: ToolkitCssLoader,
		private onCrossHairMoved: CrossHairMovedCallback
	) {
		super(WellLog.createWidget(), themesLoader);
		source.loaded.then(() => this.initialize());
	}

	private initialize() {
		this.configureWidget();
		this.createPlot();
		this.createAnnotations();
		this.configureCrossHairTool();
		this.scrollHeader();

		this.root.fitToHeight();
		this.initialization.resolve(this);
	}

	private static createWidget(): WellLogWidget {
		return new WellLogWidget({
			horizontalscrollable: false,
			verticalscrollable: false
		})
	}

	private configureWidget() {
		this.root
			.setDataBinding(this.source.binding)
			.setDepthLimits(this.limits[0], this.limits[1])
			.setAxisHeaderType(HeaderType.Simple)
			.loadTemplate(this.template)
	}

	private createAnnotations() {
		this.annotations.data.forEach(annotation => {
			if (annotation.depth) {
				const marker = new LogMarker(annotation.depth, annotation.text)
					.setLineStyle(new LineStyle({color: annotation.color, width: 2}))
					.setVerticalTextOffset(-5)
					.setHorizontalTextOffset(5)
					.setNameLabelPosition(AnchorType.RightTop)
					.setDepthLabelPosition(AnchorType.RightBottom)
					.setFillStyleDepth(annotation.color)
					.setFillStyleName(annotation.color)
					.setFillDepthLabel(true)
					.setFillNameLabel(true);
				this.root
					.getTrackContainer()
					.addChild(marker);
			}
		});
	}

	private createPlot() {
		return new StretchablePlot({
			canvaselement: this.canvasElement,
			root: this.root
		})
			.on(PlotEvents.Resized, (_: never, plot: Plot) => this.resizeTracks(plot))
			.setRefElement(this.referenceElement)
	}

	private resizeTracks(plot: Plot) {
		const limit = this.root.getOrientation() === Orientation.Vertical
			? plot.getWidth()
			: plot.getHeight();

		const indexTrackWidth = 35;
		const curveTrackWidth = Math.floor((limit - indexTrackWidth) / this.tracksCountToFit);

		for (let i = 0; i < this.root.getTracksCount(); i++) {
			const track = this.root.getTrackAt(i);
			track.setWidth(track.getChild(0) && track.getChild(0) instanceof LogAxis
				? indexTrackWidth
				: curveTrackWidth);
		}
	}

	private configureCrossHairTool() {
		const crossHair = this.root.getToolByName('cross-hair');
		if (crossHair !== null) {
			(crossHair as CrossHair)
				.setEnabled(true)
				.setProperties({
					east: {
						visible: true
					}
				})
				.addListener(CrossHairEvents.onPositionChanged, this.onCrossHairPositionChanged);
			this.canvasElement.addEventListener('mouseleave', this.onContainerMouseLeave)
		}
	}

	private onCrossHairPositionChanged(_: never, event: CrossHairEventArgs) {
		this.onCrossHairMoved(event.getPosition().getY());
	}

	private onContainerMouseLeave() {
		this.onCrossHairMoved(null);
	}

	private scrollHeader() {
		switch (this.initialHeaderScrollPosition) {
			case 'top': return this.root.getHeaderContainer().scrollToTop();
			case 'bottom': return this.root.getHeaderContainer().scrollToBottom();
			default: return;
		}
	}
}