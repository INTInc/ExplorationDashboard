import {Well} from '@/data-sources/Well';
import {TrajectoryTube} from '@int/geotoolkit3d/scene/well/TrajectoryTube';
import {Object3D} from '@int/geotoolkit3d/scene/Object3D';
import {Line, LineBasicMaterial} from '@int/geotoolkit3d/THREE';
import {LineGeometry} from '@int/geotoolkit3d/scene/well/LineGeometry';

export enum TrajectoryMode {
    Line,
    Tube
}

export class WellTrajectory extends Object3D {

    private line: Line;
    private tube: TrajectoryTube;

    constructor (
        private well: Well,
        private color: string = '#00aa00'
    ) {
        super();
        this.line = this.createTrajectoryLine();
        this.tube = this.createTrajectoryTube();
        this.setMode(TrajectoryMode.Line);
        this
            .add(this.line)
            .add(this.tube);
    }

    public setMode (mode: TrajectoryMode) {
        this.line.visible = mode === TrajectoryMode.Line;
        this.tube.visible = mode === TrajectoryMode.Tube;
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
