import { inject } from 'vue';
import { DataSource } from './data-sources/DataSource';
import { ExplorationMapDataAdapter } from './data-sources/ExplorationMapDataAdapter';
import { WellB2LogAdapter } from './data-sources/WellB2LogAdapter';
import { WellB32LogAdapter } from './data-sources/WellB32LogAdapter';

interface State {
  wellB2Source: WellB2LogAdapter,
  wellB32Source: WellB32LogAdapter,
  explMapSource: ExplorationMapDataAdapter
}

export interface Store {
  readonly state: State
}

export const storeSymbol = Symbol('store');

export const createStore = (): Store => ({
  state: {
    wellB2Source: new WellB2LogAdapter(),
    wellB32Source: new WellB32LogAdapter(),
    explMapSource: new ExplorationMapDataAdapter()
  }
});

export const useStore = () => inject(storeSymbol) as Store;