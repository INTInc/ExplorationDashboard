<template>
  <div class="well-log">
    <div ref="container" class="canvas-container">
      <canvas ref="canvas"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {useStore} from '@/store';

import {WellLogSource} from '@/components/well-log/WellLogSource';
import {WellAnnotations} from '@/common/model/WellAnnotations';
import {WellLogWithTools} from '@/components/well-log/WellLogWithTools';

const {state, registerStyleable} = useStore();
const props = defineProps<{
  source: WellLogSource,
  templateUrl: string,
  showAnnotations?: boolean,
  headerScrollTo?: 'top' | 'bottom'
}>();
const canvas = ref();
const container = ref();

function getVisibleAnnotations (): WellAnnotations {
    return props.showAnnotations ?
        state.annotations.get(props.source) || new WellAnnotations() :
        new WellAnnotations();
}

function setCursorPosition (value: number | null) {
    const cursor = state.cursors.get(props.source);
    if (cursor) cursor.value = value;
}

async function loadTemplate (): Promise<string> {
    const response = await fetch(props.templateUrl);
    return response.text();
}

function createWellLog (template: string) {
    const wellLog = new WellLogWithTools(
        canvas.value,
        container.value,
        props.source,
        template,
        getVisibleAnnotations(),
        state.cssLoader
    );

    registerStyleable(wellLog);
    wellLog.onCrossHairMoved(setCursorPosition);
}

onMounted(() => props.source.loaded
    .then(loadTemplate)
    .then(createWellLog)
);
</script>

<style lang="scss" scoped>
.canvas-container {
  padding: 8px;
  height: 100%;
}
</style>
