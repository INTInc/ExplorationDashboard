<template>
    <div class="well-log">
        <div ref="container" class="canvas-container" @mouseleave="onContainerMouseLeave">
            <canvas ref="canvas"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { HeaderType } from '@int/geotoolkit/welllog/header/LogAxisVisualHeader';
import { WellLogWidget } from '@int/geotoolkit/welllog/widgets/WellLogWidget';
import { defineProps, onMounted, ref } from 'vue';
import { StretchablePlot } from '@/common/layout/StretchablePlot';
import { Events as PlotEvents, Plot } from '@int/geotoolkit/plot/Plot';
import { Orientation } from '@int/geotoolkit/util/Orientation';
import { LogAxis } from '@int/geotoolkit/welllog/LogAxis';
import { CrossHair, Events as CrossHairEvents } from '@int/geotoolkit/controls/tools/CrossHair';
import { CrossHairEventArgs } from '@int/geotoolkit/controls/tools/CrossHairEventArgs';
import { useStore } from '@/store';
import { LogMarker } from '@int/geotoolkit/welllog/LogMarker';
import { AnchorType } from '@int/geotoolkit/util/AnchorType';
import { LineStyle } from '@int/geotoolkit/attributes/LineStyle';
import { Styleable } from '@/common/styling/Styleable';
import { WellLogSource } from '@/components/well-log/WellLogSource';

const props = defineProps<{
  source: WellLogSource,
  limits: number[],
  templateUrl: string,
  fitTracks?: number,
  showAnnotations?: boolean,
  headerScrollTo?: 'top' | 'bottom'
}>();

const canvas = ref();
const container = ref();
const { state } = useStore();

async function fetchTemplate(): Promise<string> {
  const response = await fetch(props.templateUrl);
  return await response.text(); 
}

function validateTemplate(template: string) {
  //TODO here will be runtime template validation
  return template;
}

function createWidget(template: string) {
  return new (Styleable(WellLogWidget))({
    horizontalscrollable: false,
    verticalscrollable: false
  })
    .setDepthLimits(props.limits[0], props.limits[1])
    .setDataBinding(props.source.binding)
    .setAxisHeaderType(HeaderType.Simple)
    .loadTemplate(template)
    .connectThemesLoader(state) as unknown as WellLogWidget
}

function createAnnotations(widget: WellLogWidget) {
  const annotations = state.annotations.get(props.source);
  if (props.showAnnotations && annotations) {
    annotations.data.forEach(annotation => {
      const marker = new LogMarker(annotation.depth, annotation.text)
        .setLineStyle(new LineStyle({ color: annotation.color, width: 2 }))
        .setVerticalTextOffset(-5)
        .setHorizontalTextOffset(5)
        .setNameLabelPosition(AnchorType.RightTop)
        .setDepthLabelPosition(AnchorType.RightBottom)
        .setFillStyleDepth(annotation.color)
        .setFillStyleName(annotation.color)
        .setFillDepthLabel(true)
        .setFillNameLabel(true);
      widget
        .getTrackContainer()
        .addChild(marker);
    });
  }
}

function createPlot(widget: WellLogWidget) {
    return new StretchablePlot({
      canvaselement: canvas.value,
      root: widget
    })
      .on(PlotEvents.Resized, (_: never, plot: Plot) => resizeTracks(plot, widget))
      .setRefElement(container.value)
}

function resizeTracks(plot: Plot, widget: WellLogWidget) {
  if (!props.fitTracks) return;

  const limit = widget.getOrientation() === Orientation.Vertical
      ? plot.getWidth()
      : plot.getHeight();

  const indexTrackWidth = 35;
  const curveTrackWidth = Math.floor((limit - indexTrackWidth) / props.fitTracks);

  for (let i = 0; i < widget.getTracksCount(); i++) {
    const track = widget.getTrackAt(i);
    track.setWidth(track.getChild(0) && track.getChild(0) instanceof LogAxis
        ? indexTrackWidth
        : curveTrackWidth);
  }
}

function configureCrossHairTool(widget: WellLogWidget) {
  const crossHair = widget.getToolByName('cross-hair');
  if (crossHair !== null) {
    (crossHair as CrossHair)
      .setEnabled(true)
      .setProperties({
        east: {
          visible: true
        }
      })
      .addListener(CrossHairEvents.onPositionChanged, onCrossHairPositionChanged)

  }
}

function onCrossHairPositionChanged(_: never, event: CrossHairEventArgs) {
  setCursorPosition(event.getPosition().getY());
}

function onContainerMouseLeave() {
  setCursorPosition(null);
}

function setCursorPosition(value: number | null) {
  const cursor = state.cursors.get(props.source);
  if (cursor) cursor.value = value;
}

function scrollHeader(widget: WellLogWidget) {
  switch (props.headerScrollTo) {
    case 'top': return widget.getHeaderContainer().scrollToTop();
    case 'bottom': return widget.getHeaderContainer().scrollToBottom();
    default: return;
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
    .then(widget => {
      createPlot(widget);
      createAnnotations(widget);
      configureCrossHairTool(widget);
      scrollHeader(widget);
      widget.fitToHeight();
    })
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
