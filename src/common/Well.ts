import { LasWrapper } from '@/common/LasWrapper';

export class Well {
	tops: LasWrapper = new LasWrapper();
	surveys: LasWrapper = new LasWrapper();
	measurements: LasWrapper = new LasWrapper();
	loaded: Promise<Well> = Promise.resolve(this);

	public async setup(
		topsUrl: string | null,
		surveysUrl: string | null,
		measurementsUrl: string | null
	) {
		const checkString = (str: string | null) => str && str.trim().length;
		const queries = [];

		if (checkString(topsUrl)) queries.push(this.loadLas(topsUrl as string, this.tops));
		if (checkString(surveysUrl)) queries.push(this.loadLas(surveysUrl as string, this.surveys));
		if (checkString(measurementsUrl)) queries.push(this.loadLas(measurementsUrl as string, this.measurements));

		this.loaded = Promise.all(queries).then(() => this);
	}

	public async loadLas(url: string, lasWrapper: LasWrapper): Promise<LasWrapper> {
		const response = await fetch(url);
		const text = await response.text();

		return lasWrapper.setSource(text);
	}
}