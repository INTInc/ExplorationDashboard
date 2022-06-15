<template>
  <div ref="container" class="wells-map">
    <canvas ref="canvas"/>
  </div>
</template>

<script lang="ts" setup>
import {Store, useStore} from '@/store';
import {onMounted, ref} from '@vue/runtime-core';
import {WellsMap} from '@/components/wells-map/WellsMap';

const {state, registerStyleable}: Store = useStore();

const canvas = ref();
const container = ref();

function createMap () {
    registerStyleable(new WellsMap(
        canvas.value,
        container.value,
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
