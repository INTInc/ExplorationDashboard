import { CssStyle } from '@int/geotoolkit/css/CssStyle';
import { Deferred } from '@/common/model/Deferred';
import { AppTheme } from '@/common/styling/AppTheme';

export class ToolkitThemesLoader {

	private common = '';
	private light = '';
	private dark = '';

	public loaded: Deferred<ToolkitThemesLoader> = new Deferred<ToolkitThemesLoader>();

	private static async loadCssString(url: string) {
		return await fetch(url).then(response => response.text())
	}

	public async setUrls(commonUrl: string, lightThemeUrl: string, darkThemeUrl: string) {
		[this.common, this.light, this.dark] = await Promise.all([
			ToolkitThemesLoader.loadCssString(commonUrl),
			ToolkitThemesLoader.loadCssString(lightThemeUrl),
			ToolkitThemesLoader.loadCssString(darkThemeUrl)
		]);
		this.loaded.resolve(this);
	}

	public getThemeCss(theme: AppTheme): CssStyle {
		const css = theme === AppTheme.Dark
			? this.common + ' ' + this.dark
			: this.common + ' ' + this.light;

		return new CssStyle({css});
	}


}