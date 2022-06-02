<template>
  <div ref="container" class="wells-map">
    <canvas ref="canvas" />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { Store, useStore } from '@/store';
import { onMounted, ref } from '@vue/runtime-core';
import { WellsMap } from '@/components/wells-map/WellsMap';

const { state, registerStyleable }: Store = useStore();
const props = defineProps<{
  initialZoom: number
}>();

const canvas = ref();
const container = ref();

function createMap() {
  registerStyleable(new WellsMap(
    canvas.value,
    container.value,
    state.field,
    props.initialZoom,
    state.cssLoader
  ));
}

onMounted(() => state.field.loaded.then(createMap));
</script>

<style lang="scss">
.wells-map {
  padding: 0;
  overflow: hidden;
}

.cg-tooltip-container {
  padding: 8px;
  font-size: 12px;
  font-weight: bolder;
  font-family: Arial, sans-serif;
  background-color: var(--card-color);
  color: var(--text-color);
}
</style>