import { LasWrapper } from '@/common/LasWrapper';
import { WellAnnotation } from '@/common/WellAnnotation';

export class Well {

	public tops: LasWrapper = new LasWrapper();
	public surveys: LasWrapper = new LasWrapper();
	public measurements: LasWrapper = new LasWrapper();
	public annotations: WellAnnotation[] = [];

	private queries: Promise<void>[] = [];

	setTopsLasUrl(url: string): Well {
		return this.addQuery(url, Well.loadLas(url, this.tops));
	}

	public setSurveysLasUrl(url: string) {
		return this.addQuery(url, Well.loadLas(url, this.surveys));
	}

	public setMeasurementsLasUrl(url: string) {
		return this.addQuery(url, Well.loadLas(url, this.measurements));
	}

	public setAnnotationsUrl(url: string) {
		return this.addQuery(url, Well.loadJson(url).then(json => { this.annotations.push(...Well.mapAnnotations(json)) }));
	}

	private addQuery(url: string, query: Promise<void>) {
		if (Well.checkUrl(url)) {
			this.queries.push(query.catch((e => console.error(`Error loading data part with url ${url}, ${e.toString()}`))));
		} else {
			console.error(`Invalid data part url ${url}`);
		}
		return this;
	}

	private static checkUrl(url: string) {
		return url && url.toString().trim().length;
	}

	private static async loadJson(url: string): Promise<object> {
		const response = await fetch(url);
		return await response.json() as object;
	}

	private static async loadLas(url: string, lasWrapper: LasWrapper): Promise<void> {
		const response = await fetch(url);
		const text = await response.text();

		lasWrapper.setSource(text);
	}

	private static mapAnnotations(json: object): WellAnnotation[] {
		if (Array.isArray(json) && json[0].TVD && json[0].name) {
			return json as WellAnnotation[];
		} else {
			console.error('Cannot load data as well model annotations');
			return [];
		}
	}

	public get loaded(): Promise<Well> {
		return Promise.all(this.queries).then(() => this);
	}
}