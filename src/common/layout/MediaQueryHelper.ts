export enum DeviceType {
	Desktop = 'desktop',
	Tablet = 'tablet',
	Smartphone = 'smartphone'
}

export class MediaQueryHelper {

	public static preferredTheme() {
		return window.matchMedia('(prefers-color-scheme: dark)');
	}

	public static deviceType(): DeviceType {
		if (window.matchMedia('screen and (min-width: 1024px)').matches) {
			return DeviceType.Desktop;
		} else if (window.matchMedia('screen and (min-width: 768px) and (max-width: 1023px)').matches) {
			return DeviceType.Tablet
		} else if (window.matchMedia('screen and (max-width: 767px)').matches) {
			return DeviceType.Smartphone
		}
		return DeviceType.Desktop;
	}
}