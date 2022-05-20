import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { Range } from '@int/geotoolkit/util/Range';
import { Node } from '@int/geotoolkit/scene/Node';
import { Well } from '@/common/Well';

export class WellB2 extends Well {

  public get binding(): DataBinding {
    return {
      accept: (node: Node) => node instanceof LogCurve,
      unbind: (curve: LogCurve) => curve.setData({}, false),
      bind: (curve: LogCurve) => curve.setData(this.measurements.logData(curve.getName()), false)
    };
  }

  public get limits(): Range {
    return this.measurements.depthLimits;
  }

} 