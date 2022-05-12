import { DataSourceStatus } from './DataSourceStatus';

export interface DataSource<T> {
  url: string;
  data: T | null;
  status: DataSourceStatus;

  load: () => Promise<void>
}