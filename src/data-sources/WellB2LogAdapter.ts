import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { Node } from '@int/geotoolkit/scene/Node';
import { WellLogAdapter } from './WellLogAdapter';
import { DataSourceStatus } from './DataSourceStatus';

export class WellB2LogAdapter extends WellLogAdapter {

  public async load(): Promise<this> {
    this.checkUrl();
    
    try {
      const response = await fetch(this.url);
      const text = await response.text();
      this.las.parse(text);
      this.curves = this.las.getSectionGroups()[0];
      this.properties = this.las.getSections()[1];
      this.status = DataSourceStatus.Ok;
    } catch (e) {
      this.status = DataSourceStatus.Error;
    }

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