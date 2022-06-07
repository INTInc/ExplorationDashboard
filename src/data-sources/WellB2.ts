import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { Node } from '@int/geotoolkit/scene/Node';
import { WellLogSource } from '@/components/well-log/WellLogSource';
import { CompositeLogCurve } from '@int/geotoolkit/welllog/CompositeLogCurve';
import { Range } from '@int/geotoolkit/util/Range';
import { MathUtil } from '@int/geotoolkit/util/MathUtil';

export class WellB2 extends WellLogSource {

  public getBinding(): DataBinding {
    return {
      accept: (node: Node) => node instanceof CompositeLogCurve,
      unbind: (node) => {
        if (node instanceof CompositeLogCurve) {
          node.setData({}, false);
        }
      },
      bind: (node: Node) => {
        if (node instanceof CompositeLogCurve) {
          node.setData(this.measurements.logData(node.getName(), this.indexMeasurement), false);
        }
      }
    };
  }

  public getLimits(): Range {
    const indexValues = this.measurements.values(this.indexMeasurement || '');
    const indexLimits = MathUtil.getLimits(indexValues);
    return new Range(indexLimits[0], indexLimits[1]);
  }

} 