import { Range } from "@int/geotoolkit/util/Range";
import { Las20 } from "@int/geotoolkit/welllog/data/las/Las20";
import { LasSection } from "@int/geotoolkit/welllog/data/las/LasSection";
import { LasSectionGroup } from "@int/geotoolkit/welllog/data/las/LasSectionGroup";
import { LogData } from "@int/geotoolkit/welllog/data/LogData";

enum MeasureProperty {
  Start,
  Stop,
  Step
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

  private property(propertyIndex: MeasureProperty) {
    return this.properties.getData()[propertyIndex];
  }

  private values(measure: Measure) {
    return this.curves.getCurveData(measure)
  }

  private info(measure: Measure) {
    return this.curves.getCurveInfo(measure)
  }

  public setSource(text: string): LasWrapper {
    this.las.parse(text);
    this.curves = this.las.getSectionGroups()[0];
    this.properties = this.las.getSections()[1];

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

  public get depthLimits(): Range {
    return new Range(
      parseFloat(this.property(MeasureProperty.Start).value),
      parseFloat(this.property(MeasureProperty.Stop).value)
    );
  }

}