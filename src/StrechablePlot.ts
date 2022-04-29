import { Node } from '@int/geotoolkit/scene/Node';
import { Plot } from '@int/geotoolkit/plot/Plot';
import { Ref } from 'vue';

export class StretchablePlot extends Plot {

    constructor(
        private parent: HTMLElement,
        canvas: HTMLCanvasElement,
        rootWidget: Node,
        options: object = {}
    ) {
        super({
            canvaselement: canvas,
            root: rootWidget,
            ...options
        });

        this.resize()
        this.addResizeListener();
    }

    resize() {
        const cs = getComputedStyle(this.parent);
        const csVal = (property: keyof CSSStyleDeclaration): number => parseFloat(cs[property]?.toString() as string);

        this.setSize(
          this.parent.clientWidth - csVal('paddingLeft') - csVal('paddingRight'),
          this.parent.clientHeight - csVal('paddingTop') - csVal('paddingBottom')
        );
    }

    addResizeListener() {
        window.addEventListener('resize', () => this.resize());
    }

}