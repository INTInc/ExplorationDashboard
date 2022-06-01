import { WellDepthMarker } from '@/components/wells-3d/objects/WellDepthMarker';
import { Well } from '@/data-sources/Well';
import { FilledEllipseGeometry } from '@int/geotoolkit3d/scene/ellipse/FilledEllipseGeometry';
import { DoubleSide, Line, LineBasicMaterial, Mesh, MeshBasicMaterial } from '@int/geotoolkit3d/THREE';
import { EllipseGeometry } from '@int/geotoolkit3d/scene/ellipse/EllipseGeometry';

export class WellCursor extends WellDepthMarker {

	constructor(
		well: Well,
		private color: string = 'darkred',
		private radius: number = 75
	) {
		super(well);
		this.add(this.createLine());
		this.add(this.createFill());
	}

	private createLine() {
		const line = new Line(new EllipseGeometry(), new LineBasicMaterial({color: this.color}));
		line.rotation.set(0, 0, 0);
		line.scale.set(this.radius, this.radius, 1);

		return line;
	}

	private createFill() {
		const mesh = new Mesh(new FilledEllipseGeometry(), new MeshBasicMaterial({
			color: this.color,
			side: DoubleSide,
			transparent: true,
			opacity: 0.8
		}));
		mesh.rotation.set(0, 0, 0);
		mesh.scale.set(this.radius, this.radius, 1);

		return mesh;
	}

	public setDepth(depth: number) {
		const index = this.indexByDepth(depth);
		this.position.copy(this.vectorByIndex(index));
		this.lookAt(this.vectorByIndex(index + 1))
		this.invalidateObject();
	}

}