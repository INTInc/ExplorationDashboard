import { Object3D } from '@int/geotoolkit3d/scene/Object3D';
import { Well } from '@/data-sources/Well';
import { Vector3 } from '@int/geotoolkit3d/THREE';
import { MathUtil } from '@int/geotoolkit/util/MathUtil';

export class WellDepthMarker extends Object3D {

	constructor(
		protected well: Well,
		protected depth?: number
	) {
		super();
		this.position.copy(this.vectorByIndex(depth ? this.indexByDepth(depth) : 0));
	}

	protected indexByDepth(depth: number) {
		const exactIndex: number =  this.well.surveys.values('MD').indexOf(depth);
		return (exactIndex > 0)
			? exactIndex
			: this.deviatedIndex( 'MD', depth);
	}

	protected vectorByIndex(index: number): Vector3 {
		return new Vector3(
			this.well.surveys.values('DX')[index],
			this.well.surveys.values('DY')[index],
			this.well.surveys.values('Z')[index]
		);
	}

	private deviatedIndex(measurement: string, value: number) {
		//TODO improve this, there must be more performant algorithm
		const values = this.well.surveys.values(measurement);
		const deviations = values.map(item => Math.abs(Math.abs(item) - value));

		const minDev = MathUtil.getMin(deviations);
		return deviations.indexOf(minDev);
	}
}
