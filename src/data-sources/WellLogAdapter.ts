import { DataSource } from './DataSource';
import { DataSourceStatus } from './DataSourceStatus';

import { Las20 } from '@int/geotoolkit/welllog/data/las/Las20';
import { LogData } from '@int/geotoolkit/welllog/data/LogData';

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

    private values(type: MeasureType) {
      return this.las.getSectionGroups()[0].getCurveData(type)
    }

    public logData(type: MeasureType) {
      return new LogData({
        depths: this.values(type).map((v,i) => 4500 + i * 10),
        values: this.values(type)
      });
    }
    
}