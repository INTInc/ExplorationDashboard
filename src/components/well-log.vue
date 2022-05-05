<template>
    <div class="well-log">
        <div ref="container" class="canvas-container">
            <canvas ref="canvas"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { defineProps } from 'vue';

const props = defineProps<{
  templateUrl: string
}>();

async function fetchTemplate(templateUrl: string): Promise<string> {
  const response = await fetch(templateUrl);
  return await response.text(); 
}

function validateTemplate(template: string) {
  //TODO here will be runtime template validation
  console.log(JSON.parse(template));
  return template;
}

function handleError(e: Error) {
  console.error(`Problem loading template from ${props.templateUrl}.`);
}

function initialize() {
  fetchTemplate(props.templateUrl)
    .then(validateTemplate)
    .catch(handleError)
}

onMounted(() => {
  initialize();
});
</script>

<style lang="scss" scoped>
.canvas-container {
    padding: 10px;
    height: 100%;
}
</style>
