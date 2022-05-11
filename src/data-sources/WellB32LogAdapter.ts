import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { Node } from '@int/geotoolkit/scene/Node';
import { WellLogAdapter } from './WellLogAdapter';

export class WellB32LogAdapter extends WellLogAdapter {

  public async load() {
    return this;
  }

  public get dataBinding(): DataBinding {
    return {
      accept: (node: Node) => node instanceof LogCurve,
      unbind: (curve: LogCurve) => curve.setData({}, false),
      bind: (curve: LogCurve, data: any) => curve.setData(this.logData(curve.getName()), false)
    };
  }

}