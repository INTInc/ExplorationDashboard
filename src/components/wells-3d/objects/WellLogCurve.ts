import {Object3D} from '@int/geotoolkit3d/scene/Object3D';
import {Well} from '@/data-sources/Well';
import {LogCurve2D} from '@int/geotoolkit3d/scene/well/LogCurve2D';
import {LogFill2D} from '@int/geotoolkit3d/scene/well/LogFill2D';
import {Color} from 'three';

type CurveCoordinates = {
    x: number[],
    y: number[],
    z: number[]
}

export class WellLogCurve extends Object3D {

    private readonly coordinates: CurveCoordinates;
    private readonly values: number[];

    constructor (
        private well: Well,
        private measurement: string,
        curveColor: string,
        fillColor: string,
        radius: number
    ) {
        super();
        this.coordinates = this.getCurveCoordinates();
        this.values = this.getCurveValues();
        this
            .add(this.createCurve(curveColor, radius))
            .add(this.createFill(fillColor, radius));
    }

    private getCurveCoordinates (): CurveCoordinates {
        return {
            x: this.well.surveys.values('DX'),
            y: this.well.surveys.values('DY'),
            z: this.well.surveys.values('Z')
        };
    }

    private getCurveValues (): number[] {
        return this.well.surveys.values(this.measurement);
    }

    private createCurve (color: string, radius: number): LogCurve2D {
        return new LogCurve2D({
            data: {
                ...this.coordinates,
                values: this.values,
                nullvalue: this.well.surveys.nullValue
            },
            color,
            radius
        });
    }

    private createFill (color: string, radius: number): LogFill2D {
        return new LogFill2D({
            data: {
                ...this.coordinates,
                curvevalues1: this.values
            },
            colorprovider: new Color(color),
            radius
        });
    }

}
