import { Well } from '../../common/Well';
import { LineGeometry } from '@int/geotoolkit3d/scene/well/LineGeometry';
import { Line, LineBasicMaterial, Object3D, Vector3 } from '@int/geotoolkit3d/THREE';
import { KnownColors } from '@int/geotoolkit/util/ColorUtil';
import { Wells3DBox } from '@/components/wells-model/Wells3DBox';
import { Grid } from '@int/geotoolkit3d/scene/grid/Grid';

export class Wells3DDrawer {

	private createGeometry(well: Well) {
		return new LineGeometry({
			data: {
				x: well.surveys.values('DX'),
				y: well.surveys.values('DY'),
				z: well.surveys.values('Z')
			}
		})
	}

	private createMaterial() {
		return new LineBasicMaterial({ color: KnownColors.Green })
	}

	public createTrajectory(well: Well): Object3D {
		return new Line(this.createGeometry(well), this.createMaterial());
	}

	public createBoxGrid(box: Wells3DBox, padding: number): Grid {
		return new Grid({
			start: new Vector3(-padding, - box.width / 2 - padding, 0),
			end: new Vector3(box.length + padding, box.width / 2 + padding, - box.height),
			modelstart: new Vector3(box.xLimits.getHigh() - padding,box.yLimits.getLow() - padding, box.zLimits.getLow()),
			modelend: new Vector3(box.xLimits.getHigh() + padding, box.yLimits.getHigh() + padding, box.zLimits.getHigh())
		});
	}

}