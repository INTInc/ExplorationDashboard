import {Plot} from '@int/geotoolkit3d/Plot';
import {StretchablePlot3} from '@/common/layout/StretchablePlot3';
import {Wells3DBox} from '@/components/wells-3d/Wells3DBox';
import {Grid} from '@int/geotoolkit3d/scene/grid/Grid';
import {Well} from '@/data-sources/Well';
import {Object3D, Vector3} from '@int/geotoolkit3d/THREE';
import {WellAnnotations} from '@/common/model/WellAnnotations';
import {TrajectoryMode, WellTrajectory} from '@/components/wells-3d/objects/WellTrajectory';
import {WellLogCurve} from '@/components/wells-3d/objects/WellLogCurve';
import {MathUtil} from '@int/geotoolkit/util/MathUtil';
import {WellStaticPoint} from '@/components/wells-3d/objects/WellStaticPoint';
import {WellCursor} from '@/components/wells-3d/objects/WellCursor';

export class Wells3D {

    private plot: Plot;
    private root: Object3D;
    private box: Wells3DBox;
    private logs: WellLogCurve[];
    private trajectories: WellTrajectory[];
    private cursors: Map<Well, WellCursor> = new Map();
    private depthMarkers: WellStaticPoint[] = [];

    protected grid: Grid;
    protected wellNames: WellStaticPoint[] = [];

    constructor (
        private containerElement: HTMLElement,
        private referenceElement: HTMLElement,
        private compassContainerElement: HTMLElement,
        private wells: Well[],
        private annotations: Map<Well, WellAnnotations>,
        private measurement: string | null,
        private cameraDistance: number,
        private modelPadding: number
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
    }

    public moveCursor (well: Well, depth: number | null) {
        const cursor = this.cursors.get(well);
        if (cursor) cursor.setDepth(depth || 0);
    }

    public setTrajectoriesMode (mode: TrajectoryMode) {
        this.trajectories.forEach(t => t.setMode(mode));
        this.depthMarkers.forEach(m => m.setVisible(mode === TrajectoryMode.Line));
    }

    private createPlot (): Plot {
        const plot = new StretchablePlot3({
            container: this.containerElement,
            renderer: {
                parameters: {
                    alpha: true
                },
                clearcolor: 0x000000,
                clearcoloralpha: 0
            },
            compass: {
                container: this.compassContainerElement
            }
        });

        plot.setRefElement(this.referenceElement);
        return plot;
    }

    private createWellsBox (): Wells3DBox {
        return new Wells3DBox(this.wells);
    }

    private createBoxGrid (): Grid {
        const box = this.box;
        const padding = this.modelPadding;

        return new Grid({
            start: new Vector3(-padding, -box.width / 2 - padding, 0),
            end: new Vector3(box.length + padding, box.width / 2 + padding, -box.height),
            modelstart: new Vector3(box.xLimits.getHigh() - padding, box.yLimits.getLow() - padding, box.zLimits.getLow()),
            modelend: new Vector3(box.xLimits.getHigh() + padding, box.yLimits.getHigh() + padding, box.zLimits.getHigh())
        });
    }

    private createWellLogs (): WellLogCurve[] {
        return this.measurement ?
            this.wells.map(well => new WellLogCurve(well, this.measurement as string, '#c00000', '#ffc000', 75)) :
            [];
    }

    private createWellTrajectories (): WellTrajectory[] {
        return this.wells.map(well => new WellTrajectory(well));
    }

    private createCursor (well: Well) {
        const cursor = new WellCursor(well, 'darkred', 150);
        this.cursors.set(well, cursor);
        this.root.add(cursor);
    }

    private createDepthMarkers (well: Well) {
        const annotations = this.annotations.get(well);
        if (annotations) {
            annotations.data.forEach(annotation => {
                const marker = new WellStaticPoint(well, annotation.getDepth('DEPT') || 0, 30, annotation.getColor(), annotation.getText());
                this.depthMarkers.push(marker);
                this.root.add(marker);
            });
        }
    }

    private createWellName (well: Well) {
        const depth = MathUtil.getMax(well.surveys.values('MD'));
        const marker = new WellStaticPoint(well, depth, 30, 'transparent', well.surveys.wellName || '');
        this.wellNames.push(marker);
        this.root.add(marker);
    }

    private setCamera () {
        this.plot
            .setCameraLocation(new Vector3(this.box.length * 2, -this.cameraDistance, this.box.height / 2))
            .setCameraLookAt(new Vector3(this.box.length / 2, this.box.width / 2, -this.box.height));
    }
}
