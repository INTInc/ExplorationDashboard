import { CssStyle } from '@int/geotoolkit/css/CssStyle';
import { Theme } from '@/components/theme-switcher/Theme';
import { State } from '@/store';
import { watch } from 'vue';

interface CssStyleable {
	setCss: (style: string | CssStyle) => void;
}

type Constructor = new (...args: any[]) => CssStyleable;

export function Styleable<TBase extends Constructor>(Base: TBase) {

	return class StyleableBase extends Base {

		public async connectThemes(state: State): Promise<StyleableBase> {

			const [commonRules, lightThemeRules, darkThemeRules] = await Promise.all([
				fetch('/themes/common.css').then(response => response.text()),
				fetch('/themes/theme-light.css').then(response => response.text()),
				fetch('/themes/theme-dark.css').then(response => response.text())
			])

			const lightTheme = commonRules + ' ' + lightThemeRules;
			const darkTheme = commonRules + ' ' + darkThemeRules;
			const applyTheme = (theme: Theme) => this.setCss(theme === Theme.Dark ? darkTheme : lightTheme);

			applyTheme(state.theme.value);
			watch(state.theme, applyTheme);

			return this;
		}

	}

}