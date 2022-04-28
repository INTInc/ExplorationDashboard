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

import { StretchablePlot } from '@/StrechablePlot';

import { ExplorationMapAdapter } from '@/data-sources/exploration-map-adapter/ExplorationMapAdapter';
import { ExplorationMapDrawer } from '@/drawers/ExplorationMapDrawer';

const canvas = ref();
const container = ref();

function createMap() {    
  return new Map({
    system: GeodeticSystem.WGS84,
    tooltip: {
      alignment: AnchorType.BottomCenter,
      offsetx: 0,
      offsety: 0,
      mode: PointerMode.Hover,
      autoupdate: false
    }
  });
}

function addMapLayer(map: Map) {
  map.addLayer(
    new TileLayer({
      url: 'https://demo.int.com/osm_tiles/',
      formatterfunction: (z: number, y: number, x: number) => z + '/' + x + '/' + y + '.png'
    })
  );
}

function addExplorationLayer(map: Map) {
  const source = new ExplorationMapAdapter();
  const drawer = new ExplorationMapDrawer(source);

  source.load('/data/fieldB.json')
    .then(() => {
      map.addLayer(
        new ShapeLayer({
          alpha: 0.75,
          tooltip: {
            visible: true,
            formatter: (shapes: Shape[]) => shapes[0] && shapes[0].getName() || null
          }
        })
        .addShape(drawer.zone)
        .addShape(drawer.wells[0])
        .addShape(drawer.wells[1])
      )
      .setZoomLevel(5)
      .panTo(source.explorationCoordinates, GeodeticSystem.WGS84)
    })
}

function createPlot(map: Map) {
  return new StretchablePlot(container.value, canvas.value, map);
}

onMounted(() => {
  const map = createMap();

  addMapLayer(map);
  addExplorationLayer(map);
  createPlot(map);
})
</script>

<style lang="scss" scoped>
.wells-map {
  padding: 0;
  overflow: hidden;
}
</style>