import { inject } from 'vue';
import { DataSource } from './data-sources/DataSource';
import { ExplorationMapDataAdapter } from './data-sources/ExplorationMapDataAdapter';
import { WellLogDataAdapter } from './data-sources/WellLogDataAdapter';

interface State {
  wellLogSource: WellLogDataAdapter,
  explMapSource: ExplorationMapDataAdapter,
  wellLogSourceLoaded: Promise<WellLogDataAdapter>,
  explMapSourceLoaded: Promise<ExplorationMapDataAdapter>
}

export interface Store {
  state: State,
  setExplMapDataUrl: (url: string) => Promise<DataSource>,
  setWellLogDataUrl: (url: string) => Promise<DataSource>
}

export const storeSymbol = Symbol('store');

export const createStore = (): Store => {

  const
    wellLogSource = new WellLogDataAdapter(),
    explMapSource = new ExplorationMapDataAdapter();

  const state: State = {
    wellLogSource,
    explMapSource,
    wellLogSourceLoaded: Promise.resolve(wellLogSource),
    explMapSourceLoaded: Promise.resolve(explMapSource)
  };

  function setWellLogDataUrl(url: string): Promise<DataSource> {
    return state.wellLogSourceLoaded = state.wellLogSource.load(url);
  }

  function setExplMapDataUrl(url: string): Promise<DataSource> {
    return state.explMapSourceLoaded = state.explMapSource.load(url)
  }

  return {
    state,
    setExplMapDataUrl,
    setWellLogDataUrl
  }
}

export const useStore = () => inject(storeSymbol) as Store;