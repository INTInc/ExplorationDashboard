import { ToolWithButtons } from '@/common/ToolWithButtons';
import { Button } from '@int/geotoolkit/controls/toolbar/Button';
import { IndexMeasurement } from '@/common/model/IndexMeasurement';

export type OnSelectCallback = (m: IndexMeasurement) => void

export class IndexMeasurementSelector extends ToolWithButtons {

	constructor(
		private indexMeasurements: IndexMeasurement[],
		private onSelect: OnSelectCallback,
		...props: ConstructorParameters<typeof ToolWithButtons>
	) {
		super(...props);
	}

	public getButtons(): Button[] {
		return this.indexMeasurements.map((measurement: IndexMeasurement, index: number) => {
			const buttonElement = document.createElement('button')
			buttonElement.innerText = measurement.getName();
			buttonElement.className = 'cg-toolbar-button cg-toolbar-text-button'

			return new Button({
				element: buttonElement,
				title: measurement,
				checkbox: {
					enabled: true,
					name: 'index-measurement',
					checked: index === 0
				},
				action: (_: never, checked: boolean) => {
					buttonElement.disabled = checked;
					this.onSelect(measurement);
				}
			})
		})
	}

}