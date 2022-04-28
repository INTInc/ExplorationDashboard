import { DataSource } from '@/data-sources/DataSource';
import { DataSourceStatus } from '@/data-sources/DataSourceStatus';

export class Drawer<T extends DataSource> {

    constructor(
        protected dataSource: T
    ) {
    }

    protected checkDataSource() {
        if (this.dataSource === null) {
            throw new Error('Data source is not defined');
        } else if (this.dataSource.status === DataSourceStatus.Loading) {
            throw new Error('Data source is not loaded yet');
        } else if (this.dataSource.status === DataSourceStatus.Error) {
            throw new Error('Error during loading data')
        }
    }

    public connectTo(dataSource: T) {
        this.dataSource = dataSource;
    }

}