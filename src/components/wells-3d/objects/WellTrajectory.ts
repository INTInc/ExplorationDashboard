import { Well } from '@/data-sources/Well';
import { Line, LineBasicMaterial } from '@int/geotoolkit3d/THREE';
import { LineGeometry } from '@int/geotoolkit3d/scene/well/LineGeometry';

export class WellTrajectory extends Line {

	constructor(well: Well) {
		super(WellTrajectory.createGeometry(well), WellTrajectory.createMaterial());
	}

	private static createGeometry(well: Well) {
		return new LineGeometry({
			data: {
				x: well.surveys.values('DX'),
				y: well.surveys.values('DY'),
				z: well.surveys.values('Z')
			}
		})
	}

	private static createMaterial() {
		return new LineBasicMaterial({ color: '#00aa00', linewidth: 5 })
	}

}