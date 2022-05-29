export class WellAnnotation {
	public text = '';
	public color = '';
	public depth?: number;
	public index?: number;

	constructor(props: Partial<WellAnnotation>) {
		Object.assign(this, props);
	}
}