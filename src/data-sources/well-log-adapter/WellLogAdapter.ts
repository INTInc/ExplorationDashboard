import { DataSource } from '../DataSource';
import { DataSourceStatus } from '../DataSourceStatus';

import { Las20 } from '@int/geotoolkit/welllog/data/las/Las20';

export class WellLogAdapter implements DataSource {
    
    status: DataSourceStatus = DataSourceStatus.Loading;

    public async load(url: string) {
        const response = await fetch(url);
        const text = await response.text();
        const las = new Las20().parse(text);

        console.log(las);
    }
    
}