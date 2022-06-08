import { Button } from '@int/geotoolkit/controls/toolbar/Button';
import { WellLogWidget } from '@int/geotoolkit/welllog/widgets/WellLogWidget';

export abstract class ToolWithButtons {

	constructor(
		protected widget: WellLogWidget
	) {}

	public abstract getButtons(): Button[];

}