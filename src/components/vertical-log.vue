<template>
    <div class="vertical-log">
        <div ref="container" class="canvas-container">
            <canvas ref="canvas"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { WellLogAdapter } from '@/data-sources/well-log-adapter/WellLogAdapter';

import { WellLogWidget } from '@int/geotoolkit/welllog/widgets/WellLogWidget';
import { StretchablePlot } from '@/StrechablePlot';

const container = ref();
const canvas = ref();

function loadLas() {
    return new WellLogAdapter().load('/data/wellB-2/logs_desktop.las');
}

function createWidget() {
    return new WellLogWidget({
        verticalscrollable: true,
        horizontalscrollable: false
    });
}

function createPlot() {
    return new StretchablePlot(container.value, canvas.value, createWidget())
}

onMounted(() => {
    createPlot();
})
</script>

<style lang="scss" scoped>
.canvas-container {
    height: 100%;
}
</style>