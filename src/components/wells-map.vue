<template>
  <div ref="container" class="wells-map">
  <canvas ref="canvas" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from '@vue/runtime-core';

import { Map } from '@int/geotoolkit/map/Map';
import { Tile as TileLayer } from '@int/geotoolkit/map/layers/Tile';
import { Shape as ShapeLayer } from '@int/geotoolkit/map/layers/Shape';
import { GeodeticSystem } from '@int/geotoolkit/map/GeodeticSystem';
import { Shape } from '@int/geotoolkit/scene/shapes/Shape';
import { AnchorType } from '@int/geotoolkit/util/AnchorType';
import { PointerMode } from '@int/geotoolkit/controls/tools/PointerMode';
import { StretchablePlot } from '@/common/layout/StretchablePlot';
import { Store, useStore } from '@/store';
import { Polygon } from '@int/geotoolkit/scene/shapes/Polygon';
import { Path } from '@int/geotoolkit/scene/shapes/Path';
import { Field } from '@/data-sources/Field';
import { RgbaColor } from '@int/geotoolkit/util/RgbaColor';
import { StyleableMap } from '@/common/styling/StyleableMap';
import { ToolTipTool } from '@int/geotoolkit/controls/tools/ToolTipTool';

//TODO temporary, all colors must be defined or redefined by css styles
const PRIMARY_COLOR = new RgbaColor(140, 104, 205, 1);
const PRIMARY_TRANSPARENT_COLOR = new RgbaColor(140, 104, 205, 0.5);

const canvas = ref();
const container = ref();
const { state }: Store = useStore();

function createWidget() {
  return new StyleableMap({
    system: GeodeticSystem.WGS84,
    tooltip: {
      alignment: AnchorType.BottomCenter,
      offsetx: 0,
      offsety: 0,
      mode: PointerMode.Hover,
      autoupdate: false
    }
  }).connectThemes(state) as unknown as Promise<Map>
}

function addMapLayer(map: Map) {
  map.addLayer(
    new TileLayer({
      url: 'https://demo.int.com/osm_tiles/',
      formatterfunction: (z: number, y: number, x: number) => z + '/' + x + '/' + y + '.png'
    })
  );
}

function createField(dataSource: Field): Polygon {
  const {x, y, name} = dataSource.zoneCoordinates;
  return new Polygon({ x, y })
    .setCssClass('ExplorationMapField')
    .setName(`Zone of exploration '${name}'`)
}

function createWells(dataSource: Field): Path[] {
  console.log(new Path({}).getClassName());
  return dataSource.wellsCoordinates.map(({x, y, name}) => {
    const path = new Path({})
      .setCssClass('ExplorationMapWell')
      .setName(`Trajectory of ${name}`)
      .moveTo(x[0], y[0]);

    for (let i = 1; i < x.length; i++) path.lineTo(x[i], y[i]);
    return path;
  });
}

function addExplorationLayer(map: Map) {
  state.field.loaded
    .then(() => {
      map.addLayer(
        new ShapeLayer({
          alpha: 0.75,
          tooltip: {
            visible: true,
            formatter: (shapes: Shape[]) => shapes[0] && shapes[0].getName() || null
          }
        })
        .addShape([createField(state.field), ...createWells(state.field)])
      )
      .setZoomLevel(5)
      .panTo(state.field.explorationCoordinates, GeodeticSystem.WGS84)
    })
}

function createPlot(map: Map) {
  const plot = new StretchablePlot({
    canvaselement: canvas.value,
    root: map
  });
  plot.setRefElement(container.value);
  return plot;
}

onMounted(() => {
  createWidget().then(widget => {
    addMapLayer(widget);
    addExplorationLayer(widget);
    createPlot(widget);
  });
})
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