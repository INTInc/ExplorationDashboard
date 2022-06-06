import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { Node } from '@int/geotoolkit/scene/Node';
import { WellLogSource } from '@/components/well-log/WellLogSource';
import { Range } from '@int/geotoolkit/util/Range';

export class WellB2 extends WellLogSource {

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
          const curve = node as LogCurve;curve.setData(this.measurements.logData(curve.getName(), this.indexMeasurement), false)
        }
      }
    };
  }

  public getLimits(): Range {
    const indexMeasurements = this.measurements.logData(this.indexMeasurement as string);
    return new Range(indexMeasurements.getMinDepth(), indexMeasurements.getMaxDepth());
  }

} 