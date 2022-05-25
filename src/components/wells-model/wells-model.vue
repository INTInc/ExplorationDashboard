<template>
  <div ref="container" class="wells-model">
    <div ref="model"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, Ref, ref, watch } from 'vue';
import { onMounted } from '@vue/runtime-core';
import {
  Color,
  Group,
  Line,
  LineBasicMaterial,
  Object3D,
  Vector3,
} from '@int/geotoolkit3d/THREE';
import { Plot } from '@int/geotoolkit3d/Plot';
import { useStore } from '@/store';
import { Wells3DBox } from '@/components/wells-model/Wells3DBox';
import { Well } from '@/data-sources/Well';
import { Grid } from '@int/geotoolkit3d/scene/grid/Grid';
import { LineGeometry } from '@int/geotoolkit3d/scene/well/LineGeometry';
import { KnownColors } from '@int/geotoolkit/util/ColorUtil';
import { AnnotationBase } from '@int/geotoolkit3d/scene/AnnotationBase';
import { AnchorType, WellAnnotation } from '@/common/WellAnnotation';
import { MathUtil } from '@int/geotoolkit/util/MathUtil';
import { FillStyle } from '@int/geotoolkit/attributes/FillStyle';
import { Sphere } from '@int/geotoolkit3d/scene/well/schematic/Sphere';
import { StretchablePlot3 } from '@/common/layout/StretchablePlot3';
import { LineStyle, Patterns } from '@int/geotoolkit/attributes/LineStyle';
import { TextStyle } from '@int/geotoolkit/attributes/TextStyle';
import { LogCurve2D } from '@int/geotoolkit3d/scene/well/LogCurve2D';
import { LogFill2D } from '@int/geotoolkit3d/scene/well/LogFill2D';

const AXIS_LINE_STYLE = new LineStyle({ color: KnownColors.Black, pattern: Patterns.Solid });
const GRID_LINE_STYLE = new LineStyle({ color: KnownColors.DarkGrey, pattern: Patterns.Dash });
const TEXT_STYLE = new TextStyle({ color: KnownColors.Black, font: '12px Arial' });

const props = defineProps<{
  modelPadding: number,
  cameraDistance: number,
  showCursors?: boolean,
  showWellNames?: boolean,
  showAnnotations?: boolean,
  measurement?: string
}>();

const model = ref();
const container = ref();
const { state } = useStore();

function wellsAreLoaded() {
  const promises: Array<Promise<unknown>> = [];

  state.wells.forEach(well => promises.push(well.loaded));
  state.annotations.forEach(annotations => promises.push(annotations.loaded));

  return Promise.all(promises);
}

function createPlot(): Plot {
  const plot = new StretchablePlot3({
    container: model.value,
    renderer: {
      clearcolor: 'white'
    }
  });
  plot.setRefElement(container.value);
  return plot;
}

function createWellsBox(): Wells3DBox {
  return new Wells3DBox(state.wells);
}

function createBoxGrid(box: Wells3DBox, padding: number): Grid {
  return new Grid({
    start: new Vector3(-padding, - box.width / 2 - padding, 0),
    end: new Vector3(box.length + padding, box.width / 2 + padding, - box.height),
    modelstart: new Vector3(box.xLimits.getHigh() - padding,box.yLimits.getLow() - padding, box.zLimits.getLow()),
    modelend: new Vector3(box.xLimits.getHigh() + padding, box.yLimits.getHigh() + padding, box.zLimits.getHigh()),
    grid: {
      linestyles: { x: GRID_LINE_STYLE, y: GRID_LINE_STYLE, z: GRID_LINE_STYLE }
    },
    axis: {
      linestyles: { x: AXIS_LINE_STYLE, y: AXIS_LINE_STYLE, z: AXIS_LINE_STYLE },
      textstyles: { x: TEXT_STYLE,  y: TEXT_STYLE, z: TEXT_STYLE }
    },
    title: {
      textstyles: { x: TEXT_STYLE,  y: TEXT_STYLE, z: TEXT_STYLE }
    }

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
  return new LineBasicMaterial({ color: KnownColors.Green })
}

function createTrajectory(well: Well): Object3D {
  return new Line(createGeometry(well), createMaterial());
}

function createAnnotation(annotation: WellAnnotation, well: Well): Object3D {
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
    titlestyle: TEXT_STYLE || annotation.textStyle,
    linestyle: annotation.lineStyle
  });

  annotationObject.setAnchorPoint(anchor);
  annotationObject.position.copy(origin);

  if (annotation.anchorType === AnchorType.Sphere) {
    const sphere = new Sphere({
      data: anchor,
      fillstyle: new FillStyle({color: KnownColors.Green }),
      radius: 30
    });
    sphere.position.copy(origin);
    object.add(sphere);
  }

  object.add(annotationObject);

  return object;
}

function trajectoryPoint(well: Well, value: number): Vector3 {
  const exactIndex: number =  well.surveys.values('TVD').indexOf(value);
  return (exactIndex > 0)
      ? vectorByIndex(well, exactIndex)
      : vectorByIndex(well, deviatedIndex(well, 'DX', value));
}

function vectorByIndex(well: Well, index: number): Vector3 {
  return new Vector3(
      well.surveys.values('DX')[index],
      well.surveys.values('DY')[index],
      well.surveys.values('Z')[index]
  );
}

function deviatedIndex(well: Well, measurement: string, value: number) {
  //TODO improve this, there must be more performant algorithm
  const values = well.surveys.values(measurement);
  const deviations = values.map(item => Math.abs(Math.abs(item) - value));

  const minDev = MathUtil.getMin(deviations);
  return deviations.indexOf(minDev);
}

/*
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
*/

function createWellNamesAnnotations(root: Object3D): void {
  if (props.showWellNames)
    root.add(
      ...state.wells
        .filter(well => well.surveys.wellName)
        .map(well => createAnnotation(new WellAnnotation({
          text: well.surveys.wellName as string,
          index: well.surveys.length - 1,
          textStyle: TEXT_STYLE,
        }), well))
    )
}

function createCustomAnnotations(root: Object3D): void {
  if (props.showAnnotations) state.annotations.forEach((annotations, well) =>
    annotations.data.forEach(annotation => root.add(createAnnotation(annotation, well)))
  );
}

function createMeasurementCurve(well: Well, measurement: string): Object3D {
  const
      curveCoordinates = {
        x: well.surveys.values('DX'),
        y: well.surveys.values('DY'),
        z: well.surveys.values('Z')
      },
      curve = new LogCurve2D({
        data: {
          ...curveCoordinates,
          values: well.surveys.values(measurement),
          nullvalue: well.surveys.nullValue
        },
        color: '#c00000',
        radius: 75
      }),
      fill = new LogFill2D({
        data: {
          ...curveCoordinates,
          curvevalues1: well.surveys.values(measurement),
        },
        colorprovider: new Color('#ffc000'),
        radius: 75
      });

  const origin = vectorByIndex(well, 0);
  curve.position.copy(origin);
  fill.position.copy(origin);

  return new Group()
      .add(curve)
      .add(fill);
}

function createMeasurementLogs(root: Object3D): void {
  if (props.measurement) root.add(...state.wells.map(well => createMeasurementCurve(well, props.measurement as string)));
}

function createCursors(root: Object3D) {
    state.cursors.forEach((depthRef: Ref<number | null>, well: Well) => {
      const sphere = new Sphere({
        data: vectorByIndex(well, 0),
        fillstyle: new FillStyle({color: KnownColors.Red }),
        radius: 75
      });
      sphere.position.copy(vectorByIndex(well, 0));
      sphere.visible = false;

      root.add(sphere);

      watch(depthRef, (_, value) => {
        if (value === null || Number.isNaN(value)) {
          sphere.visible = false;
        } else {
          sphere.visible = true;
          sphere.position.copy(vectorByIndex(well, deviatedIndex(well, 'MD', value)));
          sphere.invalidateObject();
        }
      });
    });
}

function createModel() {
  const plot = createPlot();
  const root = plot.getRoot();
  const wellsBox = createWellsBox();
  root
      .add(createBoxGrid(wellsBox, props.modelPadding))
      .add(...state.wells.map(well => createTrajectory(well)));

  createWellNamesAnnotations(root);
  createCustomAnnotations(root);
  createMeasurementLogs(root);
  createCursors(root);

  setCamera(wellsBox, plot);
}

onMounted(() => wellsAreLoaded().then(createModel));
</script>

<style lang="scss">
.__geotoolkit_compass {
  transform: translate(-100%, -100%) !important;
  position: relative !important;
  left: 100% !important;

  @media (max-width: 800px) {
    transform: translate(-100%, 0) !important;
  }
}
</style>