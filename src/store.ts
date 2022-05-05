import { DataBindingRegistry } from '@int/geotoolkit/data/DataBindingRegistry';
import { ExplorationMapAdapter } from './data-sources/ExplorationMapDataAdapter';
import { WellLogAdapter } from './data-sources/WellLogDataAdapter';

export const createStore = () => {

  const wellLogSource = new WellLogAdapter();
  const explMapSource = new ExplorationMapAdapter();

  const state = {
    wellLogRegistry: new DataBindingRegistry(),
    explorationMapData: {} 
  };

  const fetchWellLogData = (url: string) => {
    wellLogSource.load(url)
      .then(() => state.wellLogRegistry.add(wellLogSource.dataBinding));
  }

  const fetchExplMapData = (url: string) => {
    explMapSource.load(url)
  }

  return {
    state,
    fetchWellLogData,
    fetchExplMapData
  }
}