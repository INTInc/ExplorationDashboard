<template>
  <div ref="container" class="wells-model">

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { Line, LineBasicMaterial, Object3D, Vector3 } from '@int/geotoolkit3d/THREE';
import { Plot } from '@int/geotoolkit3d/Plot';
import { Grid } from '@int/geotoolkit3d/scene/grid/Grid';
import { LineGeometry } from '@int/geotoolkit3d/scene/well/LineGeometry';
import { useStore } from '@/store';
import { Well } from '@/common/Well';
import { KnownColors } from '@int/geotoolkit/util/ColorUtil';
import { Wells3DBox } from '@/components/wells-model/Wells3DBox';

const MODEL_PADDING = 500;
const CAMERA_DISTANCE = 10000;

const container = ref();
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

function createBoxGrid(box: Wells3DBox): Grid {
  const padding = MODEL_PADDING;
  return new Grid({
    start: new Vector3(-padding, - box.width / 2 - padding, padding),
    end: new Vector3(box.length + padding, box.width / 2 + padding, - box.height),
    modelstart: new Vector3(box.xLimits.getHigh() - padding,box.yLimits.getLow() - padding, box.zLimits.getLow()),
    modelend: new Vector3(box.xLimits.getHigh() + padding, box.yLimits.getHigh() + padding, box.zLimits.getHigh())
  });
}

function setCamera(wellsBox: Wells3DBox, plot: Plot) {
  plot
      .setCameraLocation(new Vector3(wellsBox.length / 2, wellsBox.width / 2 - CAMERA_DISTANCE, wellsBox.height / 2))
      .setCameraLookAt(new Vector3(wellsBox.length / 2, wellsBox.width / 2, wellsBox.height / 2));
}

function createGeometry(well: Well) {
  return new LineGeometry({
    data: {
      x: well.surveys.values('DX'),
      y: well.surveys.values('DY'),
      z: well.surveys.values('Z')
    }
  })
}

function createMaterial() {
  return new LineBasicMaterial({ color: KnownColors.Green })
}

function createTrajectory(well: Well): Object3D {
  return new Line(createGeometry(well), createMaterial());
}

async function createModel() {
  const plot: Plot = createPlot();
  const wellsBox = createWellsBox();

  //TODO when wells we be stored as array, make common function instead of calling each well

  plot.getRoot()
    .add(createBoxGrid(wellsBox))
    .add(createTrajectory(state.wellB2))
    .add(createTrajectory(state.wellB32));

  setCamera(wellsBox, plot);
}

onMounted(() => wellsAreLoaded().then(createModel));
</script>

<style scoped>

</style>