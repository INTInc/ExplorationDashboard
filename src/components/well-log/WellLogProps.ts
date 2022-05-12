import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { Range } from '@int/geotoolkit/util/Range';

export interface WellLogProps {
  limits: Range,
  binding: DataBinding
}