import { inject } from 'vue';
import { ExplorationMapAdapter } from './data-sources/ExplorationMapAdapter';
import { WellAnnotations } from '@/common/WellAnnotations';
import { Well } from '@/common/Well';
import { WellAnnotation } from '@/common/WellAnnotation';

interface State {
  wells: Well[],
  annotations: WellAnnotations[],
  explMap: ExplorationMapAdapter
}

export interface Store {
  readonly state: State,
  addWell: (well?: Well) => Well,
  addAnnotations: (annotations?: WellAnnotations) => WellAnnotations,
  getAnnotations: () => WellAnnotation[]
}

export const storeSymbol = Symbol('store');

const state = {
  wells: [] as Well[],
  annotations: [] as WellAnnotations[],
  explMap: new ExplorationMapAdapter()
}
const addWell = (well?: Well) => state.wells[state.wells.push(well || new Well()) -1];
const addAnnotations = () => state.annotations[state.annotations.push(new WellAnnotations()) -1];
const getAnnotations = () => {
  const annotations: WellAnnotation[] = [];
  state.annotations.forEach(store => annotations.push(...store.data));
  return annotations;
}

export const createStore = (): Store => ({
  state,
  addWell,
  addAnnotations,
  getAnnotations
});

export const useStore = () => inject(storeSymbol) as Store;