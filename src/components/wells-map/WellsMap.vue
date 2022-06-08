<template>
  <div ref="container" class="wells-map">
    <canvas ref="canvas" />
  </div>
</template>

<script setup lang="ts">
import { Store, useStore } from '@/store';
import { onMounted, ref } from '@vue/runtime-core';
import { WellsMap } from '@/components/wells-map/WellsMap';

const { state, registerStyleable }: Store = useStore();

const canvas = ref();
const container = ref();

function createMap() {
  registerStyleable(new WellsMap(
    canvas.value,
    container.value,
    state.field,
    state.cssLoader
  ));
}

onMounted(() => state.field.loaded.then(createMap));
</script>

<style scoped lang="scss">
.wells-map {
  padding: 0;
  overflow: hidden;
}
</style>

<style lang="scss">
.wells-map .cg-toolbar-left {
  margin-left: 6px;
}
</style>