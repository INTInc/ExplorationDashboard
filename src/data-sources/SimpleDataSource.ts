import { DataSource } from "./DataSource";
import { DataSourceStatus } from "./DataSourceStatus";

export class SimpleDataSource<T> implements DataSource<T> {

  public url = '';
  public data = null;
  public status: DataSourceStatus = DataSourceStatus.Loading;

  public async load() {
    return;
  }

  protected checkUrl(url: string) {
    if (!url.trim().length) throw new Error(`Url for data source ${this.constructor.name} is not specified`);
  }
}