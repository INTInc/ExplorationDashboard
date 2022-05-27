import { inject, Ref } from 'vue';
import { Field } from './data-sources/Field';
import { WellAnnotations } from '@/common/model/WellAnnotations';
import { Well } from '@/data-sources/Well';
import { ref } from '@vue/runtime-core';
import { AppTheme } from '@/common/styling/AppTheme';
import { ToolkitThemesLoader } from '@/common/styling/ToolkitThemesLoader';

export interface State {
  appTheme: Ref<AppTheme>,
  toolkitThemes: ToolkitThemesLoader,
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
  setAppTheme: (theme: AppTheme) => void,
  setupToolkitThemes: (commonUrl: string, lightUrl: string, darkUrl: string) => void
}

export const storeSymbol = Symbol('store');

const state = {
  appTheme: ref(AppTheme.Light),
  toolkitThemes: new ToolkitThemesLoader(),
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
const setAppTheme = (theme: AppTheme) => state.appTheme.value = theme;
const setupToolkitThemes = (commonUrl: string, lightUrl: string, darkUrl: string) => state.toolkitThemes.setUrls(commonUrl, lightUrl, darkUrl)


export const createStore = (): Store => ({
  state,
  addWell,
  addField,
  addCursor,
  addAnnotations,
  setAppTheme,
  setupToolkitThemes
});

export const useStore = () => inject(storeSymbol) as Store;