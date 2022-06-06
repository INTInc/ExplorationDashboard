import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { Node } from '@int/geotoolkit/scene/Node';
import { LogData } from '@int/geotoolkit/welllog/data/LogData';
import { WellLogSource } from '@/components/well-log/WellLogSource';
import { Range } from '@int/geotoolkit/util/Range';

export class WellB32 extends WellLogSource  {

  public getBinding(): DataBinding {
    return {
      accept: (node: Node) => node instanceof LogCurve,
      unbind: (node) => {
        if (node instanceof LogCurve) {
          const curve = node as LogCurve;
          curve.setData({}, false)
        }
      },
      bind: (node: Node) => {
        if (node instanceof LogCurve) {
          const curve = node as LogCurve;
          curve.setData(this.curveData(curve.getName()), false)
        }
      }
    };
  }

  public getLimits(): Range {
    return new Range(2050, 4500);
  }

  private curveData(curveName: string): LogData {
    return curveName === 'GR'
      ? this.measurements.logData(curveName, this.indexMeasurement)
      : this.tops.logData(curveName, this.indexMeasurement)
  }
}