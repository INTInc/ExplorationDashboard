import { GeodeticSystem } from '@int/geotoolkit/map/GeodeticSystem';
import { Transformer } from '@int/geotoolkit/map/coordinatesystems/Transformer';
import { Point } from '@int/geotoolkit/util/Point';

import { DataSourceStatus } from './DataSourceStatus';
import { SimpleDataSource } from './SimpleDataSource';

export interface Coordinates {
  x: number[],
  y: number[]
}

export interface NamedCoordinates extends Coordinates {
  name: string
}

export class ExplorationMapAdapter extends SimpleDataSource<any> {
    
    public status: DataSourceStatus = DataSourceStatus.Loading;

    private rawData: any;
    private transformer: Transformer;

    constructor()
    {
      super();
      this.transformer = this.createTransformer();
    }

    private createTransformer() {
        return new Transformer({
            initialcoordinatesystem: GeodeticSystem.LatLon,
            targetcoordinatesystem: GeodeticSystem.WGS84
        });
    }

    public async load() {
      this.checkUrl(this.url);

      try {
        const response = await fetch(this.url);
        const json = await response.json() as Array<any>;
        this.status = DataSourceStatus.Ok;
        this.rawData = Object.values(json[0])[0];
      } catch (e) {
        this.status = DataSourceStatus.Error;
      }
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

    public get explorationName(): string {
        return this.rawData['fieldname'];
    }

    public get explorationCoordinates(): Point {
        return this.transformPoint(this.rawData['position']);
    }

    public get zoneCoordinates(): NamedCoordinates {
        return {
            name: this.explorationName,
            ...this.transformPath(this.rawData['zone']['path'])
        }
    }

    public get wellsCoordinates(): NamedCoordinates[] {
        return this.rawData['wells'].map((rawWell: any) => ({
            name: rawWell['name'],
            ...this.transformPath(rawWell['path'])
        }));
    }
    
}