import { ToolWithButtons } from '@/components/well-log/tools/ToolWithButtons';
import { Button } from '@int/geotoolkit/controls/toolbar/Button';

export class ZoomControlTool extends ToolWithButtons {

	constructor(
		private scaleFactor: number,
		private onFitToBounds: () => void,
		...props: ConstructorParameters<typeof ToolWithButtons>
	) {
		super(...props);
	}

	getButtons(): Button[] {
		return [
			new Button({
				icon: 'fa fa-magnifying-glass-plus',
				title: 'Zoom in',
				action: () => this.widget.scale(this.scaleFactor)
			}),
			new Button({
				icon: 'fa fa-magnifying-glass-minus',
				title: 'Zoom out',
				action: () => this.widget.scale(1 / this.scaleFactor)
			}),
			new Button({
				icon: 'fa fa-expand',
				title: 'Fit to bounds',
				action: () => this.onFitToBounds()
			}),
		];
	}

}