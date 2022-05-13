import { SimpleDataSource } from './SimpleDataSource';
import { WellLogProps } from '../components/well-log/WellLogProps';
import { LasWrapper } from './LasWrapper';


export class WellLogAdapter extends SimpleDataSource<WellLogProps> {

    protected async loadLas(url: string): Promise<LasWrapper> {
      const response = await fetch(url);
      const text = await response.text();
      
      return new LasWrapper().setSource(text);
    }

}