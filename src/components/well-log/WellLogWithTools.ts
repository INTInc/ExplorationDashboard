import { WellLog } from '@/components/well-log/WellLog';
import { Toolbar } from '@int/geotoolkit/controls/toolbar/Toolbar';
import { AnchorType } from '@int/geotoolkit/util/AnchorType';
import { Node } from '@int/geotoolkit/scene/Node';
import { TrackType } from '@int/geotoolkit/welllog/TrackType';
import { LogTrack } from '@int/geotoolkit/welllog/LogTrack';
import { LimitsSelectionTool } from '@/components/well-log/tools/LimitsSelectionTool';
import { DepthsSelectionTool } from '@/components/well-log/tools/DepthsSelectionTool';
import { IndexMeasurementSelector } from '@/components/well-log/tools/IndexMeasurementSelector';
import { IndexMeasurement } from '@/common/model/IndexMeasurement';
import { ToolWithButtons } from '@/components/well-log/tools/ToolWithButtons';
import { ZoomControlTool } from '@/components/well-log/tools/ZoomControlTool';
import { Button } from '@int/geotoolkit/controls/toolbar/Button';
import { HeaderVisibilitySwitcher } from '@/components/well-log/tools/HeaderVisibilitySwitcher';
import { CustomCrossHair } from '@/components/well-log/tools/CustomCrossHair';
import { Orientation } from '@int/geotoolkit/util/Orientation';

type CrossHairCallback = (depth: number | null) => void;

export class WellLogWithTools extends WellLog {

	private tools = new Array<ToolWithButtons>();
	private limitsSelectionTool?: LimitsSelectionTool;
	private crossHairCallback?: CrossHairCallback;

	constructor(...props: ConstructorParameters<typeof WellLog>) {
		super(...props);
		this.addZoomControlTool();
		this.addCrossHairSwitcher();
		this.addDepthsSelectionTool();
		this.addLimitsSelectionToolIfPossible();
		this.addHeaderVisibilitySwitcher();
		this.addIndexMeasurementsSwitcher();
		this.createToolbar();
	}

	public onCrossHairMoved(fn: CrossHairCallback) {
		this.crossHairCallback = fn;
	}

	private addZoomControlTool() {
		this.tools.push(new ZoomControlTool(
			5 / 4,
			() => this.onFitToBounds(),
			this.root
		));
	}

	private addCrossHairSwitcher() {
		this.tools.push(new CustomCrossHair(
			depth => { if (this.crossHairCallback) this.crossHairCallback(depth) },
			this.root
		));
	}

	private onFitToBounds() {
		this.root.fitToHeight();
		if (this.limitsSelectionTool) this.limitsSelectionTool.restoreInitialLimits();
	}

	private addLimitsSelectionToolIfPossible() {
		const nonIndexTracks = this.root
			.getTrackContainer()
			.getChildren((t: Node) => t instanceof LogTrack && t.getTag().type !== TrackType.IndexTrack)
			.toArray();

		if (nonIndexTracks.length === 1) {
			this.tools.push(this.limitsSelectionTool = new LimitsSelectionTool(nonIndexTracks[0], this.root));
		}
	}

	private addDepthsSelectionTool() {
		this.tools.push(new DepthsSelectionTool(this.root));
	}

	private addHeaderVisibilitySwitcher() {
		this.tools.push(new HeaderVisibilitySwitcher(90, this.root));
	}

	private addIndexMeasurementsSwitcher() {
		this.tools.push(new IndexMeasurementSelector(
			this.source.getIndexMeasurements(),
			(m: IndexMeasurement) => this.setIndexMeasurement(m),
			this.root
		));
	}

	private createToolbar() {
		new Toolbar({
			tools: this.plot.getTool(),
			alignment: AnchorType.RightBottom,
			orientation: Orientation.Horizontal,
			buttons: new Array<Button>().concat(...this.tools.map(t => t.getButtons()))
		})
	}
}