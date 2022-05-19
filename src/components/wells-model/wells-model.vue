<template>
  <div ref="container" class="wells-model">

  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { Group, Line, LineBasicMaterial, Object3D, Vector3 } from '@int/geotoolkit3d/THREE';
import { Plot } from '@int/geotoolkit3d/Plot';
import { useStore } from '@/store';
import { Wells3DBox } from '@/components/wells-model/Wells3DBox';
import { Well } from '@/common/Well';
import { Grid } from '@int/geotoolkit3d/scene/grid/Grid';
import { LineGeometry } from '@int/geotoolkit3d/scene/well/LineGeometry';
import { KnownColors } from '@int/geotoolkit/util/ColorUtil';
import { AnnotationBase } from '@int/geotoolkit3d/scene/AnnotationBase';
import { TextStyle } from '@int/geotoolkit/attributes/TextStyle';
import { LineStyle } from '@int/geotoolkit/attributes/LineStyle';

const props = defineProps<{
  modelPadding: number,
  cameraDistance: number
}>();

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
  return new LineBasicMaterial({ color: KnownColors.Yellow })
}

function createAnnotation(well: Well) {
  const index = well.surveys.values('DX').length - 1;

  const annotation = new AnnotationBase({
    title: well.surveys.wellName,
    titlestyle: new TextStyle({
      font: '12px Arial',
      color: 'yellow'
    }),
    linestyle: new LineStyle({color: 'white'})
  });

  annotation.setAnchorPoint(new Vector3(
      well.surveys.values('DX')[index],
      well.surveys.values('DY')[index],
      well.surveys.values('Z')[index]
  ));
  annotation.position.set(
      well.surveys.values('DX')[0],
      well.surveys.values('DY')[0],
      well.surveys.values('Z')[0]
  );

  return annotation;
}

function createTrajectory(well: Well): Object3D {
  return new Line(createGeometry(well), createMaterial());
}

function createNamedTrajectory(well: Well): Object3D {
  return new Group()
      .add(createTrajectory(well))
      .add(createAnnotation(well))
}

function createBoxGrid(box: Wells3DBox, padding: number): Grid {
  return new Grid({
    start: new Vector3(-padding, - box.width / 2 - padding, 0),
    end: new Vector3(box.length + padding, box.width / 2 + padding, - box.height),
    modelstart: new Vector3(box.xLimits.getHigh() - padding,box.yLimits.getLow() - padding, box.zLimits.getLow()),
    modelend: new Vector3(box.xLimits.getHigh() + padding, box.yLimits.getHigh() + padding, box.zLimits.getHigh())
  });
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
    .add(createBoxGrid(wellsBox, props.modelPadding))
    .add(createNamedTrajectory(state.wellB2))
    .add(createNamedTrajectory(state.wellB32));

  setCamera(wellsBox, plot);
}

onMounted(() => wellsAreLoaded().then(createModel));
</script>

<style scoped>

</style>