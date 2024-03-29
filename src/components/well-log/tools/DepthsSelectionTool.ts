import {CustomRubberBand} from '@/components/well-log/tools/CustomRubberBand';
import {Events as RubberBandEvents} from '@int/geotoolkit/controls/tools/RubberBand';
import {RubberBandRenderMode} from '@int/geotoolkit/controls/tools/RubberBandRenderMode';
import {RubberBandEventArgs} from '@int/geotoolkit/controls/tools/RubberBandEventArgs';
import {Range} from '@int/geotoolkit/util/Range';
import {MathUtil} from '@int/geotoolkit/util/MathUtil';
import {Orientation} from '@int/geotoolkit/util/Orientation';

export class DepthsSelectionTool extends CustomRubberBand {

    protected getButtonIcon (): string {
        const rotationClass = this.widget.getOrientation() === Orientation.Vertical ? 'fa-rotate-90' : '';
        return `fa fa-arrows-left-right-to-line ${rotationClass}`;
    }

    protected getButtonTitle (): string {
        return 'Select depths';
    }

    protected configureRubberBand () {
        this.rubberBand
            .setMode(RubberBandRenderMode.Vertical)
            .on(
                RubberBandEvents.onZoomEnd,
                (_, sender, event) => this.onZoomEnd(event));
    }

    private onZoomEnd (event: RubberBandEventArgs) {
        const area = event.getArea();
        const values = [area.getBottom(), area.getTop()];
        const limits = MathUtil.getLimits(values);
        const range = new Range(limits[0], limits[1]);
        this.widget.setVisibleDepthLimits(range);
    }

}
