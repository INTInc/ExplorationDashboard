import { DataSource } from './DataSource';
import { DataSourceStatus } from './DataSourceStatus';

import { Las20 } from '@int/geotoolkit/welllog/data/las/Las20';
import { LogData } from '@int/geotoolkit/welllog/data/LogData';
import { LasSectionGroup } from '@int/geotoolkit/welllog/data/las/LasSectionGroup';
import { LasSection } from '@int/geotoolkit/welllog/data/las/LasSection';
import { Range } from '@int/geotoolkit/util/Range';

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

const LIMITS = {
  [Measure.CALI]: new Range(0, 15),
  [Measure.GR]: new Range(0, 150),
  [Measure.NPHI]: new Range(0, 0.45),
  [Measure.RHOB]: new Range(1.95, 2.95),
  [Measure.ILD]: new Range(0.2, 2000),
  [Measure.ILM]: new Range(0.2, 2000),
  [Measure.DEPT]: new Range()             // TODO FIX THAT
}

export class WellLogAdapter implements DataSource {
    
    public status: DataSourceStatus = DataSourceStatus.Loading;

    private las: Las20 = new Las20();
    private curves: LasSectionGroup = new LasSectionGroup();
    private properties: LasSection = new LasSection();

    public async load(url: string) {
      try {
        const response = await fetch(url);
        const text = await response.text();
        this.las.parse(text);
        this.curves = this.las.getSectionGroups()[0];
        this.properties = this.las.getSections()[1];
        this.status = DataSourceStatus.Ok;
      } catch (e) {
        this.status = DataSourceStatus.Error;
      }
    }

    private property(propertyIndex: MeasureProperty) {
      return this.properties.getData()[propertyIndex];
    }

    private values(measure: Measure) {
      return this.curves.getCurveData(measure)
    }

    private info(measure: Measure) {
      return this.curves.getCurveInfo(measure)
    }

    public logData(measure: Measure) {
      return new LogData({
        depths: this.values(Measure.DEPT),
        values: this.values(measure)
      })
        .setValueUnit(this.info(measure).getUnit())
    }

    public limit(measure: Measure): Range {
      return LIMITS[measure];
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