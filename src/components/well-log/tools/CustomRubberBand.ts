import {Events as RubberBandEvents, RubberBand} from '@int/geotoolkit/controls/tools/RubberBand';
import {ToolWithButtons} from '@/components/well-log/tools/ToolWithButtons';
import {Button} from '@int/geotoolkit/controls/toolbar/Button';
import {MathUtil} from '@int/geotoolkit/util/MathUtil';

export abstract class CustomRubberBand extends ToolWithButtons {

    protected readonly toolName = `customRubberBand-${Math.floor(MathUtil.getSeededRandom(0, 1000))}`;
    protected readonly rubberBand: RubberBand;
    private readonly button: Button;

    constructor (
        ...props: ConstructorParameters<typeof ToolWithButtons>
    ) {
        super(...props);
        this.rubberBand = this.createRubberBand();
        this.button = this.createButton();
        this.configureRubberBand();
        this.widget.connectTool(this.rubberBand);
    }

    public getButtons (): Button[] {
        return [this.button];
    }

    protected abstract getButtonIcon (): string;

    protected abstract getButtonTitle (): string;

    protected abstract configureRubberBand (): void;

    private createRubberBand () {
        return new RubberBand(this.widget.getTrackManipulatorLayer())
            .setName(this.toolName)
            .setEnabled(false)
            .setLineStyle({
                color: 'rgba(204, 0, 102, 1)',
                width: 2
            })
            .setFillStyle({
                color: 'rgba(204, 0, 102, 0.2)'
            })
            .on(
                RubberBandEvents.onZoomEnd,
                () => {
                    this.setRubberBandEnabled(false);
                    this.button.setChecked(false);
                }
            );
    }

    private setRubberBandEnabled (enabled: boolean) {
        this.widget.getToolByName('trackPanning')?.setEnabled(!enabled);
        this.widget.getToolByName(this.toolName)?.setEnabled(enabled);
    }

    private createButton (): Button {
        return new Button({
            icon: this.getButtonIcon(),
            title: this.getButtonTitle(),
            checkbox: {
                enabled: true,
                name: 'custom-rubberband',
                checked: false
            },
            action: (_, checked) => this.setRubberBandEnabled(checked)
        });
    }

}
