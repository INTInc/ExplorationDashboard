import { WellAnnotation } from '@/common/model/WellAnnotation';
import { DataSource } from '@/common/model/DataSource';

export class WellAnnotations extends DataSource<WellAnnotations> {

	public data: WellAnnotation[] = [];

	public async setUrl(url: string): Promise<WellAnnotations> {
		const response = await fetch(url);
		const json: object = await response.json();
		this.data.push(...this.mapItems(json));
		this.loading.resolve(this);

		return this;
	}

	private mapItems(json: object): Array<WellAnnotation> {
		if (Array.isArray(json) && json[0].MD && json[0].name) {
			return json.map(item => {
				const depths = new Map<string, number>()
					.set('DEPT', parseInt(item.MD))
					.set('TVD', parseInt(item.TVD))
					.set('HRZDISP', parseInt(item.HRZDISP))
				return new WellAnnotation(item.name, item.color, depths)
			});
		} else {
			console.error('Cannot load data as well model annotations');
			return [];
		}
	}

}