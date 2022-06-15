export class Deferred<T> {

    public promise: Promise<T>;

    constructor () {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    public resolve: (v: T) => void = () => {
        return;
    };

    public reject: () => void = () => {
        return;
    };


}
