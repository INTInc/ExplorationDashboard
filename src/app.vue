<template>
  <theme-switcher></theme-switcher>
  <div class="charts-container">
    <well-log
      class="vertical-log"
      :source="state.wellB2"
      :template-url="'/templates/vertical-log.json'"
    ></well-log>
    <well-log
      class="horizontal-log"
      :source="state.wellB32"
      :template-url="'/templates/horizontal-log.json'"
    ></well-log>
    <wells-map></wells-map>
    <wells-model
      :model-padding="500"
      :camera-distance="6000"
    ></wells-model>
  </div>
</template>

<script setup lang="ts">
import ThemeSwitcher from '@/components/theme-switcher.vue';
import WellLog from '@/components/well-log/well-log.vue'; 
import WellsMap from '@/components/wells-map/wells-map.vue';
import WellsModel from '@/components/wells-model/wells-model.vue';

import { Store, useStore } from '@/store';

const { state }: Store = useStore();

//TODO add logic to switch between las files for different devices

state.wellB2
  .setSurveysLasUrl('/data/wellB-2/surveys.las')
  .setMeasurementsLasUrl('/data/wellB-2/logs_desktop.las')
  .setAnnotationsUrl('/data/wellB-32/tops.json');
state.wellB32
  .setTopsLasUrl('/data/wellB-32/tops.las')
  .setSurveysLasUrl('/data/wellB-32/surveys.las')
  .setMeasurementsLasUrl('/data/wellB-32/logs_desktop.las')
  .setAnnotationsUrl('/data/wellB-32/tops.json');

state.explMap.url = '/data/fieldB.json';
</script>

<style lang="scss">

@import '/src/assets/theme-dark.scss';
@import '/src/assets/theme-light.scss';

body {
  margin: 0;
  padding: 0;
  background: var(--background-color);
  transition:
    color .5s,
    border .5s,
    background-color .5s;

    div {
      box-sizing: border-box;
    }
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  .theme-switcher {
    height: 5vh;
    min-height: 42px;
  }

  .charts-container {
    height: 95vh;
    min-height: 800px;

    padding: 8px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);

    .horizontal-log {
      grid-column-start: 2;
      grid-column-end: 4;
    }

    .vertical-log {
      grid-row-start: 1;
      grid-row-end: 5;
    }

    .horizontal-log,
    .vertical-log,
    .wells-map,
    .wells-model {
      margin: 8px;
      overflow: hidden;
      border-radius: 8px;

      color: var(--title-color);
      background: var(--card-color);

      @media (max-width: 800px) {
        grid-row-start: auto;
        grid-row-end: auto;
        grid-column-start: 1;
        grid-column-end: 4;
      }
    }

    @media (max-width: 800px) {
      grid-template-rows: repeat(4, 1fr);
    }

  }

  @media (max-width: 800px) {
    .theme-switcher,
    .charts-container {
      height: unset;
    }
  }
}
</style>
