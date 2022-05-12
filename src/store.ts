import { inject } from 'vue';
import { ExplorationMapAdapter } from './data-sources/ExplorationMapAdapter';
import { MeasurementsLogAdapter } from './data-sources/MeasurementsLogAdapter';
import { MeasurementsTopsLogAdapter } from './data-sources/MeasurementsTopsLogAdapter';

interface State {
  wellB2: MeasurementsLogAdapter,
  wellB32: MeasurementsTopsLogAdapter,
  explMap: ExplorationMapAdapter
}

export interface Store {
  readonly state: State
}

export const storeSymbol = Symbol('store');

export const createStore = (): Store => ({
  state: {
    wellB2: new MeasurementsLogAdapter(),
    wellB32: new MeasurementsTopsLogAdapter(),
    explMap: new ExplorationMapAdapter()
  }
});

export const useStore = () => inject(storeSymbol) as Store;