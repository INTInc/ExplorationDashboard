import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { Range } from '@int/geotoolkit/util/Range';
import { Node } from '@int/geotoolkit/scene/Node';
import { LogData } from '@int/geotoolkit/welllog/data/LogData';
import { Well } from '@/common/Well';

export class MeasurementsTopsLogAdapter extends Well {

  private curveData(curveName: string): LogData {
    return curveName === 'GR'
      ? this.measurements.logData(curveName)
      : this.tops.logData(curveName, 'MD')
  }

  public get binding(): DataBinding {
    return {
      accept: (node: Node) => node instanceof LogCurve,
      unbind: (curve: LogCurve) => curve.setData({}, false),
      bind: (curve: LogCurve, data: any) => curve.setData(this.curveData(curve.getName()), false)
    };
  }

  public get limits(): Range {
    //return this.topsLas.depthLimits;
    //TODO: FIX THAT
    return new Range(1050, 4000);
  }

}