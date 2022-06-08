import { Events as RubberBandEvents, RubberBand } from '@int/geotoolkit/controls/tools/RubberBand';
import { RubberBandRenderMode } from '@int/geotoolkit/controls/tools/RubberBandRenderMode';
import { Layer } from '@int/geotoolkit/scene/Layer';
import { RubberBandEventArgs } from '@int/geotoolkit/controls/tools/RubberBandEventArgs';
import { Range } from '@int/geotoolkit/util/Range';
import { MathUtil } from '@int/geotoolkit/util/MathUtil';

type OnZoomEndCallback = (r: Range) => void;

export class RubberBandTool extends RubberBand {

	private onZoomEndCallback: OnZoomEndCallback | null = null;

	constructor(
		name: string,
		layer: Layer,
		mode: RubberBandRenderMode
	) {
		super(layer, mode);
		this
			.setName(name)
			.setEnabled(false)
			.setAutoDisabled(true)
			.setLineStyle({
				color: "rgba(204, 0, 102, 1)",
				width: 2
			})
			.setFillStyle({
				color: "rgba(204, 0, 102, 0.2)"
			})
			.addListener(RubberBandEvents.onZoomEnd, (_: never, event: RubberBandEventArgs) => {
				if (this.onZoomEndCallback) {
					const area = event.getArea();
					const values = mode === RubberBandRenderMode.Vertical
						? [area.getTop(), area.getBottom()]
						: [area.getLeft(), area.getRight()];
					this.onZoomEndCallback(new Range(...MathUtil.getLimits(values)));
				}
			});
	}

	public onSelected(fn: OnZoomEndCallback) {
		this.onZoomEndCallback = fn;
	}

}