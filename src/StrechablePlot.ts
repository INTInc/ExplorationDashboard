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
        this.setSize(this.parent.clientWidth, this.parent.clientHeight);
    }

    addResizeListener() {
        window.addEventListener('resize', () => this.resize());
    }

}