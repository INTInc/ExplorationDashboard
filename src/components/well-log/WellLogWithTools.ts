import { WellLog } from '@/components/well-log/WellLog';
import { Button } from '@int/geotoolkit/controls/toolbar/Button';
import { Toolbar } from '@int/geotoolkit/controls/toolbar/Toolbar';
import { AnchorType } from '@int/geotoolkit/util/AnchorType';
import { from } from '@int/geotoolkit/selection/from';
import { Node } from '@int/geotoolkit/scene/Node';
import { Orientation } from '@int/geotoolkit/util/Orientation';
import { IndexMeasurement } from '@/common/model/IndexMeasurement';

type HeaderScrollPosition = 'top' | 'bottom';

export class WellLogWithTools extends WellLog {

	constructor(
		private initialHeaderHeight: number = 90,
		private initialHeaderScrollPosition: HeaderScrollPosition = 'bottom',
		...props: ConstructorParameters<typeof WellLog>
	) {
		super(...props);
		this.createToolbar()
	}

	private createToolbar() {
		new Toolbar({
			tools: this.plot.getTool(),
			alignment: AnchorType.RightBottom,
			orientation: Orientation.Horizontal,
			buttons: this.createToolbarButtons()
		})
	}

	private createToolbarButtons(): Button[] {
		const buttons = [
			new Button({
				icon: 'fa fa-magnifying-glass-plus',
				title: 'Zoom in',
				action: () => this.root.scale(5 / 4)
			}),
			new Button({
				icon: 'fa fa-magnifying-glass-minus',
				title: 'Zoom out',
				action: () => this.root.scale(4 / 5)
			}),
			new Button({
				icon: 'fa fa-expand',
				title: 'Fit to bounds',
				action: () => this.root.fitToHeight()
			}),
			new Button({
				icon: 'fa-solid fa-window-maximize',
				title: 'Show/hide header',
				checkbox: {
					enabled: true,
					checked: true
				},
				action: (_: never, checked: boolean) => this.toggleHeader(checked)
			})
		];
		this.source.getIndexMeasurements().forEach((measurement: IndexMeasurement, index: number) => {
			const buttonElement = document.createElement('div')
			buttonElement.innerText = measurement.getName();
			buttonElement.className = 'cg-toolbar-button cg-toolbar-text-button'

			buttons.push(new Button({
				element: buttonElement,
				title: measurement,
				checkbox: {
					enabled: true,
					name: 'index-measurement',
					checked: index === 0
				},
				action: () => this.setIndexMeasurement(measurement)
			}));
		})
		return buttons;
	}

	private toggleHeader(visible: boolean) {
		const tracks = from(this.root).where((node: Node) => node.getName() === 'TrackControlGroup').selectFirst();
		const header = from(this.root).where((node: Node) => node.getName() === 'HeaderControlGroup').selectFirst().getParent();
		const headerHeight = visible ? this.initialHeaderHeight : 0;

		tracks.setLayoutStyle({ left: 0, right: 0, bottom: 0, top: headerHeight });
		header.setLayoutStyle({ left: 0, top: 0, right: 0, height: headerHeight });

		this.root.updateLayout();
		this.root.fitToHeight();

		switch (this.initialHeaderScrollPosition) {
			case 'top': this.root.getHeaderContainer().scrollToTop(); break;
			case 'bottom': this.root.getHeaderContainer().scrollToBottom(); break;
		}
	}

}