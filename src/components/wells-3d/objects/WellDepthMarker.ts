import { Object3D } from '@int/geotoolkit3d/scene/Object3D';
import { Well } from '@/data-sources/Well';
import { Vector3 } from '@int/geotoolkit3d/THREE';
import { MathUtil } from '@int/geotoolkit/util/MathUtil';
import { Sphere } from '@int/geotoolkit3d/scene/well/schematic/Sphere';
import { FillStyle } from '@int/geotoolkit/attributes/FillStyle';
import { AnnotationBase } from '@int/geotoolkit3d/scene/AnnotationBase';
import { LineStyle } from '@int/geotoolkit/attributes/LineStyle';
import { TextStyle } from '@int/geotoolkit/attributes/TextStyle';

export class WellDepthMarker extends Object3D {

	private marker;

	constructor(
		private well: Well,
		private depth: number,
		public radius: number,
		public color?: string,
		public label?: string
	) {
		super();
		this.marker = this.createMarker();
		if (label) this.setAnnotation(label);
	}

	private createMarker() {
		const sphere = new Sphere({
			data: this.trajectoryPoint(this.depth),
			fillstyle: new FillStyle(this.color),
			radius: this.radius
		});
		sphere.position.copy(this.vectorByIndex(0));
		this.add(sphere);
		return sphere;
	}

	public setAnnotation(label: string, textStyle?: TextStyle, lineStyle?: LineStyle) {
		this.marker.setAnnotation(new AnnotationBase({
			title: this.label,
			titlestyle: textStyle || new TextStyle({ color: this.color, font: 'bold 11px Arial' }),
			linestyle: lineStyle || new LineStyle('transparent'),
		}))
	}

	private trajectoryPoint(depth: number): Vector3 {
		const exactIndex: number =  this.well.surveys.values('MD').indexOf(depth);
		return (exactIndex > 0)
			? this.vectorByIndex(exactIndex)
			: this.vectorByIndex(this.deviatedIndex( 'MD', depth));
	}

	private vectorByIndex(index: number): Vector3 {
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

	public moveTo(depth: number) {
		this.marker.position.copy(this.trajectoryPoint(depth));
		this.marker.invalidateObject();
	}
}
