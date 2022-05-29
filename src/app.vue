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
      :camera-distance="2000"
      :show-annotations="true"
      :show-well-names="true"
      :show-cursors="true"
      :measurement="'DLS'"
    ></wells-model>
  </div>
</template>

<script setup lang="ts">
import ThemeSwitcher from '@/components/theme-switcher.vue';
import WellLog from '@/components/well-log.vue';
import WellsMap from '@/components/wells-map.vue';
import WellsModel from '@/components/wells-model/wells-model.vue';

import { Store, useStore } from '@/store';
import { WellB2 } from '@/data-sources/WellB2';
import { WellB32 } from '@/data-sources/WellB32';

const { setupToolkitThemes, addField, addWell, addCursor, addAnnotations }: Store = useStore();

setupToolkitThemes(
    '/themes/common.css',
    '/themes/theme-light.css',
    '/themes/theme-dark.css'
);

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
@import '/src/assets/app';
</style>
