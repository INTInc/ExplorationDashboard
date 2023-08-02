import {Well} from '@/data-sources/Well';
import {TrajectoryTube} from '@int/geotoolkit3d/scene/well/TrajectoryTube';
import {Object3D} from '@int/geotoolkit3d/scene/Object3D';
import {Line, LineBasicMaterial} from 'three';
import {LineGeometry} from '@int/geotoolkit3d/scene/well/LineGeometry';

export enum TrajectoryMode {
    Line,
    Tube
}

export class WellTrajectory extends Object3D {

    private line?: Line;
    private tube?: TrajectoryTube;
    private mode: TrajectoryMode = TrajectoryMode.Line;

    constructor (
        private well: Well,
        private color: string = '#5dd95d'
    ) {
        super();
        this.createChildren();
    }

    public setMode (mode: TrajectoryMode) {
        this.mode = mode;
        (this.line as Line).visible = mode === TrajectoryMode.Line;
        (this.tube as TrajectoryTube).visible = mode === TrajectoryMode.Tube;
    }

    public setColor (color: string) {
        this.color = color;
        this.removeChildren();
        this.createChildren();
    }

    private removeChildren () {
        if (this.line) this.remove(this.line);
        if (this.tube) this.remove(this.tube);
    }

    private createChildren () {
        this.line = this.createTrajectoryLine();
        this.tube = this.createTrajectoryTube();
        this.setMode(this.mode);
        this
            .add(this.line)
            .add(this.tube);
    }

    private createTrajectoryLine () {
        const geometry = new LineGeometry({data: this.getTrajectoryData()});
        const material = new LineBasicMaterial({color: this.color, linewidth: 5});
        return new Line(geometry, material);
    }

    private createTrajectoryTube () {
        return new TrajectoryTube({
            data: this.getTrajectoryData(),
            colorprovider: this.color,
            size: 20,
            closed: true
        });
    }

    private getTrajectoryData () {
        return {
            x: this.well.surveys.values('DX'),
            y: this.well.surveys.values('DY'),
            z: this.well.surveys.values('Z')
        };
    }

}
