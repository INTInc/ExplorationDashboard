import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { Node } from '@int/geotoolkit/scene/Node';
import { Well } from '@/data-sources/Well';
import { WellLogSource } from '@/components/well-log/WellLogSource';

export class WellB2 extends Well implements WellLogSource {

  public get binding(): DataBinding {
    return {
      accept: (node: Node) => node instanceof LogCurve,
      unbind: (curve: LogCurve) => curve.setData({}, false),
      bind: (curve: LogCurve) => curve.setData(this.measurements.logData(curve.getName()), false)
    };
  }

} 