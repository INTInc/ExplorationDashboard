import { inject } from 'vue';
import { Field } from './data-sources/Field';
import { WellAnnotations } from '@/common/WellAnnotations';
import { Well } from '@/data-sources/Well';
import { WellAnnotation } from '@/common/WellAnnotation';
import { WellModelCursor } from '@/common/WellModelCursor';

interface State {
  field: Field,
  wells: Well[],
  cursors: WellModelCursor[],
  annotations: WellAnnotations[],
}

export interface Store {
  readonly state: State,

  addField: () => Field,
  addWell: (well?: Well) => Well,
  addCursor: () => WellModelCursor,
  addAnnotations: (annotations?: WellAnnotations) => WellAnnotations,
  getAnnotations: () => WellAnnotation[]
}

export const storeSymbol = Symbol('store');

const state = {
  field: new Field(),
  wells: [] as Well[],
  cursors: [] as WellModelCursor[],
  annotations: [] as WellAnnotations[],
}
const addField = () => { return state.field = new Field() }
const addWell = (well?: Well) => state.wells[state.wells.push(well || new Well()) -1];
const addCursor = () => state.cursors[state.cursors.push(new WellModelCursor())]
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
  addCursor,
  addAnnotations,
  getAnnotations
});

export const useStore = () => inject(storeSymbol) as Store;