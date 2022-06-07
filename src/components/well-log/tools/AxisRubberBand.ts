import { RubberBand } from '@int/geotoolkit/controls/tools/RubberBand';
import { RubberBandRenderMode } from '@int/geotoolkit/controls/tools/RubberBandRenderMode';
import { Layer } from '@int/geotoolkit/scene/Layer';

export class AxisRubberBand extends RubberBand {

	constructor(
		layer: Layer,
		name: string,
	) {
		super(layer, RubberBandRenderMode.Vertical);
		this
			.setName(name)
			.setEnabled(false)
			.setLineStyle({
				color: "rgba(204, 0, 102, 1)",
				width: 2
			})
			.setFillStyle({
				color: "rgba(204, 0, 102, 0.2)"
			})
			.setAutoDisabled(true)
	}

}