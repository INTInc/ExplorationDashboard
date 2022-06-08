import { ToolWithButtons } from '@/common/ToolWithButtons';
import { Button } from '@int/geotoolkit/controls/toolbar/Button';
import { IndexMeasurement } from '@/common/model/IndexMeasurement';

export class IndexMeasurementSwitcher extends ToolWithButtons {

	constructor(
		private indexMeasurements: IndexMeasurement[],
		private onSelected: (m: IndexMeasurement) => void,
		...props: ConstructorParameters<typeof ToolWithButtons>
	) {
		super(...props);
	}

	getButtons(): Button[] {
		return this.indexMeasurements.map((measurement: IndexMeasurement, index: number) => {
			const buttonElement = document.createElement('div')
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
				action: () => this.onSelected(measurement)
			});
		})
	}

}