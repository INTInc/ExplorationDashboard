<template>
  <header>
    <h2>Exploration dashboard</h2>
    <theme-switcher></theme-switcher>
  </header>
  <div class="charts-container">
    <well-log
      class="vertical-log"
      :source="wellB2"
      :template-url="'/templates/vertical-log.json'"
      :fit-tracks="3"
      :show-annotations="true"
    ></well-log>
    <well-log
      class="horizontal-log"
      :source="wellB32"
      :template-url="'/templates/horizontal-log.json'"
      :fit-tracks="1"
    ></well-log>
    <wells-map></wells-map>
    <wells-model
      :model-padding="500"
      :camera-distance="6000"
      :show-annotations="true"
      :show-well-names="true"
      :show-cursors="true"
      :measurement="'DLS'"
    ></wells-model>
  </div>
</template>

<script setup lang="ts">
import ThemeSwitcher from '@/components/theme-switcher/theme-switcher.vue';
import WellLog from '@/components/well-log.vue';
import WellsMap from '@/components/wells-map.vue';
import WellsModel from '@/components/wells-model/wells-model.vue';

import { Store, useStore } from '@/store';
import { WellB2 } from '@/data-sources/WellB2';
import { WellB32 } from '@/data-sources/WellB32';

const { addField, addWell, addCursor, addAnnotations }: Store = useStore();

addField().setUrl('/data/fieldB.json');

const wellB2 = new WellB2();
const wellB32 = new WellB32();

//TODO add logic to switch between las files for different devices

addWell(wellB2).setUrls({
  surveysUrl: '/data/wellB-2/surveys.las',
  measurementsUrl: '/data/wellB-2/logs_desktop.las'
})
addWell(wellB32).setUrls({
  topsUrl: '/data/wellB-32/tops.las',
  surveysUrl: '/data/wellB-32/surveys.las',
  measurementsUrl: '/data/wellB-32/logs_desktop.las'
});
addCursor(wellB2);
addCursor(wellB32);
addAnnotations(wellB2).setUrl('/data/wellB-2/tops.json');
addAnnotations(wellB32).setUrl('/data/wellB-32/tops.json');

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

  header {
    height: 5vh;
    min-height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--text-color);

    h2 {
      margin: 16px 16px 0 16px;
    }
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
      border-radius: 4px;
      border: 1px solid rgba(155, 155, 155, 0.5);

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
