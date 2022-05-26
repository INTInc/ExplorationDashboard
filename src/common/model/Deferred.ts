export class Deferred<T> {

	public promise: Promise<T>;
	public resolve: (v: T) => void = () => { return; };
	public reject: () => void = () => { return; }

	constructor() {
		this.promise = new Promise<T>((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		})
	}


}