<template>
    <div class="well-log">
        <div ref="container" class="canvas-container">
            <canvas ref="canvas"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DataSource } from '@/data-sources/DataSource';
import { WellLogDataAdapter } from '@/data-sources/WellLogDataAdapter';
import { useStore } from '@/store';
import { StretchablePlot } from '@/StrechablePlot';
import { HeaderType } from '@int/geotoolkit/welllog/header/LogAxisVisualHeader';
import { WellLogWidget } from '@int/geotoolkit/welllog/widgets/WellLogWidget';
import { onMounted, defineProps, ref } from 'vue';

const {state} = useStore();

const props = defineProps<{
  dataUrl: string,
  templateUrl: string
}>();

let dataSource: WellLogDataAdapter;

const container = ref();
const canvas = ref();

async function fetchData(): Promise<DataSource> {
  return dataSource = await new WellLogDataAdapter().load(props.dataUrl)
}

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
    .setDepthLimits(dataSource.minDepth, dataSource.maxDepth)
    .setDataBinding(dataSource.dataBinding)
    .setAxisHeaderType(HeaderType.Simple)
    .loadTemplate(template)
}

function createPlot(widget: WellLogWidget) {
    return new StretchablePlot(container.value, canvas.value, widget)
}

function handleError() {
  console.error(`Problem loading template from ${props.templateUrl}.`);
}

function initialize() {
  fetchData()
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
