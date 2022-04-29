import { MeasureType, WellLogAdapter } from '@/data-sources/WellLogAdapter';
import { KnownColors } from '@int/geotoolkit/util/ColorUtil';
import { MathUtil } from '@int/geotoolkit/util/MathUtil';
import { Range } from '@int/geotoolkit/util/Range';
import { LogData } from '@int/geotoolkit/welllog/data/LogData';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { Drawer } from './Drawer';

export class WellLogDrawer extends Drawer<WellLogAdapter> {

  curve (
    type: MeasureType,
    color?: string,
    limits?: Range,
  ) {
    const data = this.dataSource.logData(type);
    return new LogCurve(data)
        .setName(type)
        .setNormalizationLimits(limits || this.calculateLimits(data))
        .setLineStyle(color || KnownColors.Red);
  }

  private calculateLimits(data: LogData) {
    return MathUtil.calculateNeatLimits(data.getMinValue(), data.getMaxValue(), false, false);
  }
}