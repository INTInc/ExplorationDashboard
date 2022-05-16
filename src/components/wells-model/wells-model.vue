<template>
  <div ref="container" class="wells-model">

  </div>
</template>

<script setup lang="ts">
import { Node } from '@int/geotoolkit/scene/Node';
import { StretchablePlot } from '@/common/StrechablePlot';
import { ref } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { Vector3 } from '@int/geotoolkit3d/THREE';
import { Plot } from '@int/geotoolkit3d/Plot';
import { Grid } from '@int/geotoolkit3d/scene/grid/Grid';

const container = ref();
const canvas = ref();

function createGrid(): Grid {
  return new Grid({
    start: new Vector3(-150, -250, 0),
    end: new Vector3(150, 250, 600)
  })
}

function createPlot(): Plot {

  const plot = new Plot({
    container: container.value,
    camera: {
      position: new Vector3(0, -1350, 300),
      lookat: new Vector3(0, 0, 300)
    }
  })

  plot.getRoot().add(createGrid());

  return plot;
}

onMounted(() => {
  createPlot();
})
</script>

<style scoped>

</style>