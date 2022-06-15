export class WellAnnotation {

    constructor (
        private text: string,
        private color: string,
        private depths: Map<string, number>
    ) {
    }

    public getText () {
        return this.text || 'Unnamed annotation';
    }

    public getColor () {
        return this.color || '#ff0000';
    }

    public getDepth (depthKey: string): number {
        return this.depths.get(depthKey) || 0;
    }

}
