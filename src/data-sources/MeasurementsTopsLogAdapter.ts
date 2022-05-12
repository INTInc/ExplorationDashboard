import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { Node } from '@int/geotoolkit/scene/Node';
import { WellLogAdapter } from './WellLogAdapter';
import { DataSourceStatus } from './DataSourceStatus';

export class MeasurementsTopsLogAdapter extends WellLogAdapter { 

  private topsUrl = '';

  private async loadTops(): Promise<any> {
    return this;
  }

  private async loadMeasures(): Promise<any> {
    return this;
  }

  public setTopsUrl(topsUrl: string) {
    this.topsUrl = topsUrl;
  }

  public async load(): Promise<any> {
    return Promise.all([
      this.loadTops(),
      this.loadMeasures()
    ]);
  }

  public get dataBinding(): DataBinding {
    return {
      accept: (node: Node) => node instanceof LogCurve,
      unbind: (curve: LogCurve) => curve.setData({}, false),
      bind: (curve: LogCurve, data: any) => curve.setData(this.logData(curve.getName()), false)
    };
  }

}