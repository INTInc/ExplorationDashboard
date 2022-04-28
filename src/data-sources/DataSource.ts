import { DataSourceStatus } from './DataSourceStatus';

export interface DataSource {
    
    load: (url: string) => Promise<any>,
    status: DataSourceStatus
}