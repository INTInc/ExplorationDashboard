import { Range } from '@int/geotoolkit/util/Range';
import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { Well } from '@/data-sources/Well';

export abstract class WellLogSource extends Well {

	protected indexMeasurement?: string;

	public setIndexMeasurement(measurement: string) {
		this.indexMeasurement = measurement;
	}

	abstract getBinding(): DataBinding

	abstract getLimits(): Range

}