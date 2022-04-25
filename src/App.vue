<template>
  <theme-switcher></theme-switcher>
  <vertical-log></vertical-log>
  <horizontal-log></horizontal-log>
  <wells-map></wells-map>
  <wells-model></wells-model>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import ThemeSwitcher from '@/components/theme-switcher.vue';
import HorizontalLog from '@/components/horizontal-log.vue';
import VerticalLog from '@/components/vertical-log.vue';
import WellsMap from '@/components/wells-map.vue';
import WellsModel from '@/components/wells-model.vue';

@Options({
  components: {
    ThemeSwitcher,
    HorizontalLog,
    VerticalLog,
    WellsMap,
    WellsModel
  }
})
export default class App extends Vue {}
</script>

<style lang="scss">

@import '/src/assets/theme-dark.scss';
@import '/src/assets/theme-light.scss';

body {
  background: var(--background-color);
  transition:
    color .5s,
    border .5s,
    background-color .5s
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  display: grid;
  grid-template-columns: repeat(3, 1fr);

  .theme-switcher {
    grid-row-start: 1;
    grid-row-end: 2;
    grid-column-start: 1;
    grid-column-end: 4;
  }

  .horizontal-log {
    grid-column-start: 2;
    grid-column-end: 4;
  }

  .vertical-log {
    grid-row-start: 2;
    grid-row-end: 5;
  }

  .horizontal-log,
  .vertical-log,
  .wells-map,
  .wells-model {
    margin: 8px;
    padding: 16px;
    border-radius: 4px;
    color: var(--title-color);
    background: var(--card-color);

    @media (max-width: 600px) {
      grid-row-start: auto;
      grid-row-end: auto;
      grid-column-start: 1;
      grid-column-end: 4;
    }
  }
}
</style>
