import { Measure, WellLogAdapter } from '@/data-sources/WellLogAdapter';
import { KnownColors } from '@int/geotoolkit/util/ColorUtil';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { Drawer } from './Drawer';

export class WellLogDrawer extends Drawer<WellLogAdapter> {

  curve (
    type: Measure,
    color: string = KnownColors.Red
  ) {
    return new LogCurve(this.dataSource.logData(type))
      .setName(type)
      .setLineStyle(color)
      .setNormalizationLimits(this.dataSource.limit(type));
  }
}