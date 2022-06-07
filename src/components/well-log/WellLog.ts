import { WellLogWidget } from '@int/geotoolkit/welllog/widgets/WellLogWidget';
import { HeaderType } from '@int/geotoolkit/welllog/header/LogAxisVisualHeader';
import { LogMarker } from '@int/geotoolkit/welllog/LogMarker';
import { LineStyle } from '@int/geotoolkit/attributes/LineStyle';
import { AnchorType } from '@int/geotoolkit/util/AnchorType';
import { Events as PlotEvents, Plot } from '@int/geotoolkit/plot/Plot';
import { Orientation } from '@int/geotoolkit/util/Orientation';
import { CrossHair, Events as CrossHairEvents } from '@int/geotoolkit/controls/tools/CrossHair';
import { CrossHairEventArgs } from '@int/geotoolkit/controls/tools/CrossHairEventArgs';
import { StretchablePlot } from '@/common/layout/StretchablePlot';
import { WellLogSource } from '@/components/well-log/WellLogSource';
import { WellAnnotations } from '@/common/model/WellAnnotations';
import { ToolkitCssLoader } from '@/common/styling/ToolkitCssLoader';
import { ToolkitCssStyleable } from '@/common/styling/ToolkitCssStyleable';
import { TrackType } from '@int/geotoolkit/welllog/TrackType';
import { from } from '@int/geotoolkit/selection/from';
import { Node } from '@int/geotoolkit/scene/Node';
import { LogAxis } from '@int/geotoolkit/welllog/LogAxis';
import { IndexMeasurement } from '@/common/model/IndexMeasurement';
type CrossHairCallback = (y: number | null) => void;

export class WellLog extends ToolkitCssStyleable<WellLogWidget> {

	private crossHairCallback: CrossHairCallback | null = null;
	protected plot: any;
	protected markers: LogMarker[] = [];

	constructor(
		private canvasElement: HTMLCanvasElement,
		private referenceElement: HTMLElement,
		private source: WellLogSource,
		private template: string,
		private tracksCountToFit = 1,
		private annotations: WellAnnotations,
		protected indexMeasurements: Set<IndexMeasurement>,
		cssLoader: ToolkitCssLoader
	) {
		super(WellLog.createWidget(), cssLoader);
		this.configureWidget();
		this.plot = this.createPlot();
		this.createAnnotations();
		this.configureCrossHairTool();
	}

	public setIndexMeasurement(measurement: IndexMeasurement) {
		this.source.setIndexMeasurement(measurement.getKey());
		this.root
			.setDataBinding(this.source.getBinding())
			.setDepthLimits(this.source.getLimits())
			.fitToHeight();
		this.updateIndexAxis(measurement.getName());
	}

	public onCrossHairMoved(fn: CrossHairCallback) {
		this.crossHairCallback = fn;
	}

	private configureWidget() {
		this.root
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
				this.markers
					.push(marker);
			}
		});
	}

	private updateIndexAxis(measurement: string) {
		from(this.root.getTrackContainer())
			.where((node: Node) => node instanceof LogAxis)
			.select((logAxis: LogAxis) => {
				logAxis.setName(measurement);
				logAxis.setProperties()
			});
	}

	private createPlot() {
		const plot = new StretchablePlot({
			canvaselement: this.canvasElement,
			root: this.root
		});
		plot
			.on(PlotEvents.Resized, (_: never, plot: Plot) => this.resizeTracks(plot))
			.setRefElement(this.referenceElement);

		return plot;
	}

	private resizeTracks(plot: Plot) {
		const limit = this.root.getOrientation() === Orientation.Vertical
			? plot.getWidth()
			: plot.getHeight();

		const indexTrackWidth = 35;
		const curveTrackWidth = Math.floor((limit - indexTrackWidth) / this.tracksCountToFit);

		for (let i = 0; i < this.root.getTracksCount(); i++) {
			const track = this.root.getTrackAt(i);
			track.setWidth(track.getTag() && track.getTag().type === TrackType.IndexTrack
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
				.addListener(
					CrossHairEvents.onPositionChanged,
					(_: never, e: CrossHairEventArgs) => this.onCrossHairPositionChanged(e)
				);
		}
	}

	private onCrossHairPositionChanged(event: CrossHairEventArgs) {
		if (this.crossHairCallback) this.crossHairCallback(event.getPosition().getY());
	}

	private static createWidget(): WellLogWidget {
		return new WellLogWidget({
			horizontalscrollable: false,
			verticalscrollable: false
		})
	}
}