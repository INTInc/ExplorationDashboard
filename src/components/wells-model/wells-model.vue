<template>
  <div ref="container" class="wells-model"></div>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { onMounted } from '@vue/runtime-core';
import { Group, Line, Line3, LineBasicMaterial, Object3D, Plane, Vector3 } from '@int/geotoolkit3d/THREE';
import { Plot } from '@int/geotoolkit3d/Plot';
import { useStore } from '@/store';
import { Wells3DBox } from '@/components/wells-model/Wells3DBox';
import { Well } from '@/common/Well';
import { Grid } from '@int/geotoolkit3d/scene/grid/Grid';
import { LineGeometry } from '@int/geotoolkit3d/scene/well/LineGeometry';
import { KnownColors } from '@int/geotoolkit/util/ColorUtil';
import { AnnotationBase } from '@int/geotoolkit3d/scene/AnnotationBase';
import { AnchorType, WellAnnotation } from '@/common/WellAnnotation';
import { MathUtil } from '@int/geotoolkit/util/MathUtil';
import { FillStyle } from '@int/geotoolkit/attributes/FillStyle';
import { Sphere } from '@int/geotoolkit3d/scene/well/schematic/Sphere';

const props = defineProps<{
  annotations: { [wellName: string]: WellAnnotation[] },
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

function createTrajectory(well: Well): Object3D {
  return new Line(createGeometry(well), createMaterial());
}

function createAnnotation(well: Well, annotation: WellAnnotation): Object3D {
  let anchor = new Vector3();
  const object = new Group();
  const origin = vectorByIndex(well, 0);

  if (annotation.index) {
    anchor = vectorByIndex(well, annotation.index);
  } else if (annotation.depth) {
    anchor = trajectoryPoint(well, annotation.depth);
  } else {
    return new Object3D();
  }

  const annotationObject = new AnnotationBase({
    title: annotation.text,
    titlestyle: annotation.textStyle,
    linestyle: annotation.lineStyle
  });

  annotationObject.setAnchorPoint(anchor);
  annotationObject.position.set(origin.x, origin.y, origin.z);

  if (annotation.anchorType === AnchorType.Sphere) {
    const sphere = new Sphere({
      data: anchor,
      fillstyle: new FillStyle({color: 'yellow'}),
      radius: 30
    });
    sphere.position.set(origin.x, origin.y, origin.z); // Set casing origin, very important!!!
    object.add(sphere);
  }

  object.add(annotationObject);

  return object;
}

function trajectoryPoint(well: Well, depth: number): Vector3 {
  const exactIndex: number =  well.surveys.values('TVD').indexOf(depth);
  return (exactIndex > 0)
      ? vectorByIndex(well, exactIndex)
      : vectorByIntersection(well, depth);
}

function vectorByIndex(well: Well, index: number): Vector3 {
  return new Vector3(
      well.surveys.values('DX')[index],
      well.surveys.values('DY')[index],
      well.surveys.values('Z')[index]
  );
}

function vectorByIntersection(well: Well, depth: number) {
  const deviatedDepths = findDeviatedDepths(well, depth);

  const planeRef = new Plane(new Vector3(0,0, -1), -depth);
  const lineRef = new Line3(vectorByIndex(well, deviatedDepths[0]), vectorByIndex(well, deviatedDepths[1]));
  const intersection = new Vector3();

  planeRef.intersectLine(lineRef, intersection)

  return intersection;
}

function findDeviatedDepths(well: Well, depth: number) {
  //TODO improve this, there must be more performant algorithm
  const values = well.surveys.values('Z');
  const deviations = values.map(item => Math.abs(Math.abs(item) - depth));

  const minDev = MathUtil.getMin(deviations);
  const minDevIndex = deviations.indexOf(minDev);
  const nearestDev = Math.min(deviations[minDevIndex - 1], deviations[minDevIndex + 1]);
  const nearestDevIndex = deviations.indexOf(nearestDev);

  return [minDevIndex, nearestDevIndex];
}

async function createModel() {
  const plot: Plot = createPlot();
  const wellsBox = createWellsBox();

  props.annotations['wellB-2'].forEach(annotation => plot.getRoot().add(createAnnotation(state.wellB2, annotation)));
  props.annotations['wellB-32'].forEach(annotation => plot.getRoot().add(createAnnotation(state.wellB32, annotation)));

  //TODO when wells we be stored as array, make common function instead of calling each well

  plot.getRoot()
      .add(createBoxGrid(wellsBox, props.modelPadding))
      .add(createTrajectory(state.wellB2))
      .add(createTrajectory(state.wellB32));

  setCamera(wellsBox, plot);
}

onMounted(() => wellsAreLoaded().then(createModel));
</script>

<style scoped>

</style>