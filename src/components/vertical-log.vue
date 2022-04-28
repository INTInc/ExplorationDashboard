<template>
    <div class="vertical-log">
        <div ref="container" class="canvas-container">
            <canvas ref="canvas"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { StretchablePlot } from '@/StrechablePlot';
import { MeasureType, WellLogAdapter } from '@/data-sources/WellLogAdapter';
import { WellLogDrawer } from '@/drawers/WellLogDrawer';

import { TrackType } from '@int/geotoolkit/welllog/TrackType';
import { HeaderType } from '@int/geotoolkit/welllog/header/LogAxisVisualHeader';
import { WellLogWidget } from '@int/geotoolkit/welllog/widgets/WellLogWidget';

const container = ref();
const canvas = ref();

function createWidget() {
    return new WellLogWidget({
        verticalscrollable: true,
        horizontalscrollable: false
    });
}

function addCurves(widget: WellLogWidget) {
  const source = new WellLogAdapter();
  const drawer = new WellLogDrawer(source);

  source.load('/data/wellB-2/logs_desktop.las').then(() => {
    widget.addTrack(TrackType.IndexTrack);
    widget.addTrack(TrackType.LinearTrack)
      .addChild(drawer.curve(MeasureType.CALI, '#ef6c00'))
      .addChild(drawer.curve(MeasureType.GR, '#7cb342'))
      
    widget
      .setAxisHeaderType(HeaderType.Simple)
  });
}

function createPlot(widget: WellLogWidget) {
    return new StretchablePlot(container.value, canvas.value, widget)
}

onMounted(() => {
  const widget = createWidget(); 

  addCurves(widget);
  createPlot(widget);
})
</script>

<style lang="scss" scoped>
.canvas-container {
    height: 100%;
}
</style>