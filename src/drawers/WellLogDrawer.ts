import { Measure, WellLogDataAdapter } from '@/data-sources/WellLogDataAdapter';
import { KnownColors } from '@int/geotoolkit/util/ColorUtil';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { FillType, LogFill } from '@int/geotoolkit/welllog/LogFill';
import { Drawer } from './Drawer';

const CURVE_COLORS = {
  [Measure.CALI]: KnownColors.Orange,
  [Measure.GR]: KnownColors.Green,
  [Measure.NPHI]: KnownColors.Red,
  [Measure.RHOB]: KnownColors.Blue,
  [Measure.ILD]: KnownColors.Blue,
  [Measure.ILM]: KnownColors.DarkBlue,
  [Measure.DEPT]: ''
}

export class WellLogDrawer extends Drawer<WellLogDataAdapter> {

  curve (type: Measure) {
    const limit = this.dataSource.limit(type);
    const logCurve = new LogCurve(this.dataSource.logData(type))
      .setName(type)
      .setLineStyle(CURVE_COLORS[type])
      .setNormalizationLimits(limit.left, limit.right);

    return logCurve;
  }

  //TODO DO WE REALLY NEED THIS METHOD? THINK ABOUT ARCH

  fill (
    curve1: LogCurve,
    curve2: LogCurve | number,
    filltype: FillType,
    color: string
  ) {
    return new LogFill({
      curve1,
      curve2,
      filltype,
      fillstyle: { color }
    })
  }
}