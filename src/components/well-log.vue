<template>
    <div class="well-log">
        <div ref="container" class="canvas-container">
            <canvas ref="canvas"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { WellB2 } from '@/data-sources/WellB2';
import { WellB32 } from '@/data-sources/WellB32';
import { HeaderType } from '@int/geotoolkit/welllog/header/LogAxisVisualHeader';
import { WellLogWidget } from '@int/geotoolkit/welllog/widgets/WellLogWidget';
import { defineProps, onMounted, ref } from 'vue';
import { StretchablePlot } from '@/common/layout/StretchablePlot';
import { Plot } from '@int/geotoolkit/plot/Plot';
import { Orientation } from '@int/geotoolkit/util/Orientation';
import { LogAxis } from '@int/geotoolkit/welllog/LogAxis';

const props = defineProps<{
  source: WellB2 | WellB32,
  templateUrl: string,
  fitTracks?: number,
  isScalable?: boolean,
  initialScale?: number
}>();

const container = ref();
const canvas = ref();

async function fetchTemplate(): Promise<string> {
  const response = await fetch(props.templateUrl);
  return await response.text(); 
}

function validateTemplate(template: string) {
  //TODO here will be runtime template validation
  return template;
}

function createWidget(template: string) {
  return new WellLogWidget({
    horizontalscrollable: false,
    verticalscrollable: false
  })
    .setDepthLimits(props.source.limits)
    .setDataBinding(props.source.binding)
    .setAxisHeaderType(HeaderType.Simple)
    .loadTemplate(template)
}

function createPlot(widget: WellLogWidget) {
    return new StretchablePlot({
      canvaselement: canvas.value,
      root: widget
    })
      .on('resized', (_: never, plot: Plot) => resizeTracks(plot, widget))
      .setRefElement(container.value)
}

function resizeTracks(plot: Plot, widget: WellLogWidget) {
  if (!props.fitTracks) return;

  const limit = widget.getOrientation() === Orientation.Vertical
      ? plot.getWidth()
      : plot.getHeight();

  const indexTrackWidth = 40;
  const curveTrackWidth = Math.floor((limit - indexTrackWidth) / props.fitTracks);

  for (let i = 0; i < widget.getTracksCount(); i++) {
    const track = widget.getTrackAt(i);
    const isIndexTrack = track.getChild(0) && track.getChild(0) instanceof LogAxis;
    widget.getTrackAt(i).setWidth(isIndexTrack ? indexTrackWidth : curveTrackWidth);
  }
}

/*function handleError() {
  console.error(`Problem loading template from ${props.templateUrl}.`);
}*/

function initialize() {
  props.source.loaded
    .then(fetchTemplate)
    .then(validateTemplate)
    .then(createWidget)
    .then(createPlot)
    //.catch(handleError)
}

onMounted(initialize);
</script>

<style lang="scss" scoped>
.canvas-container {
    padding: 10px;
    height: 100%;
}
</style>
