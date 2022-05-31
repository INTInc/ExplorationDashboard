<template>
  <div ref="container" class="wells-model">
    <div ref="model"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { useStore } from '@/store';
import { Wells3DStyleable } from '@/components/wells-3d/Wells3DStyleable';
import { Wells3D } from '@/components/wells-3d/Wells3D';

const props = defineProps<{
  modelPadding: number,
  cameraDistance: number,
  showCursors?: boolean,
  showWellNames?: boolean,
  showAnnotations?: boolean,
  measurement?: string
}>();
const { state, registerStyleable } = useStore();

const model = ref();
const container = ref();

function dataLoaded(): Promise<unknown> {
  const promises: Array<Promise<unknown>> = [];
  state.wells.forEach(well => promises.push(well.loaded));
  state.annotations.forEach(annotations => promises.push(annotations.loaded));
  return Promise.all(promises);
}

function createWells3D() {
  const wells3d = new Wells3DStyleable(
    model.value,
    container.value,
    state.wells,
    state.annotations,
    props.measurement || null,
    props.cameraDistance,
    props.modelPadding,
    props.showWellNames || false,
    props.showAnnotations || false,
    true
  );
  registerStyleable(wells3d);
  watchCursors(wells3d);
}

function watchCursors(wells3d: Wells3D) {
  state.cursors.forEach((depthRef, well) => watch(depthRef, depth => wells3d.moveCursor(well, depth)));
}

onMounted(() => dataLoaded().then(createWells3D));
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