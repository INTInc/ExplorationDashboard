import { SimpleDataSource } from './SimpleDataSource';
import { DataSourceStatus } from './DataSourceStatus';

import { Las20 } from '@int/geotoolkit/welllog/data/las/Las20';
import { LogData } from '@int/geotoolkit/welllog/data/LogData';
import { LasSectionGroup } from '@int/geotoolkit/welllog/data/las/LasSectionGroup';
import { LasSection } from '@int/geotoolkit/welllog/data/las/LasSection';
import { WellLogProps } from './WellLogProps';


export enum MeasureProperty {
  Start,
  Stop,
  Step
}

export enum Measure {
  GR = 'GR',
  CALI = 'CALI',
  NPHI = 'NPHI',
  RHOB = 'RHOB',
  ILD = 'ILD',
  ILM = 'ILM',
  DEPT = 'DEPT',
}

export class WellLogAdapter extends SimpleDataSource<WellLogProps> {
    public status: DataSourceStatus = DataSourceStatus.Loading;

    protected las: Las20 = new Las20();
    protected curves: LasSectionGroup = new LasSectionGroup();
    protected properties: LasSection = new LasSection();

    private property(propertyIndex: MeasureProperty) {
      return this.properties.getData()[propertyIndex];
    }

    private values(measure: Measure) {
      return this.curves.getCurveData(measure)
    }

    private info(measure: Measure) {
      return this.curves.getCurveInfo(measure)
    }

    public logData(maybeMeasure: string): LogData {
      const measure = maybeMeasure as Measure;
      return new LogData({
        name: measure,
        depths: this.values(Measure.DEPT),
        values: this.values(measure)
      })
        .setValueUnit(this.info(measure).getUnit())
    }

    public get unit(): string {
      return this.property(MeasureProperty.Start).getUnit()
    }

    public get minDepth(): number {
      return parseFloat(this.property(MeasureProperty.Start).value);
    }

    public get maxDepth(): number {
      return parseFloat(this.property(MeasureProperty.Stop).value);
    }
    
}