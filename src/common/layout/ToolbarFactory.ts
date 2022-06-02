import { Toolbar } from '@int/geotoolkit/controls/toolbar/Toolbar';
import { Orientation } from '@int/geotoolkit/util/Orientation';
import { AnchorType } from '@int/geotoolkit/util/AnchorType';
import { Button } from '@int/geotoolkit/controls/toolbar/Button';
import { IToolContainer } from '@int/geotoolkit/plot/IToolContainer';

type ButtonProps = {
	icon: string,
	title: string,
	action: () => void
}

export class ToolbarFactory {
	public static create(
		toolsContainer: IToolContainer,
		buttons: ButtonProps[] = []
	) {
		new Toolbar({
			size: 30,
			fontsize: 16,
			orientation: Orientation.Vertical,
			alignment: AnchorType.LeftTop,
			tools: toolsContainer,
			buttons: buttons.map(props => new Button(props))
		})
	}
}