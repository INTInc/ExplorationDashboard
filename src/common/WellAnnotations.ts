import { AnchorType, WellAnnotation } from '@/common/WellAnnotation';
import { DataSource } from '@/common/DataSource';

export class WellAnnotations extends DataSource<WellAnnotations> {

	public data: WellAnnotation[] = [];

	public async setUrl(url: string): Promise<WellAnnotations> {
		const response = await fetch(url);
		const json: object = await response.json();
		this.data.push(...this.mapItems(json	));
		this.loading.resolve(this);

		return this;
	}

	private mapItems(json: object): Array<WellAnnotation> {
		if (Array.isArray(json) && json[0].MD && json[0].name) {
			return json.map(
				item => new WellAnnotation({
					color: item.color,
					text: item.name,
					depth: item.MD,
					anchorType: AnchorType.Sphere,
				})
			);
		} else {
			console.error('Cannot load data as well model annotations');
			return [];
		}
	}

}