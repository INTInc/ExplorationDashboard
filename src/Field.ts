import { Path } from '@int/geotoolkit/scene/shapes/Path';
import { Polygon } from '@int/geotoolkit/scene/shapes/Polygon';
import { GeodeticSystem } from '@int/geotoolkit/map/GeodeticSystem';
import { Transformer } from '@int/geotoolkit/map/coordinatesystems/Transformer';
import { Shape } from '@int/geotoolkit/scene/shapes/Shape';
import { RgbaColor } from '@int/geotoolkit/util/RgbaColor';
import { Point } from '@int/geotoolkit/util/Point';

const PRIMARY_COLOR = new RgbaColor(140, 104, 205, 1);
const PRIMARY_TRANSPARENT_COLOR = new RgbaColor(140, 104, 205, 0.5);

interface Coordinates {
    x: number[],
    y: number[]
}

export class Field {
    
    private rawData: any;
    private transformer: Transformer;

    constructor(
       private jsonUrl: string
    ) {
       this.transformer = this.createTransformer();
    }

    private createTransformer() {
        return new Transformer({
            initialcoordinatesystem: GeodeticSystem.LatLon,
            targetcoordinatesystem: GeodeticSystem.WGS84
        });
    }

    public async load() {
        const response = await fetch(this.jsonUrl);
        const json = await response.json() as Array<any>;

        this.rawData = Object.values(json[0])[0];
    }

    private parsePointCoordinates(rawPoint: string): number[] {
        return rawPoint.split(', ').map(str => parseFloat(str)).reverse();
    }

    private transformPoint(rawPoint: string) {
        return this.transformer.transformPoint(new Point(...this.parsePointCoordinates(rawPoint)));
    }

    private transformPath(rawPath: string[]): Coordinates {
        const initialPath: Coordinates = { x: [], y: [] };

        rawPath.forEach((rawPoint: string) => {
            const initialPoint = this.parsePointCoordinates(rawPoint);

            initialPath.x.push(initialPoint[0]);
            initialPath.y.push(initialPoint[1])
        })

        return this.transformer.transformPolygon(initialPath) as Coordinates;
    }

    public get zone(): Shape {
        return new Polygon({
            ...this.transformPath(this.rawData['zone']['path']),
        })
            .setFillStyle({
                color: PRIMARY_TRANSPARENT_COLOR
            })
            .setLineStyle({
                color: PRIMARY_COLOR,
                width: 3
            })
            .setName(this.name)
    }

    public get wells(): Shape[] {
        return this.rawData['wells'].map((rawWell: any) => {
            
            const {x, y} = this.transformPath(rawWell['path']);
            const path = new Path({})
                .setLineStyle({
                    color: PRIMARY_COLOR,
                    width: 3
                })
                .setName(rawWell['name'])
                .moveTo(x[0], y[0]);

            for (let i = 1; i < rawWell['path'].length; i++) path.lineTo(x[i], y[i]);

            return path;
        });
    }

    public get name(): string {
        return this.rawData['fieldname'];
    }

    public get position(): Point {
        return this.transformPoint(this.rawData['position']);
    }
    
}