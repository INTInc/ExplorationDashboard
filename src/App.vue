<template>
  <vertical-log></vertical-log>
  <horizontal-log></horizontal-log>
  <wells-map></wells-map>
  <wells-model></wells-model>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import HorizontalLog from '@/components/horizontal-log.vue';
import VerticalLog from '@/components/vertical-log.vue';
import WellsMap from '@/components/wells-map.vue';
import WellsModel from '@/components/wells-model.vue';

@Options({
  components: {
    HorizontalLog,
    VerticalLog,
    WellsMap,
    WellsModel
  }
})
export default class App extends Vue {}
</script>

<style lang="scss">

body {
  background: rgb(224, 224, 224);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;

  display: grid;
  grid-template-columns: repeat(3, 1fr);


  .horizontal-log {
    grid-column-start: 2;
    grid-column-end: 4;
  }

  .vertical-log {
    grid-row-start: 1;
    grid-row-end: 3;
  }

  .horizontal-log,
  .vertical-log,
  .wells-map,
  .wells-model {
    margin: 8px;
    padding: 8px;
    border-radius: 4px;
    background: rgb(255, 255, 255);

    @media (max-width: 600px) {
      grid-row-start: auto;
      grid-row-end: auto;
      grid-column-start: 1;
      grid-column-end: 4;
    }
  }
}
</style>
