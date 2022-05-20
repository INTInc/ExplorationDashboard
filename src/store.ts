import { inject } from 'vue';
import { Field } from './data-sources/Field';
import { WellAnnotations } from '@/common/WellAnnotations';
import { Well } from '@/data-sources/Well';
import { WellAnnotation } from '@/common/WellAnnotation';

interface State {
  field: Field,
  wells: Well[],
  annotations: WellAnnotations[],
}

export interface Store {
  readonly state: State,

  addField: () => Field,
  addWell: (well?: Well) => Well,
  addAnnotations: (annotations?: WellAnnotations) => WellAnnotations,
  getAnnotations: () => WellAnnotation[]
}

export const storeSymbol = Symbol('store');

const state = {
  field: new Field(),
  wells: [] as Well[],
  annotations: [] as WellAnnotations[],
}
const addField = () => { return state.field = new Field() }
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
  addField,
  addAnnotations,
  getAnnotations
});

export const useStore = () => inject(storeSymbol) as Store;