import { Range } from '@int/geotoolkit/util/Range';
import { DataBinding } from '@int/geotoolkit/data/DataBinding';
import { Well } from '@/data-sources/Well';

export abstract class WellLogSource extends Well {

	protected indexMeasurement?: string;

	public setIndexMeasurement(measurement: string) {
		this.indexMeasurement = measurement;
	}

	public abstract getBinding(): DataBinding

	public abstract getLimits(): Range

	public abstract mapPoint(sourceMeasurement: string, targetMeasurement: string, value: number): number

}