<template>
  <div ref="container" class="wells-model">
    <div ref="model"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { useStore } from '@/store';
import { Grid } from '@int/geotoolkit3d/scene/grid/Grid';
import { LineStyle, Patterns } from '@int/geotoolkit/attributes/LineStyle';
import { TextStyle } from '@int/geotoolkit/attributes/TextStyle';
import { AppTheme } from '@/common/styling/AppTheme';
import { createWellsModel } from '@/components/wells-model/createWellsModel';
import { Object3D } from '@int/geotoolkit3d/THREE';

interface ModelTheme {
  axisLineStyle: LineStyle,
  gridLineStyle: LineStyle,
  textStyle: TextStyle
}

const props = defineProps<{
  modelPadding: number,
  cameraDistance: number,
  showCursors?: boolean,
  showWellNames?: boolean,
  showAnnotations?: boolean,
  measurement?: string
}>();
const { state } = useStore();

const FONT = 'bold 11px Arial';

const THEME_DARK: ModelTheme = {
  axisLineStyle: new LineStyle({ color: '#777777', pattern: Patterns.Solid }),
  gridLineStyle: new LineStyle({ color: '#505050', pattern: Patterns.Dash }),
  textStyle: new TextStyle({ color: '#ffffff', font: FONT }),
}

const THEME_LIGHT: ModelTheme = {
  axisLineStyle: new LineStyle({ color: '#dddddd', pattern: Patterns.Solid }),
  gridLineStyle: new LineStyle({ color: '#cccccc', pattern: Patterns.Dash }),
  textStyle: new TextStyle({ color: '#505050', font: FONT }),
}

const model = ref();
const container = ref();

function applyTheme(grid: Grid, annotations: Object3D[], appTheme: AppTheme) {
  const modelTheme = appTheme === AppTheme.Dark ? THEME_DARK : THEME_LIGHT;
  applyThemeToGrid(grid, modelTheme);
  applyThemeToAnnotations(annotations, modelTheme);
}

function applyThemeToGrid(grid: Grid, theme: ModelTheme) {
  grid.setOptions({
    grid: {
      linestyles: { x: theme.gridLineStyle, y: theme.gridLineStyle, z: theme.gridLineStyle }
    },
    axis: {
      linestyles: { x: theme.axisLineStyle, y: theme.axisLineStyle, z: theme.axisLineStyle },
      textstyles: { x: theme.textStyle,  y: theme.textStyle, z: theme.textStyle }
    },
    title: {
      textstyles: { x: theme.textStyle,  y: theme.textStyle, z: theme.textStyle }
    }
  })
}

function applyThemeToAnnotations(annotationSpheres: Object3D[], theme: ModelTheme) {
  annotationSpheres.forEach(sphere => sphere.userData.setTitleStyle(theme.textStyle));
}

function watchTheme(grid: Grid, annotations: Object3D[]) {
  watch(state.appTheme, appTheme => applyTheme(grid, annotations, appTheme));
}

function watchCursors(cursorObjects: Object3D[]) {
  state.cursors.forEach((cursor, well) => {
    const cursorObject = cursorObjects.find(sphere => sphere.userData.well === well);
    if (cursorObject) watch(cursor, depth => cursorObject.userData.setDepth(depth));
  });
}

function createModel() {
  createWellsModel(
    model.value,
    container.value,
    state.wells,
    state.annotations,
    props.measurement || null,
    props.cameraDistance,
    props.modelPadding,
    props.showWellNames || false,
    props.showAnnotations || false,
    true,
    FONT
  ).then(({grid, wellNamesAnnotations, cursorObjects}) => {
    watchCursors(cursorObjects);
    watchTheme(grid, wellNamesAnnotations);
    applyTheme(grid, wellNamesAnnotations, state.appTheme.value);
  })
}

onMounted(createModel);
</script>

<style lang="scss">
.__geotoolkit_compass {
  transform: translate(-100%, -100%) !important;
  position: relative !important;
  left: 100% !important;

  @media (max-width: 800px) {
    transform: translate(-100%, 0) !important;
  }
}
</style>