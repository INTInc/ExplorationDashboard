import {CustomRubberBand} from '@/components/well-log/tools/CustomRubberBand';
import {Events as RubberBandEvents} from '@int/geotoolkit/controls/tools/RubberBand';
import {RubberBandRenderMode} from '@int/geotoolkit/controls/tools/RubberBandRenderMode';
import {RubberBandEventArgs} from '@int/geotoolkit/controls/tools/RubberBandEventArgs';
import {Range} from '@int/geotoolkit/util/Range';
import {MathUtil} from '@int/geotoolkit/util/MathUtil';
import {LogTrack} from '@int/geotoolkit/welllog/LogTrack';
import {from} from '@int/geotoolkit/selection/from';
import {Node} from '@int/geotoolkit/scene/Node';
import {LogCurve} from '@int/geotoolkit/welllog/LogCurve';
import {Orientation} from '@int/geotoolkit/util/Orientation';

export class LimitsSelectionTool extends CustomRubberBand {

    private curves = new Array<LogCurve>();
    private initialLimits = new Map<LogCurve, { min: number, max: number }>();

    constructor (
        private track: LogTrack,
        ...props: ConstructorParameters<typeof CustomRubberBand>
    ) {
        super(...props);
        this.findCurves();
        this.saveInitialLimits();
    }

    public restoreInitialLimits () {
        this.curves.forEach(c => {
            const initialLimits = this.initialLimits.get(c);
            if (initialLimits) c.setNormalizationLimits(initialLimits.min, initialLimits.max);
        });
    }

    protected configureRubberBand () {
        this.rubberBand
            .setMode(RubberBandRenderMode.Horizontal)
            .on(
                RubberBandEvents.onZoomEnd,
                (_, sender, event) => this.onZoomEnd(event)
            );
    }

    protected getButtonIcon (): string {
        const rotationClass = this.widget.getOrientation() === Orientation.Horizontal ? 'fa-rotate-90' : '';
        return `fa fa-arrows-left-right-to-line ${rotationClass}`;
    }

    protected getButtonTitle (): string {
        return 'Select limits';
    }

    private onZoomEnd (event: RubberBandEventArgs) {
        const area = event.getArea();
        const values = [area.getLeft(), area.getRight()];
        const limits = MathUtil.getLimits(values);
        const range = new Range(limits[0], limits[1]);

        (from(this.track)
            .where((node: Node) => (
                node instanceof LogCurve &&
                node.getMicroPositionLeft() === 0 &&
                node.getMicroPositionRight() === 1
            ))
            .selectToArray() as LogCurve[])
            .forEach((c: LogCurve) => {
                const minimum = c.getMinimumNormalizationLimit();
                const maximum = c.getMaximumNormalizationLimit();
                const multiplier = (maximum - minimum) / (this.track.getBounds()?.getWidth() || 1);
                c.setNormalizationLimits(
                    minimum + range.getLow() * multiplier,
                    minimum + range.getHigh() * multiplier
                );
            });
    }

    private findCurves () {
        this.curves = (from(this.track)
            .where((node: Node) => (
                node instanceof LogCurve &&
                node.getMicroPositionLeft() === 0 &&
                node.getMicroPositionRight() === 1
            ))
            .selectToArray() as LogCurve[]);
    }

    private saveInitialLimits () {
        this.curves.forEach(c => {
            this.initialLimits.set(c, {
                min: c.getMinimumNormalizationLimit(),
                max: c.getMaximumNormalizationLimit()
            });
        });
    }

}
