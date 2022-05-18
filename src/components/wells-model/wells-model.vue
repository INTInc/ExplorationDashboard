<template>
  <div ref="container" class="wells-model">

  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { Vector3 } from '@int/geotoolkit3d/THREE';
import { Plot } from '@int/geotoolkit3d/Plot';
import { useStore } from '@/store';
import { Wells3DBox } from '@/components/wells-model/Wells3DBox';
import { Wells3DDrawer } from '@/components/wells-model/Wells3DDrawer';

const props = defineProps<{
  modelPadding: number,
  cameraDistance: number
}>();

const container = ref();
const drawer = new Wells3DDrawer();
const {state} = useStore();

function wellsAreLoaded() {
  return Promise.all([
      state.wellB2.loaded,
      state.wellB32.loaded
  ])
}

function createPlot(): Plot {
  return new Plot({ container: container.value });
}

function createWellsBox(): Wells3DBox {
  return new Wells3DBox([state.wellB2, state.wellB32]);
}

function setCamera(wellsBox: Wells3DBox, plot: Plot) {
  plot
      .setCameraLocation(new Vector3(wellsBox.length / 2, -props.cameraDistance, wellsBox.height / 2))
      .setCameraLookAt(new Vector3(wellsBox.length / 2, wellsBox.width / 2, -wellsBox.height));
}

async function createModel() {
  const plot: Plot = createPlot();
  const wellsBox = createWellsBox();

  //TODO when wells we be stored as array, make common function instead of calling each well

  plot.getRoot()
    .add(drawer.createBoxGrid(wellsBox, props.modelPadding))
    .add(drawer.createTrajectory(state.wellB2))
    .add(drawer.createTrajectory(state.wellB32));

  setCamera(wellsBox, plot);
}

onMounted(() => wellsAreLoaded().then(createModel));
</script>

<style scoped>

</style>