<template>
  <div ref="container" class="wells-model">
    <button class="button" title="Switch well trajectories mode" @click="toggleTrajectoriesMode()">
      <i :class="trajectoriesMode === TrajectoryMode.Line ? 'fa-cube' : 'fa-chart-line'" class="fa"/>
    </button>
    <div ref="compassContainer" class="compass-container"></div>
    <div ref="model"></div>
  </div>
</template>

<script lang="ts" setup>
import {defineProps, ref, watch} from 'vue';
import {onMounted} from '@vue/runtime-core';
import {useStore} from '@/store';
import {Wells3DStyleable} from '@/components/wells-3d/Wells3DStyleable';
import {Wells3D} from '@/components/wells-3d/Wells3D';
import {TrajectoryMode} from '@/components/wells-3d/objects/WellTrajectory';

const props = defineProps<{
  modelPadding: number,
  cameraDistance: number,
  measurement?: string
}>();
const {state, registerStyleable} = useStore();

const model = ref();
const container = ref();
const compassContainer = ref();
const trajectoriesMode = ref(TrajectoryMode.Line);

function dataLoaded (): Promise<unknown> {
    const promises: Array<Promise<unknown>> = [];
    state.wells.forEach(well => promises.push(well.loaded));
    state.annotations.forEach(annotations => promises.push(annotations.loaded));
    return Promise.all(promises);
}

function createWells3D () {
    const wells3d = new Wells3DStyleable(
        model.value,
        container.value,
        compassContainer.value,
        state.wells,
        state.annotations,
        props.measurement || null,
        props.cameraDistance,
        props.modelPadding
    );
    registerStyleable(wells3d);
    watchTrajectoriesMode(wells3d);
    watchCursors(wells3d);
}

function watchCursors (wells3d: Wells3D) {
    state.cursors.forEach((depthRef, well) => watch(depthRef, depth => wells3d.moveCursor(well, depth)));
}

function watchTrajectoriesMode (wells3d: Wells3D) {
    watch(trajectoriesMode, mode => wells3d.setTrajectoriesMode(mode));
}

function toggleTrajectoriesMode () {
    trajectoriesMode.value = trajectoriesMode.value === TrajectoryMode.Line ?
        TrajectoryMode.Tube :
        TrajectoryMode.Line;
}

onMounted(() => dataLoaded().then(createWells3D));
</script>

<style lang="scss" scoped>
.wells-model {
  position: relative;

  .button,
  .compass-container {
    position: absolute;
    margin: 16px;
    z-index: 2;
  }

  .button {
    bottom: 0;
    right: 0;
  }

  .compass-container {
    bottom: 0;
    left: 0;
  }
}
</style>
