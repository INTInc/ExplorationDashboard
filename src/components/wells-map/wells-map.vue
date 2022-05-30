<template>
  <div ref="container" class="wells-map">
    <canvas ref="canvas" />
  </div>
</template>

<script setup lang="ts">
import { Store, useStore } from '@/store';
import { onMounted, ref } from '@vue/runtime-core';
import { createWellsMapWidget } from '@/components/wells-map/createWellsMapWidget';

const canvas = ref();
const container = ref();
const { state }: Store = useStore();

onMounted(() => createWellsMapWidget(
    canvas.value,
    container.value,
    state.field
).then(({fieldShape, wellShapes}) => {
  fieldShape.connectThemesLoader(state);
  wellShapes.forEach(shape => shape.connectThemesLoader(state))
}));

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
  color: var(--text-color)
}
</style>