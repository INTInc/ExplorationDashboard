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
import { Measure, WellLogDataAdapter } from '@/data-sources/WellLogDataAdapter';
import { WellLogDrawer } from '@/drawers/WellLogDrawer';

import { TrackType } from '@int/geotoolkit/welllog/TrackType';
import { HeaderType } from '@int/geotoolkit/welllog/header/LogAxisVisualHeader';
import { WellLogWidget } from '@int/geotoolkit/welllog/widgets/WellLogWidget';
import { KnownColors } from '@int/geotoolkit/util/ColorUtil';
import { FillType } from '@int/geotoolkit/welllog/LogFill';

//import template from '@/welllog/template';
//import registry from '@/welllog/registry';

const container = ref();
const canvas = ref();

function createWidget() {
    return new WellLogWidget({
        verticalscrollable: false,
        horizontalscrollable: false
    });
}

function configureTracks(widget: WellLogWidget) {
  const source = new WellLogDataAdapter();
  const drawer = new WellLogDrawer(source);

  source.load('/data/wellB-2/logs_desktop.las').then(() => {
    
    const
      cali = drawer.curve(Measure.CALI),
      gr = drawer.curve(Measure.GR),
      nphi = drawer.curve(Measure.NPHI),
      rhob = drawer.curve(Measure.RHOB),
      ild = drawer.curve(Measure.ILD),
      ilm = drawer.curve(Measure.ILM)

    widget
      .setIndexUnit(source.unit)
      .setAxisHeaderType(HeaderType.Simple)
      .setDepthLimits(source.minDepth, source.maxDepth);
    widget.addTrack(TrackType.LinearTrack)
      .addChild(gr)
      .addChild(drawer.fill(gr, 0.3, FillType.Right, KnownColors.Yellow)) //TODO fill curve2
      .addChild(cali)
    widget.addTrack(TrackType.IndexTrack);
    widget.addTrack(TrackType.LinearTrack)
      .addChild(nphi)
      .addChild(rhob)
      .addChild(drawer.fill(nphi, rhob, FillType.Left, KnownColors.Yellow))
      .addChild(drawer.fill(rhob, nphi, FillType.Left, KnownColors.Green))
    widget.addTrack(TrackType.LinearTrack)
      .addChild(ild)
      .addChild(ilm)
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