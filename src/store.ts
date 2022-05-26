import { inject, Ref } from 'vue';
import { Field } from './data-sources/Field';
import { WellAnnotations } from '@/common/model/WellAnnotations';
import { Well } from '@/data-sources/Well';
import { ref } from '@vue/runtime-core';
import { Theme } from '@/components/theme-switcher/Theme';

export interface State {
  theme: Ref<Theme>,
  field: Field,
  wells: Well[],
  cursors: Map<Well, Ref<number | null>>
  annotations: Map<Well, WellAnnotations>
}

export interface Store {
  readonly state: State,

  addField: () => Field,
  addWell: (well: Well) => Well,
  addCursor: (well: Well) => Ref<number | null>
  addAnnotations: (well: Well) => WellAnnotations,
  setTheme: (theme: Theme) => void
}

export const storeSymbol = Symbol('store');

const state = {
  theme: ref(Theme.Light),
  field: new Field(),
  wells: [] as Well[],

  cursors: new Map(),
  annotations: new Map(),
}
const addField = () => { return state.field = new Field() }
const addWell = (well: Well) => state.wells[state.wells.push(well) -1];
const addCursor = (well: Well) => {
  const cursor = ref(0);
  state.cursors.set(well, cursor);
  return cursor;
}
const addAnnotations = (well: Well) => {
  const annotations = new WellAnnotations();
  state.annotations.set(well, annotations);
  return annotations;
}
const setTheme = (theme: Theme) => state.theme.value = theme;


export const createStore = (): Store => ({
  state,
  addWell,
  addField,
  addCursor,
  addAnnotations,
  setTheme
});

export const useStore = () => inject(storeSymbol) as Store;