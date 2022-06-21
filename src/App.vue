<template>
  <header>
    <h2>Exploration dashboard</h2>
    <theme-switcher></theme-switcher>
  </header>
  <div class="charts-container">
    <well-log
        :show-annotations="true"
        :source="wellB2"
        :template-url="'./toolkit-welllog-templates/vertical-log.json'"
        class="card vertical-log"
    ></well-log>
    <well-log
        :source="wellB32"
        :template-url="'./toolkit-welllog-templates/horizontal-log.json'"
        class="card horizontal-log"
    ></well-log>
    <wells-map
        class="card"
        :well-names="['Field B Well 1', 'Field B Well 2']"
    ></wells-map>
    <wells-model
        :camera-distance="3000"
        :measurement="'DLS'"
        :model-padding="500"
        class="card"
    ></wells-model>
  </div>
</template>

<script lang="ts" setup>
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import WellLog from '@/components/WellLog.vue';
import WellsMap from '@/components/WellsMap.vue';
import WellsModel from '@/components/Wells3D.vue';

import {Store, useStore} from '@/store';
import {WellB2} from '@/data-sources/WellB2';
import {WellB32} from '@/data-sources/WellB32';
import {MediaQueryHelper} from '@/common/layout/MediaQueryHelper';

const {setupCssLoader, addField, addWell, addCursor, addAnnotations}: Store = useStore();

setupCssLoader(
    './toolkit-themes/common.css',
    './toolkit-themes/theme-light.css',
    './toolkit-themes/theme-dark.css'
);

addField().setUrl('./data/fieldB.json');

const wellB2 = new WellB2();
const wellB32 = new WellB32();
const deviceType = MediaQueryHelper.deviceType();

addWell(wellB2).setUrls({
    surveysUrl: './data/wellB-2/surveys.las',
    measurementsUrl: `./data/wellB-2/logs_${deviceType}_decimated.las`
});
addWell(wellB32).setUrls({
    topsUrl: './data/wellB-32/tops.las',
    surveysUrl: './data/wellB-32/surveys.las',
    measurementsUrl: `./data/wellB-32/logs_${deviceType}.las`
});
addCursor(wellB2);
addCursor(wellB32);
addAnnotations(wellB2).setUrl('./data/wellB-2/tops.json');
addAnnotations(wellB32).setUrl('./data/wellB-32/tops.json');

</script>

<style lang="scss">
@import '/src/assets/themes/theme-dark';
@import '/src/assets/themes/theme-light';
@import '/src/assets/app';
</style>
