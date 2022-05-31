import { AppTheme } from '@/common/styling/AppTheme';

export interface Styleable {

	initialized: Promise<unknown>;

	applyTheme: (theme: AppTheme) => void;

}