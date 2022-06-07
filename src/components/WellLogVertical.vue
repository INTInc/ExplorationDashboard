<template>
  <well-log
    :source="props.source"
    :template-url="templateUrl"
    :show-annotations="true"
    :fit-tracks="3"
  ></well-log>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import WellLog from '@/components/well-log/WellLog.vue';
import { WellLogSource } from '@/components/well-log/WellLogSource';

const props = defineProps<{
  source: WellLogSource
}>();

const templateUrl = '/toolkit-welllog-templates/vertical-log.json';
</script>