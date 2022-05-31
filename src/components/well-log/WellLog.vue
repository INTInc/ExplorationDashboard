<template>
    <div class="well-log">
        <div ref="container" class="canvas-container">
            <canvas ref="canvas"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref } from 'vue';
import { useStore } from '@/store';

import { WellLog } from '@/components/well-log/WellLog';
import { WellLogSource } from '@/components/well-log/WellLogSource';
import { WellAnnotations } from '@/common/model/WellAnnotations';

const { state, registerStyleable } = useStore();
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

function getVisibleAnnotations(): WellAnnotations {
  return props.showAnnotations
    ? state.annotations.get(props.source) || new WellAnnotations()
    : new WellAnnotations();
}

function setCursorPosition(value: number | null) {
  const cursor = state.cursors.get(props.source);
  if (cursor) cursor.value = value;
}

async function loadTemplate(): Promise<string> {
  const response = await fetch(props.templateUrl);
  return response.text();
}

function createWellLog(template: string) {
  registerStyleable(
    new WellLog(
      canvas.value,
      container.value,
      props.source,
      template,
      props.limits,
      props.fitTracks,
      props.headerScrollTo,
      getVisibleAnnotations(),
      state.cssLoader,
      setCursorPosition
    )
  )
}

onMounted(() => loadTemplate().then(createWellLog));
</script>

<style lang="scss" scoped>
.canvas-container {
    padding: 10px;
    height: 100%;
}
</style>
