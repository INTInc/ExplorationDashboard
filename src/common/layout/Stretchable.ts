interface Resizable {
	setSize: (width: number, height: number) => void;
}

type Constructor = new (...args: any[]) => Resizable;

export function Stretchable<TBase extends Constructor>(Base: TBase) {

	return class StretchableBase extends Base {

		private refElement: HTMLElement | null = null;

		public setRefElement(element: HTMLElement): void {
			this.refElement = element;

			this.resize();
			this.initAutoResizing();
		}

		private resize() {
			if (!this.refElement) return;

			const cs = getComputedStyle(this.refElement);
			const csVal = (property: keyof CSSStyleDeclaration): number => parseFloat(cs[property]?.toString() as string);

			this.setSize(
				this.refElement.clientWidth - csVal('paddingLeft') - csVal('paddingRight'),
				this.refElement.clientHeight - csVal('paddingTop') - csVal('paddingBottom')
			);
		}

		private  initAutoResizing() {
			if (!this.refElement) return;

			//TODO check why ResizeObserver here gives infinity loop
			//new ResizeObserver(() => this.resize()).observe(this.refElement);

			window.addEventListener('resize', () => this.resize());
		}
	}
}