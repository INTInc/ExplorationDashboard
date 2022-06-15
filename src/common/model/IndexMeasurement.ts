export class IndexMeasurement {

    constructor (
        private readonly key: string,
        private readonly name: string = key
    ) {
    }

    public getName () {
        return this.name;
    }

    public getKey () {
        return this.key;
    }

}
