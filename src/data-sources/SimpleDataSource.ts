import { DataSource } from "./DataSource";
import { DataSourceStatus } from "./DataSourceStatus";

export class SimpleDataSource implements DataSource {

  protected url = '';
  public status: DataSourceStatus = DataSourceStatus.Loading;

  public setUrl(url: string) {
    this.url = url;
  }

  public async load() {
    this.checkUrl();
    return this;
  }

  protected checkUrl() {
    if (!this.url.trim().length) {
      throw new Error(`Url for data source ${this.constructor.name} is not specified`)
    }
  }
}