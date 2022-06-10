import { ToolWithButtons } from '@/components/well-log/tools/ToolWithButtons';
import { Button } from '@int/geotoolkit/controls/toolbar/Button';

export class ZoomControlTool extends ToolWithButtons {

	private scale = 1;

	constructor(
		private scaleFactor: number,
		private onScaleChanged: (scale: number) => void,
		...props: ConstructorParameters<typeof ToolWithButtons>
	) {
		super(...props);
	}

	getButtons(): Button[] {
		return [
			new Button({
				icon: 'fa fa-magnifying-glass-plus',
				title: 'Zoom in',
				action: () => {
					this.widget.scale(this.scaleFactor);
					this.onScaleChanged(this.scale *= this.scaleFactor);
				}
			}),
			new Button({
				icon: 'fa fa-magnifying-glass-minus',
				title: 'Zoom out',
				action: () => {
					this.widget.scale(1 / this.scaleFactor);
					this.onScaleChanged(this.scale /= this.scaleFactor);
				}
			}),
			new Button({
				icon: 'fa fa-expand',
				title: 'Fit to bounds',
				action: () => {
					this.widget.fitToHeight();
					this.onScaleChanged(1)
				}
			}),
		];
	}

}