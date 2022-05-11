import { DataSourceStatus } from './DataSourceStatus';

export interface DataSource {

  status: DataSourceStatus;

  setUrl: (url: string) => void,
  load: () => Promise<any>

}