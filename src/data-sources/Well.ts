import { LasWrapper } from '@/common/model/LasWrapper';
import { DataSource } from '@/common/model/DataSource';

interface WellOptions {
	topsUrl?: string,
	surveysUrl?: string,
	measurementsUrl?: string
}

export class Well extends DataSource<Well> {

	public tops: LasWrapper = new LasWrapper();
	public surveys: LasWrapper = new LasWrapper();
	public measurements: LasWrapper = new LasWrapper();

	public setUrls(options: WellOptions): Promise<void> {
		const promises: Promise<void>[] = [];

		if (options.topsUrl) promises.push(Well.loadLas(options.topsUrl, this.tops));
		if (options.surveysUrl) promises.push(Well.loadLas(options.surveysUrl, this.surveys));
		if (options.measurementsUrl) promises.push(Well.loadLas(options.measurementsUrl, this.measurements));

		return Promise.all(promises)
			.then(() => this.loading.resolve(this))
			.catch(() => this.loading.reject());
	}

	private static async loadLas(url: string, lasWrapper: LasWrapper): Promise<void> {
		try {
			const response = await fetch(url);
			const text = await response.text();

			lasWrapper.setSource(text);
		} catch (e: unknown) {
			console.error(`Error loading data part with url ${url}, ${e}`);
		}
	}
}