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

const canvas = ref();
const container = ref();
const { state, registerStyleable }: Store = useStore();

const props = defineProps<{
  initialZoom: number
}>()

onMounted(() => {
  registerStyleable(new WellsMap(
    canvas.value,
    container.value,
    state.toolkitThemes,
    state.field,
    props.initialZoom
  ));
});

/*
onMounted(() => createWellsMapWidget(
    canvas.value,
    container.value,
    props.initialZoom,
    state.field
).then(({fieldShape, wellShapes}) => {
  fieldShape.connectThemesLoader(state);
  wellShapes.forEach(shape => shape.connectThemesLoader(state))
}));
*/

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