<template>
  <header>
    <h2>Exploration dashboard</h2>
    <theme-switcher></theme-switcher>
  </header>
  <div class="charts-container">
    <well-log-vertical
      class="card vertical-log"
      :source="wellB2"
    ></well-log-vertical>
    <well-log-horizontal
      class="card horizontal-log"
      :source="wellB32"
    ></well-log-horizontal>
    <wells-map
      class="card"
    ></wells-map>
    <wells-model
      class="card"
      :model-padding="500"
      :camera-distance="3000"
      :measurement="'DLS'"
    ></wells-model>
  </div>
</template>

<script setup lang="ts">
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import WellsMap from '@/components/wells-map/WellsMap.vue';
import WellsModel from '@/components/wells-3d/Wells3D.vue';
import WellLogVertical from '@/components/WellLogVertical.vue';
import WellLogHorizontal from '@/components/WellLogHorizontal.vue';

import { Store, useStore } from '@/store';
import { WellB2 } from '@/data-sources/WellB2';
import { WellB32 } from '@/data-sources/WellB32';

const { setupCssLoader, addField, addWell, addCursor, addAnnotations }: Store = useStore();

setupCssLoader(
    '/toolkit-themes/common.css',
    '/toolkit-themes/theme-light.css',
    '/toolkit-themes/theme-dark.css'
);

addField().setUrl('/data/fieldB.json');

const wellB2 = new WellB2();
const wellB32 = new WellB32();

//TODO add logic to switch between las files for different devices

addWell(wellB2).setUrls({
  surveysUrl: '/data/wellB-2/surveys.las',
  measurementsUrl: '/data/wellB-2/logs_desktop.las'
});
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
@import '/src/assets/themes/theme-dark';
@import '/src/assets/themes/theme-light';
@import '/src/assets/app';
</style>
