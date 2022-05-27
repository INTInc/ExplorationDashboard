import { CssStyle } from '@int/geotoolkit/css/CssStyle';
import { AppTheme } from '@/common/styling/AppTheme';
import { State } from '@/store';
import { watch } from 'vue';

interface CssStyleable {
	setCss: (style: string | CssStyle) => void;
}

type Constructor = new (...args: any[]) => CssStyleable;

export function Styleable<TBase extends Constructor>(Base: TBase) {

	return class StyleableBase extends Base {

		public connectThemesLoader(state: State): StyleableBase {
			const applyTheme = (theme: AppTheme) => this.setCss(state.toolkitThemes.getThemeCss(theme))
			applyTheme(state.appTheme.value);
			watch(state.appTheme, applyTheme);
			return this;
		}

	}

}