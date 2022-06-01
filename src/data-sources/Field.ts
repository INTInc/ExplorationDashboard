import { GeodeticSystem } from '@int/geotoolkit/map/GeodeticSystem';
import { Transformer } from '@int/geotoolkit/map/coordinatesystems/Transformer';
import { Point } from '@int/geotoolkit/util/Point';
import { DataSource } from '@/common/model/DataSource';

export interface Coordinates {
  x: number[],
  y: number[]
}

export interface NamedCoordinates extends Coordinates {
  name: string
}

export class Field extends DataSource<Field> {

  private rawData: any;
  private transformer: Transformer = new Transformer({
    initialcoordinatesystem: GeodeticSystem.LatLon,
    targetcoordinatesystem: GeodeticSystem.WGS84
  });

  private checkUrl(url: string) {
    if (!url.trim().length) throw new Error(`Url for data source ${this.constructor.name} is not specified`);
  }

  public async setUrl(url: string) {
    this.checkUrl(url);

    try {
      const response = await fetch(url);
      const json = await response.json() as [][];
      this.rawData = Object.values(json[0])[0];
      this.loading.resolve(this);
    } catch (e: unknown) {
      console.log(`Error loading exploration field data: ${e}`)
    }
  }

  private parsePointCoordinates(rawPoint: string): number[] {
    return rawPoint.split(',').map(str => str.trim()).map(str => parseFloat(str)).reverse();
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