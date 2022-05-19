import { Well } from '@/common/Well';
import { LineGeometry } from '@int/geotoolkit3d/scene/well/LineGeometry';
import { Group, Line, LineBasicMaterial, Object3D, Vector3 } from '@int/geotoolkit3d/THREE';
import { KnownColors } from '@int/geotoolkit/util/ColorUtil';
import { Wells3DBox } from '@/components/wells-model/Wells3DBox';
import { Grid } from '@int/geotoolkit3d/scene/grid/Grid';
import { AnnotationBase } from '@int/geotoolkit3d/scene/AnnotationBase';
import { LineStyle } from '@int/geotoolkit/attributes/LineStyle';
import { TextStyle } from '@int/geotoolkit/attributes/TextStyle';

export class Wells3DDrawer {

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
		return new LineBasicMaterial({ color: KnownColors.Yellow })
	}

	private static createAnnotation(well: Well) {
		const index = well.surveys.values('DX').length - 1;

		const annotation = new AnnotationBase({
			title: well.surveys.wellName,
			titlestyle: new TextStyle({
				font: '12px Arial',
				color: 'yellow'
			}),
			linestyle: new LineStyle({color: 'white'})
		});

		annotation.setAnchorPoint(new Vector3(
			well.surveys.values('DX')[index],
			well.surveys.values('DY')[index],
			well.surveys.values('Z')[index]
		));
		annotation.position.set(
			well.surveys.values('DX')[0],
			well.surveys.values('DY')[0],
			well.surveys.values('Z')[0]
		);

		return annotation;
	}

	public createTrajectory(well: Well): Object3D {
		return new Line(Wells3DDrawer.createGeometry(well), Wells3DDrawer.createMaterial());
	}

	public createNamedTrajectory(well: Well): Object3D {
		return new Group()
			.add(this.createTrajectory(well))
			.add(Wells3DDrawer.createAnnotation(well))
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