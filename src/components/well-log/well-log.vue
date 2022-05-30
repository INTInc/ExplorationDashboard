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
import { createWellLogWidget } from '@/components/well-log/createWellLogWidget';
import { WellLogSource } from '@/components/well-log/WellLogSource';
import { WellAnnotations } from '@/common/model/WellAnnotations';

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

function createWidget() {
  return createWellLogWidget(
    canvas.value,
    container.value,
    props.source,
    props.templateUrl,
    props.limits,
    props.fitTracks,
    props.headerScrollTo,
    getVisibleAnnotations(),
    setCursorPosition
  )
    .then(widget => widget.connectThemesLoader(state))
}

function getVisibleAnnotations(): WellAnnotations {
  return props.showAnnotations ? state.annotations.get(props.source) || new WellAnnotations() : new WellAnnotations();
}

function setCursorPosition(value: number | null) {
  const cursor = state.cursors.get(props.source);
  if (cursor) cursor.value = value;
}

onMounted(createWidget);
</script>

<style lang="scss" scoped>
.canvas-container {
    padding: 10px;
    height: 100%;
}
</style>
