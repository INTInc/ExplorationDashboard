import { Plot } from '@int/geotoolkit/plot/Plot';

export class StretchablePlot extends Plot {

    constructor(
        private reference: HTMLElement,
        options: object = {}
    ) {
        super(options);
        this.resize()
        this.addResizeListener();
    }

    resize() {
        const cs = getComputedStyle(this.reference);
        const csVal = (property: keyof CSSStyleDeclaration): number => parseFloat(cs[property]?.toString() as string);

        this.setSize(
          this.reference.clientWidth - csVal('paddingLeft') - csVal('paddingRight'),
          this.reference.clientHeight - csVal('paddingTop') - csVal('paddingBottom')
        );
    }

    addResizeListener() {
        window.addEventListener('resize', () => this.resize());
    }

}