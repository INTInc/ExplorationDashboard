import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { Range } from '@int/geotoolkit/util/Range';
import { Node } from '@int/geotoolkit/scene/Node';
import { WellLogAdapter } from './WellLogAdapter';
import { LasWrapper } from './LasWrapper';
import { LogData } from '@int/geotoolkit/welllog/data/LogData';

export class MeasurementsTopsLogAdapter extends WellLogAdapter { 

  public url = '';
  public topsUrl = '';

  private measurementsLas: LasWrapper = new LasWrapper();
  private topsLas: LasWrapper = new LasWrapper();

  private async loadTops(): Promise<any> {
    this.topsLas = await this.loadLas(this.topsUrl);
  }

  private async loadMeasures(): Promise<any> {
    this.measurementsLas = await this.loadLas(this.url);
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

  private curveData(curveName: string): LogData {
    return curveName === 'GR'
      ? this.measurementsLas.logData(curveName)
      : this.topsLas.logData(curveName, 'MD')
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