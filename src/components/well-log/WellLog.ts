import {WellLogWidget} from '@int/geotoolkit/welllog/widgets/WellLogWidget';
import {HeaderType} from '@int/geotoolkit/welllog/header/LogAxisVisualHeader';
import {Events as PlotEvents, Plot} from '@int/geotoolkit/plot/Plot';
import {Orientation} from '@int/geotoolkit/util/Orientation';
import {StretchablePlot} from '@/common/layout/StretchablePlot';
import {WellLogSource} from '@/components/well-log/WellLogSource';
import {WellAnnotations} from '@/common/model/WellAnnotations';
import {ToolkitCssLoader} from '@/common/styling/ToolkitCssLoader';
import {ToolkitCssStyleable} from '@/common/styling/ToolkitCssStyleable';
import {TrackType} from '@int/geotoolkit/welllog/TrackType';
import {from} from '@int/geotoolkit/selection/from';
import {Node} from '@int/geotoolkit/scene/Node';
import {LogAxis} from '@int/geotoolkit/welllog/LogAxis';
import {IndexMeasurement} from '@/common/model/IndexMeasurement';
import {WellLogMarker} from '@/components/well-log/WellLogMarker';
import {AdaptiveLogCurveVisualHeader} from '@int/geotoolkit/welllog/header/AdaptiveLogCurveVisualHeader';
import {CompositeLogCurve} from '@int/geotoolkit/welllog/CompositeLogCurve';
import {LogFill} from '@int/geotoolkit/welllog/LogFill';
import {LogCurve} from '@int/geotoolkit/welllog/LogCurve';
import {LogTrack} from '@int/geotoolkit/welllog/LogTrack';

export class WellLog extends ToolkitCssStyleable<WellLogWidget> {

    protected plot: Plot;
    protected markers: WellLogMarker[] = [];
    private indexMeasurement: IndexMeasurement;

    constructor (
        private canvasElement: HTMLCanvasElement,
        private referenceElement: HTMLElement,
        protected source: WellLogSource,
        private template: string,
        private annotations: WellAnnotations,
        cssLoader: ToolkitCssLoader
    ) {
        super(WellLog.createWidget(), cssLoader);
        this.updateHeaderProviders();
        this.root
            .setAxisHeaderType(HeaderType.Simple)
            .loadTemplate(this.template);
        this.plot = this.createPlot();
        this.indexMeasurement = this.source.getDefaultIndexMeasurement();
        this.createAnnotations();
    }

    private static createWidget (): WellLogWidget {
        return new WellLogWidget({
            indexunit: 'm',
            horizontalscrollable: false,
            verticalscrollable: false
        });
    }

    public setIndexMeasurement (measurement: IndexMeasurement) {
        this.source.setIndexMeasurement(measurement.getKey());
        this.root
            .setDataBinding(this.source.getBinding())
            .setDepthLimits(this.source.getLimits())
            .fitToHeight();
        this.updateIndexAxis(measurement);
        this.updateAnnotations(measurement);
        this.indexMeasurement = measurement;
    }

    protected findTracksBy (filter: (t: LogTrack) => boolean): LogTrack[] {
        return from(this.root.getTrackContainer())
            .where((n: Node) => n instanceof LogTrack && filter(n))
            .selectToArray() as LogTrack[];
    }

    private updateHeaderProviders () {
        // FIXME: check template deserialization: empty LogFill headers now resets to default
        const curveHeader = new AdaptiveLogCurveVisualHeader()
            .setElement('ScaleFrom', {'horizontalpos': 'left', 'verticalpos': 'top'})
            .setElement('ScaleTo', {'horizontalpos': 'right', 'verticalpos': 'top'})
            .setElement('Line', {'horizontalpos': 'center', 'verticalpos': 'center'})
            .setElement('Name', {'horizontalpos': 'center', 'verticalpos': 'top'})
            .setElement('Unit', {'horizontalpos': 'center', 'verticalpos': 'bottom'})
            .setElement('Tracking', {'horizontalpos': 'center', 'verticalpos': 'bottom'});
        this.root
            .getHeaderContainer()
            .getHeaderProvider()
            .registerHeaderProvider(new CompositeLogCurve().getClassName(), curveHeader)
            .registerHeaderProvider(new LogCurve().getClassName(), curveHeader)
            .registerHeaderProvider(new LogFill().getClassName(), undefined);
    }

    private createAnnotations () {
        this.annotations.data.forEach(annotation => {
            const marker = new WellLogMarker(annotation, this.indexMeasurement);
            this.root.getTrackContainer().addChild(marker);
            this.markers.push(marker);
        });
    }

    private updateIndexAxis (measurement: IndexMeasurement) {
        from(this.root.getTrackContainer())
            .where((node: Node) => node instanceof LogAxis)
            .select((logAxis: LogAxis) => logAxis.setName(measurement.getName()));
    }

    private updateAnnotations (measurement: IndexMeasurement) {
        this.markers.forEach(marker => marker.setIndexMeasurement(measurement));
    }

    private createPlot () {
        const plot = new StretchablePlot({
            canvaselement: this.canvasElement,
            root: this.root
        });
        plot
            .on(PlotEvents.Resized, (_: never, plot: Plot) => this.resizeTracks(plot))
            .setRefElement(this.referenceElement);
        return plot;
    }

    private resizeTracks (plot: Plot) {
        const limit = this.root.getOrientation() === Orientation.Vertical ?
            plot.getWidth() :
            plot.getHeight();

        const indexTracks = this.findTracksBy(t => t.getTag().type === TrackType.IndexTrack);
        const dataTracks = this.findTracksBy(t => t.getTag().type !== TrackType.IndexTrack);
        const indexTrackWidth = 35;
        const dataTrackWidth = Math.floor((limit - indexTrackWidth) / dataTracks.length);
        indexTracks.forEach(t => t.setWidth(35));
        dataTracks.forEach(t => t.setWidth(dataTrackWidth));
    }
}
