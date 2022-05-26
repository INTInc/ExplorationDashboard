import { Range } from "@int/geotoolkit/util/Range";
import { Las20 } from "@int/geotoolkit/welllog/data/las/Las20";
import { LasSection } from "@int/geotoolkit/welllog/data/las/LasSection";
import { LasSectionGroup } from "@int/geotoolkit/welllog/data/las/LasSectionGroup";
import { LogData } from "@int/geotoolkit/welllog/data/LogData";

enum MeasureProperty {
  Start,
  Stop,
  Step,
  Null,
  Well = 5,
}

enum Measure {
  MD = 'MD',
  GR = 'GR',
  CALI = 'CALI',
  NPHI = 'NPHI',
  RHOB = 'RHOB',
  ILD = 'ILD',
  ILM = 'ILM',
  DEPT = 'DEPT',
}

export class LasWrapper {

  private las: Las20 = new Las20();
  private curves: LasSectionGroup = new LasSectionGroup();
  private properties: LasSection = new LasSection();
  private sourceLoaded = false;

  private property(propertyIndex: MeasureProperty) {
    return this.sourceLoaded ? this.properties.getData()[propertyIndex] : null;
  }

  private info(measure: Measure) {
    return this.curves.getCurveInfo(measure)
  }

  public setSource(text: string): LasWrapper {
    this.las.parse(text);
    this.curves = this.las.getSectionGroups()[0];
    this.properties = this.las.getSections()[1];
    this.sourceLoaded = true;

    return this;
  }

  public logData(valuesKey: string, depthsKey = 'DEPT'): LogData {
    return new LogData({
      name: valuesKey,
      depths: this.values(depthsKey as Measure),
      values: this.values(valuesKey as Measure)
    })
      .setValueUnit(this.info(valuesKey as Measure).getUnit())
  }

  public values(measure: string): number[] {
    if (this.containMeasure(measure)) {
      return this.curves.getCurveData(measure);
    } else {
      console.warn(`Provided data not include measurement named ${measure}`);
      return [];
    }
  }

  public containMeasure(measure: string): boolean {
    return this.curves.getCurveMnemonics().includes(measure);
  }

  public get depthLimits(): Range {
    return new Range(
      parseFloat(this.property(MeasureProperty.Start).value),
      parseFloat(this.property(MeasureProperty.Stop).value)
    );
  }

  public get wellName(): string | null {
    return this.property(MeasureProperty.Well).value;
  }

  public get nullValue(): number | null {
    return this.property(MeasureProperty.Null).value;
  }

  public get length(): number {
    return this.values(this.curves.getCurveMnemonics()[0]).length
  }

}