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
import { Measure, WellLogAdapter } from '@/data-sources/WellLogAdapter';
import { WellLogDrawer } from '@/drawers/WellLogDrawer';

import { TrackType } from '@int/geotoolkit/welllog/TrackType';
import { HeaderType } from '@int/geotoolkit/welllog/header/LogAxisVisualHeader';
import { WellLogWidget } from '@int/geotoolkit/welllog/widgets/WellLogWidget';
import { KnownColors } from '@int/geotoolkit/util/ColorUtil';

const container = ref();
const canvas = ref();

function createWidget() {
    return new WellLogWidget({
        verticalscrollable: false,
        horizontalscrollable: false
    });
}

function configureTracks(widget: WellLogWidget) {
  const source = new WellLogAdapter();
  const drawer = new WellLogDrawer(source);

  source.load('/data/wellB-2/logs_desktop.las').then(() => {    
    widget
      .setIndexUnit(source.unit)
      .setAxisHeaderType(HeaderType.Simple)
      .setDepthLimits(source.minDepth, source.maxDepth);
    widget.addTrack(TrackType.LinearTrack)
      .addChild(drawer.curve(Measure.CALI, KnownColors.Orange))
      .addChild(drawer.curve(Measure.GR, KnownColors.Green))
    widget.addTrack(TrackType.IndexTrack);
    widget.addTrack(TrackType.LinearTrack)
      .addChild(drawer.curve(Measure.NPHI, KnownColors.Red))
      .addChild(drawer.curve(Measure.RHOB, KnownColors.Blue))
    widget.addTrack(TrackType.LinearTrack)
      .addChild(drawer.curve(Measure.ILD, KnownColors.DarkBlue))
      .addChild(drawer.curve(Measure.ILM, KnownColors.Blue))
  });
}

function createPlot(widget: WellLogWidget) {
    return new StretchablePlot(container.value, canvas.value, widget)
}

onMounted(() => {
  const widget = createWidget(); 
  configureTracks(widget);
  createPlot(widget);
})
</script>

<style lang="scss" scoped>
.canvas-container {
    padding: 10px;
    height: 100%;
}
</style>