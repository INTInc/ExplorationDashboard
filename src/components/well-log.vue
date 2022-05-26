<template>
    <div class="well-log">
        <div ref="container" class="canvas-container" @mouseleave="onContainerMouseLeave">
            <canvas ref="canvas"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { WellB2 } from '@/data-sources/WellB2';
import { WellB32 } from '@/data-sources/WellB32';
import { HeaderType } from '@int/geotoolkit/welllog/header/LogAxisVisualHeader';
import { WellLogWidget } from '@int/geotoolkit/welllog/widgets/WellLogWidget';
import { defineProps, onMounted, ref, watch } from 'vue';
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
import { CompositeNode } from '@int/geotoolkit/scene/CompositeNode';
import { Theme } from '@/components/theme-switcher/Theme';

const props = defineProps<{
  source: WellB2 | WellB32,
  templateUrl: string,
  fitTracks?: number,
  showAnnotations?: boolean
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
  return new WellLogWidget({
    horizontalscrollable: false,
    verticalscrollable: false
  })
    .setDepthLimits(props.source.limits)
    .setDataBinding(props.source.binding)
    .setAxisHeaderType(HeaderType.Simple)
    .loadTemplate(template);
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

async function loadCss(widget: WellLogWidget): Promise<WellLogWidget> {
  const [commonRules, lightThemeRules, darkThemeRules] = await Promise.all([
    fetch('/themes/common.css').then(response => response.text()),
    fetch('/themes/theme-light.css').then(response => response.text()),
    fetch('/themes/theme-dark.css').then(response => response.text())
  ])

  const lightTheme = commonRules + ' ' + lightThemeRules;
  const darkTheme = commonRules + ' ' + darkThemeRules;
  const applyTheme = (theme: Theme) => widget.setCss(theme === Theme.Dark ? darkTheme : lightTheme);

  applyTheme(state.theme.value);
  watch(state.theme, applyTheme);

  return widget;
}

/*function handleError() {
  console.error(`Problem loading template from ${props.templateUrl}.`);
}*/

function initialize() {
  props.source.loaded
    .then(fetchTemplate)
    .then(validateTemplate)
    .then(createWidget)
    .then(loadCss)
    .then(widget => {
      createPlot(widget);
      createAnnotations(widget);
      configureCrossHairTool(widget);
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
