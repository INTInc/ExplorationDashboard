import { LineStyle } from '@int/geotoolkit/attributes/LineStyle';
import { TextStyle } from '@int/geotoolkit/attributes/TextStyle';

export enum AnchorType {
	Point,
	Sphere
}

export class WellAnnotation {
	public text = '';
	public anchorType: AnchorType = AnchorType.Point;
	public textStyle: TextStyle = new TextStyle({ color: '#ffffffff', font: '12px Arial' });
	public lineStyle: LineStyle = new LineStyle();
	public depth?: number;
	public index?: number;

	constructor(props: Partial<WellAnnotation>) {
		Object.assign(this, props);
	}
}