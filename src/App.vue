<template>
  <theme-switcher></theme-switcher>
  <div class="charts-container">
    <vertical-log></vertical-log>
    <horizontal-log></horizontal-log>
    <wells-map></wells-map>
    <wells-model></wells-model>
  </div>
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
      padding: 16px;
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

    .wells-map,
    .vertical-log {
      padding: 0;
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
