import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { Node } from '@int/geotoolkit/scene/Node';
import { LogData } from '@int/geotoolkit/welllog/data/LogData';
import { Well } from '@/data-sources/Well';
import { WellLogSource } from '@/components/well-log/WellLogSource';

export class WellB32 extends Well implements WellLogSource  {

  private curveData(curveName: string): LogData {
    return curveName === 'GR'
      ? this.measurements.logData(curveName)
      : this.tops.logData(curveName, 'MD')
  }

  public get binding(): DataBinding {
    return {
      accept: (node: Node) => node instanceof LogCurve,
      unbind: (curve: LogCurve) => curve.setData({}, false),
      bind: (curve: LogCurve) => curve.setData(this.curveData(curve.getName()), false)
    };
  }

}