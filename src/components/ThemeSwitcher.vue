<template>
    <div class="theme-switcher">
      <button @click="toggleTheme">
        <i v-if="selectorValue === AppTheme.Dark" class="fa fa-sun"></i>
        <i v-if="selectorValue === AppTheme.Light" class="fa fa-moon"></i>
      </button>
    </div>
</template>

<script setup lang="ts">
import { useStore } from '@/store';
import { AppTheme } from '@/common/styling/AppTheme';
import { onMounted, ref } from '@vue/runtime-core';
import { computed, Ref } from 'vue';

const STORAGE_ITEM_KEY = 'preferred-theme';
const DEFAULT_THEME = AppTheme.Light;

const { setAppTheme } = useStore();

const savedTheme = computed(() => localStorage.getItem(STORAGE_ITEM_KEY) as AppTheme);
const themeMediaQuery = computed(() => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)'));

const selectorValue: Ref<AppTheme> = ref(DEFAULT_THEME);

function toggleTheme() {
  selectorValue.value = selectorValue.value === AppTheme.Dark ? AppTheme.Light : AppTheme.Dark;
  onThemeChanged();
}

function onSystemThemeChanged() {
  selectorValue.value = themeMediaQuery.value.matches ? AppTheme.Dark : AppTheme.Light;
  onThemeChanged();
}

function onThemeChanged() {
  setAppTheme(selectorValue.value);
  saveTheme(selectorValue.value);
  applyTheme(selectorValue.value);
}

function applyTheme(theme: AppTheme) {
  document.documentElement.setAttribute('theme', theme);
}

function saveTheme(theme: AppTheme) {
  localStorage.setItem(STORAGE_ITEM_KEY, theme);
}

onMounted(() => {
  selectorValue.value = savedTheme.value || DEFAULT_THEME;
  themeMediaQuery.value.addEventListener('change', onSystemThemeChanged);
  onThemeChanged();
})
</script>

<style scoped lang="scss">
.theme-switcher {
    display: flex;
    align-items: center;
    justify-content: right;
    padding: 16px 16px 0 16px;

    button {
      padding: 8px;
      font-size: 14px;
      border-radius: 4px;
      border: 1px solid rgba(155, 155, 155, 0.5);
      background: transparent;
      color: var(--text-color);
      
      &:hover {
        cursor: pointer;
      }
    }
}
</style>