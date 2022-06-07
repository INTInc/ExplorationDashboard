import { Range } from '@int/geotoolkit/util/Range';
import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { Well } from '@/data-sources/Well';
import { IndexMeasurement } from '@/common/model/IndexMeasurement';

export abstract class WellLogSource extends Well {

	protected indexMeasurement?: string;

	public setIndexMeasurement(measurement: string) {
		this.indexMeasurement = measurement;
	}

	public abstract getBinding(): DataBinding

	public abstract getLimits(): Range

	public abstract getIndexMeasurements(): IndexMeasurement[]

	public getDefaultIndexMeasurement(): IndexMeasurement {
		return this.getIndexMeasurements()[0];
	}

}