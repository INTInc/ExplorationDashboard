import { ToolWithButtons } from '@/common/ToolWithButtons';
import { Button } from '@int/geotoolkit/controls/toolbar/Button';
import { from } from '@int/geotoolkit/selection/from';
import { Node } from '@int/geotoolkit/scene/Node';

enum HeaderScrollPosition {
	Top,
	Bottom
}

const DEFAULT_HEADER_HEIGHT = 90;
const DEFAULT_HEADER_POSITION: HeaderScrollPosition = HeaderScrollPosition.Bottom

export class HeaderVisibilitySwitcher extends ToolWithButtons {

	public getButtons(): Button[] {
		return [new Button({
			icon: 'fa-solid fa-window-maximize',
			title: 'Show/hide header',
			checkbox: {
				enabled: true,
				checked: true
			},
			action: (_: never, checked: boolean) => this.toggleHeader(checked)
		})];
	}

	private toggleHeader(visible: boolean) {
		const tracks = from(this.widget).where((node: Node) => node.getName() === 'TrackControlGroup').selectFirst();
		const header = from(this.widget).where((node: Node) => node.getName() === 'HeaderControlGroup').selectFirst().getParent();
		const headerHeight = visible ? DEFAULT_HEADER_HEIGHT : 0;

		tracks.setLayoutStyle({ left: 0, right: 0, bottom: 0, top: headerHeight });
		header.setLayoutStyle({ left: 0, top: 0, right: 0, height: headerHeight });

		this.widget.updateLayout();
		this.widget.fitToHeight();

		switch (DEFAULT_HEADER_POSITION) {
			case HeaderScrollPosition.Top: this.widget.getHeaderContainer().scrollToTop(); break;
			case HeaderScrollPosition.Bottom: this.widget.getHeaderContainer().scrollToBottom(); break;
		}
	}

}