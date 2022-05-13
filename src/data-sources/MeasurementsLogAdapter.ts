import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { Range } from '@int/geotoolkit/util/Range';
import { Node } from '@int/geotoolkit/scene/Node';
import { WellLogAdapter } from './WellLogAdapter';
import { DataSourceStatus } from './DataSourceStatus';
import { LasWrapper } from './LasWrapper';

export class MeasurementsLogAdapter extends WellLogAdapter {

  private measurementsLas: LasWrapper = new LasWrapper(); 

  public async load(): Promise<void> {
    this.checkUrl(this.url);
    
    try {
      const response = await fetch(this.url);
      const text = await response.text();
      this.measurementsLas.setSource(text);
      this.status = DataSourceStatus.Ok;
    } catch (e) {
      this.status = DataSourceStatus.Error;
    }
  }

  public get binding(): DataBinding {
    return {
      accept: (node: Node) => node instanceof LogCurve,
      unbind: (curve: LogCurve) => curve.setData({}, false),
      bind: (curve: LogCurve, data: any) => curve.setData(this.measurementsLas.logData(curve.getName()), false)
    };
  }

  public get limits(): Range {
    return this.measurementsLas.depthLimits;
  }

} 