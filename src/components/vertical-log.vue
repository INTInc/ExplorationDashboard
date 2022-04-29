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
import { KnownColors } from '@int/geotoolkit/util/ColorUtil';
import { Range } from '@int/geotoolkit/util/Range';

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
      .setAxisHeaderType(HeaderType.Simple)
      .setDepthLimits(source.minDepth, source.maxDepth);
    widget.addTrack(TrackType.LinearTrack)
      .addChild(drawer.curve(MeasureType.CALI, KnownColors.Orange, new Range(0, 15)))
      .addChild(drawer.curve(MeasureType.GR, KnownColors.Green, new Range(0, 150)))
    widget.addTrack(TrackType.IndexTrack)
    widget.addTrack(TrackType.LinearTrack)
      .addChild(drawer.curve(MeasureType.NPHI, KnownColors.Red, new Range(0, 0.45)))
      .addChild(drawer.curve(MeasureType.RHOB, KnownColors.Blue, new Range(1.95, 2.95)))
    widget.addTrack(TrackType.LinearTrack)
      .addChild(drawer.curve(MeasureType.ILD, KnownColors.DarkBlue, new Range(0.2, 2000)))
      .addChild(drawer.curve(MeasureType.ILM, KnownColors.Blue, new Range(0.2, 2000)))
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