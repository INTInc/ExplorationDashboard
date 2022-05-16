import { LasWrapper } from '@/common/LasWrapper';

export class Well {

	tops: LasWrapper = new LasWrapper();
	surveys: LasWrapper = new LasWrapper();
	measurements: LasWrapper = new LasWrapper();

	loaded: Promise<Well> = Promise.resolve(this);

	setup(topsUrl: string, surveysUrl: string, measurementsUrl: string) {
		const queries = [];

		if (topsUrl.trim().length) queries.push(this.loadLas(topsUrl, this.tops));
		if (surveysUrl.trim().length) queries.push(this.loadLas(surveysUrl, this.surveys));
		if (measurementsUrl.trim().length) queries.push(this.loadLas(measurementsUrl, this.measurements));

		Promise.all(queries).then(() => this);
	}

	public async loadLas(url: string, lasWrapper: LasWrapper): Promise<LasWrapper> {
		const response = await fetch(url);
		const text = await response.text();

		return lasWrapper.setSource(text);
	}

}