import { Plot } from '@int/geotoolkit3d/Plot';
import { StretchablePlot3 } from '@/common/layout/StretchablePlot3';
import { Wells3DBox } from '@/components/wells-3d/Wells3DBox';
import { Grid } from '@int/geotoolkit3d/scene/grid/Grid';
import { Well } from '@/data-sources/Well';
import { Object3D, Vector3 } from '@int/geotoolkit3d/THREE'
import { WellAnnotations } from '@/common/model/WellAnnotations';
import { WellTrajectory } from '@/components/wells-3d/objects/WellTrajectory';
import { WellLogCurve } from '@/components/wells-3d/objects/WellLogCurve';
import { WellDepthMarker } from '@/components/wells-3d/objects/WellDepthMarker';
import { MathUtil } from '@int/geotoolkit/util/MathUtil';
import { Deferred } from '@/common/model/Deferred';

export class Wells3D {

	protected plot: Plot;
	protected root: Object3D;
	protected box: Wells3DBox;
	protected grid: Grid;
	protected logs: WellLogCurve[];
	protected trajectories: WellTrajectory[];
	protected cursors: Map<Well, WellDepthMarker> = new Map();
	protected depthMarkers: WellDepthMarker[] = [];
	protected wellNames: WellDepthMarker[] = [];

	private initialization = new Deferred<Wells3D>();

	constructor(
		private containerElement: HTMLElement,
		private referenceElement: HTMLElement,
		private wells: Well[],
		private annotations: Map<Well, WellAnnotations>,
		private measurement: string | null,
		private cameraDistance: number,
		private modelPadding: number,
		private showWellNames: boolean,
		private showAnnotations: boolean,
		private transparentScene: boolean
	) {
		this.plot = this.createPlot();
		this.root = this.plot.getRoot();
		this.box = this.createWellsBox();
		this.grid = this.createBoxGrid();
		this.logs = this.createWellLogs();
		this.trajectories = this.createWellTrajectories();

		this.plot.getRoot()
			.add(this.grid)
			.add(...this.logs)
			.add(...this.trajectories);

		this.wells.forEach(well => {
			this.createCursor(well);
			this.createWellName(well);
			this.createDepthMarkers(well);
		});

		this.setCamera();
		this.initialization.resolve(this);
	}

	private createPlot(): Plot {
		const plot = new StretchablePlot3({
			container: this.containerElement,
			renderer: {
				parameters: {
					alpha: this.transparentScene
				},
				clearcolor: 0x000000,
				clearcoloralpha: this.transparentScene ? 0 : 1
			}
		});

		plot.setRefElement(this.referenceElement);
		return plot;
	}

	private createWellsBox(): Wells3DBox {
		return new Wells3DBox(this.wells);
	}

	private createBoxGrid(): Grid {
		const box = this.box;
		const padding = this.modelPadding;

		return new Grid({
			start: new Vector3(-padding, -box.width / 2 - padding, 0),
			end: new Vector3(box.length + padding, box.width / 2 + padding, -box.height),
			modelstart: new Vector3(box.xLimits.getHigh() - padding, box.yLimits.getLow() - padding, box.zLimits.getLow()),
			modelend: new Vector3(box.xLimits.getHigh() + padding, box.yLimits.getHigh() + padding, box.zLimits.getHigh()),
		})
	}

	private createWellLogs(): WellLogCurve[] {
		return this.measurement
			? this.wells.map(well => new WellLogCurve(well, this.measurement as string, '#c00000', '#ffc000', 75))
			: [];
	}

	private createWellTrajectories(): WellTrajectory[] {
		return this.wells.map(well => new WellTrajectory(well));
	}

	private createCursor(well: Well) {
		const cursor = new WellDepthMarker(well, 0, '#c00000');
		this.cursors.set(well, cursor);
		this.root.add(cursor);
	}

	private createDepthMarkers(well: Well) {
		const annotations = this.annotations.get(well);
		if (annotations) {
			annotations.data.forEach(annotation => {
				const marker = new WellDepthMarker(well, annotation.depth || 0, annotation.color, annotation.text);
				this.depthMarkers.push(marker);
				this.root.add(marker);
			})
		}
	}

	private createWellName(well: Well) {
		const depth = MathUtil.getMax(well.surveys.values('MD'));
		const marker = new WellDepthMarker(well, depth, 'transparent', well.surveys.wellName || '');
		this.wellNames.push(marker);
		this.root.add(marker);
	}

	private setCamera() {
		this.plot
			.setCameraLocation(new Vector3(this.box.length * 2, -this.cameraDistance, this.box.height / 2))
			.setCameraLookAt(new Vector3(this.box.length / 2, this.box.width / 2, -this.box.height));
	}

	public get initialized(): Promise<unknown> {
		return this.initialization.promise;
	}
}