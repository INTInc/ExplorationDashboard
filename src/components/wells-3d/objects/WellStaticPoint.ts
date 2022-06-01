import { WellDepthMarker } from '@/components/wells-3d/objects/WellDepthMarker';
import { Sphere } from '@int/geotoolkit3d/scene/well/schematic/Sphere';
import { FillStyle } from '@int/geotoolkit/attributes/FillStyle';
import { Well } from '@/data-sources/Well';
import { TextStyle } from '@int/geotoolkit/attributes/TextStyle';
import { LineStyle } from '@int/geotoolkit/attributes/LineStyle';
import { AnnotationBase } from '@int/geotoolkit3d/scene/AnnotationBase';
import { Vector3 } from '@int/geotoolkit3d/THREE';

export class WellStaticPoint extends WellDepthMarker {

	private sphere: Sphere;

	constructor(
		well: Well,
		depth: number,
		private radius: number,
		private color: string,
		public label: string

	) {
		super(well, depth);
		this.sphere = this.createSphere();
		this.setAnnotation(label, new TextStyle({color}))
	}

	private createSphere() {
		const sphere = new Sphere({
			data: new Vector3(),
			fillstyle: new FillStyle(this.color),
			radius: this.radius
		});
		this.add(sphere);
		return sphere;
	}

	public getLabel(): string {
		return this.label || '';
	}

	public setAnnotation(label: string, textStyle?: TextStyle, lineStyle?: LineStyle) {
		this.sphere.setAnnotation(new AnnotationBase({
			title: this.label,
			titlestyle: textStyle || new TextStyle({ color: this.color, font: 'bold 11px Arial' }),
			linestyle: lineStyle || new LineStyle('transparent'),
		}))
	}

}