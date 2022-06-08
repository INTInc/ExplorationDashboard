import { RubberBand, Events as RubberBandEvents } from '@int/geotoolkit/controls/tools/RubberBand';
import { ToolWithButtons } from '@/common/ToolWithButtons';
import { Button } from '@int/geotoolkit/controls/toolbar/Button';

export abstract class CustomRubberBand extends ToolWithButtons {

	protected readonly toolName = `customRubberBand-${new Date().getMilliseconds()}`;
	protected readonly rubberBand: RubberBand;

	constructor(
		...props: ConstructorParameters<typeof ToolWithButtons>
	) {
		super(...props);
		this.rubberBand = this.createRubberBand();
		this.configureRubberBand();
		this.widget.connectTool(this.rubberBand);
	}

	public getButtons(): Button[] {
		return [new Button({
			icon: this.getButtonIcon(),
			title: this.getButtonTitle(),
			action: () => this.setRubberBandEnabled(true)
		})];
	}

	protected abstract getButtonIcon(): string;

	protected abstract getButtonTitle(): string;

	protected abstract configureRubberBand(): void;

	private createRubberBand() {
		console.log(this.toolName);
		return new RubberBand(this.widget.getTrackManipulatorLayer())
			.setName(this.toolName)
			.setEnabled(false)
			.setLineStyle({
				color: "rgba(204, 0, 102, 1)",
				width: 2
			})
			.setFillStyle({
				color: "rgba(204, 0, 102, 0.2)"
			})
			.addListener(
				RubberBandEvents.onZoomEnd,
				() => this.setRubberBandEnabled(false)
			)
	}

	private setRubberBandEnabled(enabled: boolean) {
		this.widget.getToolByName('trackPanning')?.setEnabled(!enabled);
		this.widget.getToolByName(this.toolName)?.setEnabled(enabled);
	}

}