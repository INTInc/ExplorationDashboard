<template>
  <well-log
    :source="props.source"
    :index-measurements="indexMeasurements"
    :template-url="templateUrl"
    :fit-tracks="1"
  ></well-log>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import WellLog from '@/components/well-log/WellLog.vue';
import { WellLogSource } from '@/components/well-log/WellLogSource';
import { IndexMeasurement } from '@/common/model/IndexMeasurement';

const props = defineProps<{
  source: WellLogSource
}>();

const templateUrl = '/toolkit-welllog-templates/horizontal-log.json';
const indexMeasurements = new Set()
    .add(new IndexMeasurement('MD'))
    .add(new IndexMeasurement('HRZDISP', 'HRZ'));
</script>