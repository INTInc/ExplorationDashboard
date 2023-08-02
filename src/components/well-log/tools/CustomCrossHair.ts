import {ToolWithButtons} from '@/components/well-log/tools/ToolWithButtons';
import {Button} from '@int/geotoolkit/controls/toolbar/Button';
import {CrossHair, Events as CrossHairEvents} from '@int/geotoolkit/controls/tools/CrossHair';

export class CustomCrossHair extends ToolWithButtons {

    protected readonly crossHair: CrossHair;

    constructor (
        private onCrossHairMoved: (y: number) => void,
        ...props: ConstructorParameters<typeof ToolWithButtons>
    ) {
        super(...props);
        this.widget.connectTool(this.crossHair = this.getOrCreateCrossHair());
    }

    public getButtons (): Button[] {
        return [new Button({
            icon: 'fa fa-crosshairs',
            title: 'Enable/disable CrossHair',
            checkbox: {
                enabled: true,
                checked: true
            },
            action: (_, checked) => this.crossHair.setEnabled(checked)
        })];
    }

    private getOrCreateCrossHair () {
        return (this.getTool() || this.createTool())
            .setEnabled(true)
            .setProperties({east: {visible: true}})
            .on(
                CrossHairEvents.onPositionChanged,
                (_, sender, e) => e && this.onCrossHairMoved(e.getPosition().getY())
            );
    }

    private getTool (): CrossHair | null {
        return this.widget.getToolByName('cross-hair');
    }

    private createTool (): CrossHair {
        const crossHair = new CrossHair(this.widget.getTrackManipulatorLayer());
        this.widget.connectTool(crossHair);
        return crossHair;
    }
}
