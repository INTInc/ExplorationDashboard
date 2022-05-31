import { Styleable } from '@/common/styling/Styleable';
import { Deferred } from '@/common/model/Deferred';
import { CssStyle } from '@int/geotoolkit/css/CssStyle';
import { ToolkitCssLoader } from '@/common/styling/ToolkitCssLoader';
import { AppTheme } from '@/common/styling/AppTheme';

interface CssStyleable {
	setCss: (v: string | CssStyle) => void;
}

export class ToolkitCssStyleable<T extends CssStyleable> implements Styleable {

	protected initialization = new Deferred<ToolkitCssStyleable<T>>();

	constructor(
		protected root: T,
		private cssLoader: ToolkitCssLoader
	) {
	}

	public applyTheme(theme: AppTheme) {
		this.root.setCss(this.cssLoader.getThemeCss(theme));
	}

	public get initialized(): Promise<ToolkitCssStyleable<T>> {
		return this.initialization.promise
	}

}