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

const container = ref();
const canvas = ref();

function createWidget() {
    return new WellLogWidget({
        verticalscrollable: false,
        horizontalscrollable: false
    });
}

function addCurves(widget: WellLogWidget) {
  const source = new WellLogAdapter();
  const drawer = new WellLogDrawer(source);

  source.load('/data/wellB-2/logs_desktop.las').then(() => {    
    widget
      .setAxisHeaderType(HeaderType.Simple)
      .setDepthLimits(source.minDepth, source.maxDepth);
    widget.addTrack(TrackType.IndexTrack);
    widget.addTrack(TrackType.LinearTrack)
      .addChild(drawer.curve(MeasureType.CALI, KnownColors.Orange))
      .addChild(drawer.curve(MeasureType.GR, KnownColors.Green))
    widget.addTrack(TrackType.LinearTrack)
      .addChild(drawer.curve(MeasureType.NPHI, KnownColors.Red))
      .addChild(drawer.curve(MeasureType.RHOB, KnownColors.Blue))
    widget.addTrack(TrackType.LinearTrack)
      .addChild(drawer.curve(MeasureType.ILD, KnownColors.DarkBlue))
      .addChild(drawer.curve(MeasureType.ILM, KnownColors.Blue))
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
    padding: 10px;
    height: 100%;
}
</style>