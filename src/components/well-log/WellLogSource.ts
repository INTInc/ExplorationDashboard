import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { Well } from '@/data-sources/Well';

export interface WellLogSource extends Well {
	binding: DataBinding
}