<template>
  <div ref="container" class="wells-map">
    <canvas ref="canvas"/>
  </div>
</template>

<script lang="ts" setup>
import {defineProps} from 'vue';
import {Store, useStore} from '@/store';
import {onMounted, ref} from '@vue/runtime-core';
import {WellsMapDynamicTiles} from '@/components/wells-map/WellsMapDynamicTiles';

const {state, registerStyleable}: Store = useStore();
const props = defineProps<{
  wellNames: Array<string>
}>()
const canvas = ref();
const container = ref();

function createMap () {
    registerStyleable(new WellsMapDynamicTiles(
        canvas.value,
        container.value,
        props.wellNames,
        state.field,
        state.cssLoader
    ));
}

onMounted(() => state.field.loaded.then(createMap));
</script>

<style lang="scss" scoped>
.wells-map canvas {
  transform: scale(1.05);
}
</style>
