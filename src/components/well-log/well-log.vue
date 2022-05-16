<template>
    <div class="well-log">
        <div ref="container" class="canvas-container">
            <canvas ref="canvas"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { MeasurementsLogAdapter } from '@/data-sources/MeasurementsLogAdapter';
import { MeasurementsTopsLogAdapter } from '@/data-sources/MeasurementsTopsLogAdapter';
import { StretchablePlot } from '@/StrechablePlot';
import { HeaderType } from '@int/geotoolkit/welllog/header/LogAxisVisualHeader';
import { WellLogWidget } from '@int/geotoolkit/welllog/widgets/WellLogWidget';
import { onMounted, defineProps, ref } from 'vue';

const props = defineProps<{
  source: MeasurementsLogAdapter | MeasurementsTopsLogAdapter,
  templateUrl: string
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
    return new StretchablePlot(container.value, canvas.value, widget)
}

/*function handleError() {
  console.error(`Problem loading template from ${props.templateUrl}.`);
}*/

function initialize() {
  props.source.load()
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
