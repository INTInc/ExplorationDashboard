import { AnchorType, WellAnnotation } from '@/common/WellAnnotation';
import { Well } from '@/data-sources/Well';
import { DataSource } from '@/common/DataSource';

export class WellAnnotations extends DataSource<WellAnnotations> {

	public data: WellAnnotation[] = [];

	public attachToWell(well: Well) {
		this.data.forEach(item => item.well = well);
	}

	public async setUrl(url: string): Promise<WellAnnotations> {
		const response = await fetch(url);
		const json: object = await response.json();
		this.data.push(...this.mapItems(json	));
		this.loading.resolve(this);

		return this;
	}

	private mapItems(json: object): Array<WellAnnotation> {
		if (Array.isArray(json) && json[0].TVD && json[0].name) {
			return json.map(
				item => new WellAnnotation({
					text: item.name,
					depth: item.TVD,
					anchorType: AnchorType.Sphere,
				})
			);
		} else {
			console.error('Cannot load data as well model annotations');
			return [];
		}
	}

}