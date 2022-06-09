import { ToolWithButtons } from '@/components/well-log/tools/ToolWithButtons';
import { Button } from '@int/geotoolkit/controls/toolbar/Button';
import { Group } from '@int/geotoolkit/scene/Group';
import { Node } from '@int/geotoolkit/scene/Node';
import { from } from '@int/geotoolkit/selection/from';
import { Splitter, Events as SplitterEvents } from '@int/geotoolkit/controls/tools/splitter/Splitter';

export class HeaderVisibilitySwitcher extends ToolWithButtons {

	private readonly headerGroup: Group;
	private readonly tracksGroup: Group;
	private splitter: Splitter | null = null;

	private storedHeight;

	constructor(
		defaultHeight: number,
		...props: ConstructorParameters<typeof ToolWithButtons>
	) {
		super(...props);
		this.tracksGroup = this.findGroup('TrackControlGroup').setDesiredHeight('100%');
		this.headerGroup = this.findGroup('HeaderControlGroup').setDesiredHeight('100%').getParent();
		this.storedHeight = defaultHeight;
		this.initSplitter();
	}

	public getButtons(): Button[] {
		return [new Button({
			icon: 'fa fa-window-maximize',
			title: 'Show/hide header',
			checkbox: {
				enabled: true,
				checked: true
			},
			action: (_: never, checked: boolean) => {
				if (!checked) {
					this.storeHeaderHeight();
					this.setHeaderHeight(0);
				} else {
					this.restoreHeaderHeight();
				}
			}
		})];
	}

	private setHeaderHeight(height: number) {
		this.headerGroup.setLayoutStyle({ left: 0, top: 0, right: 0, height });
		this.tracksGroup.setLayoutStyle({ left: 0, top: height, right: 0, bottom: 0 });
		this.splitter?.setPlots([this.headerGroup, this.tracksGroup]);
		this.widget.getHeaderContainer().scrollToBottom();
		this.widget.updateLayout();
		this.widget.fitToHeight();
		this.headerGroup.invalidateParent();
	}

	private storeHeaderHeight() {
		this.storedHeight = this.headerGroup.getBounds().getHeight();
	}

	private restoreHeaderHeight() {
		this.setHeaderHeight(this.storedHeight);
	}

	private findGroup(name: string): Group {
		return from(this.widget).where((node: Node) => node.getName() === name).selectFirst() as Group;
	}

	private initSplitter() {
		this.splitter = this.widget.getToolByName('horizontal-splitter') as Splitter | null;
		this.splitter?.addListener(SplitterEvents.onPlotSizeChanged, () => {
			this.setHeaderHeight(this.headerGroup.getBounds().getHeight());
		})
	}

}