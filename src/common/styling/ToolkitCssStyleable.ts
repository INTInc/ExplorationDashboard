import { Styleable } from '@/common/styling/Styleable';
import { CssStyle } from '@int/geotoolkit/css/CssStyle';
import { ToolkitCssLoader } from '@/common/styling/ToolkitCssLoader';
import { AppTheme } from '@/common/styling/AppTheme';

interface CssStyleable {
	setCss: (v: string | CssStyle) => void;
}

export class ToolkitCssStyleable<T extends CssStyleable> implements Styleable {

	constructor(
		protected root: T,
		private cssLoader: ToolkitCssLoader
	) {
	}

	public applyTheme(theme: AppTheme) {
		this.root.setCss(this.cssLoader.getThemeCss(theme));
	}

}