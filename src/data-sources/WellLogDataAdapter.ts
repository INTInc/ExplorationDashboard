import { DataSource } from './DataSource';
import { DataSourceStatus } from './DataSourceStatus';

import { Node } from '@int/geotoolkit/scene/Node';
import { Las20 } from '@int/geotoolkit/welllog/data/las/Las20';
import { LogData } from '@int/geotoolkit/welllog/data/LogData';
import { LasSectionGroup } from '@int/geotoolkit/welllog/data/las/LasSectionGroup';
import { LasSection } from '@int/geotoolkit/welllog/data/las/LasSection';
import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';

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

class Limit {
  constructor(
    public left: number = 0,
    public right: number = 0
  ){}
}

const LIMITS = {
  [Measure.CALI]: new Limit(0, 15),
  [Measure.GR]: new Limit(0, 150),
  [Measure.NPHI]: new Limit(0.45, -0.15),
  [Measure.RHOB]: new Limit(1.95, 2.95),
  [Measure.ILD]: new Limit(0, 200),
  [Measure.ILM]: new Limit(0, 200),
  [Measure.DEPT]: new Limit()             // TODO FIX THAT
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

    public logData(maybeMeasure: string): LogData {

      if (maybeMeasure !in Measure) {
        throw new Error('')
      }

      const measure = maybeMeasure as Measure;
      return new LogData({
        depths: this.values(Measure.DEPT),
        values: this.values(measure)
      })
        .setValueUnit(this.info(measure).getUnit())
    }

    public limit(measure: Measure): Limit {
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

    public get dataBinding(): DataBinding {
      return {
        accept: (node: Node) => node instanceof LogCurve,
        bind: (curve: LogCurve) => curve.setData(this.logData(curve.getName())),
        unbind: (curve: LogCurve) => curve.setData()
      };
    }
    
}