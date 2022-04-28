import { MeasureType, WellLogAdapter } from '@/data-sources/WellLogAdapter';
import { KnownColors } from '@int/geotoolkit/util/ColorUtil';
import { MathUtil } from '@int/geotoolkit/util/MathUtil';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { Drawer } from './Drawer';

export class WellLogDrawer extends Drawer<WellLogAdapter> {

  curve (
    type: MeasureType,
    color: string = KnownColors.Red
  ) {
    const data = this.dataSource.logData(type);
    const limits = MathUtil.calculateNeatLimits(data.getMinValue(), data.getMaxValue(), false, false);
    return new LogCurve(data)
        .setName(type)
        .setNormalizationLimits(limits)
        .setLineStyle(color);
  }
}