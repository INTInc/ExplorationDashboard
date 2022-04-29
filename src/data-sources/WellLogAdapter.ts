import { DataSource } from './DataSource';
import { DataSourceStatus } from './DataSourceStatus';

import { Las20 } from '@int/geotoolkit/welllog/data/las/Las20';
import { LogData } from '@int/geotoolkit/welllog/data/LogData';

export enum MeasureProperty {
  Start,
  Stop,
  Step
}

export enum MeasureType {
  GR = 'GR',
  CALI = 'CALI',
  NPHI = 'NPHI',
  RHOB = 'RHOB',
  ILD = 'ILD',
  ILM = 'ILM',
  DEPT = 'DEPT',
}

export class WellLogAdapter implements DataSource {
    
    public status: DataSourceStatus = DataSourceStatus.Loading;
    private las: Las20 = new Las20();

    public async load(url: string) {
      try {
        const response = await fetch(url);
        const text = await response.text();
        this.las.parse(text);
        this.status = DataSourceStatus.Ok;
      } catch (e) {
        this.status = DataSourceStatus.Error;
      }
    }

    private properties(property: MeasureProperty) {
      return this.las.getSections()[1].getData()[property]
    }

    private property(propertyIndex: MeasureProperty): number {
      return parseFloat(this.properties(propertyIndex).value);
    }

    private values(type: MeasureType) {
      return this.las.getSectionGroups()[0].getCurveData(type)
    }

    public logData(type: MeasureType) {
      return new LogData({
        depths: this.values(MeasureType.DEPT),
        values: this.values(type)
      });
    }

    public get minDepth(): number {
      return this.property(MeasureProperty.Start);
    }

    public get maxDepth(): number {
      return this.property(MeasureProperty.Stop);
    }
    
}