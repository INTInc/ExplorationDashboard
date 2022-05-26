<template>
    <div class="theme-switcher">
        <span>Theme:</span>
        <select v-model="selectorValue" @change="onThemeChanged">
            <option :value="Theme.Light">Light</option>
            <option :value="Theme.Dark">Dark</option> 
        </select>
    </div>
</template>

<script setup lang="ts">
import { useStore } from '@/store';
import { Theme } from '@/components/theme-switcher/Theme';
import { onMounted, ref } from '@vue/runtime-core';
import { computed, Ref } from 'vue';

const STORAGE_ITEM_KEY = 'preferred-theme';
const DEFAULT_THEME = Theme.Light;

const { setTheme } = useStore();

const savedTheme = computed(() => localStorage.getItem(STORAGE_ITEM_KEY) as Theme);
const themeMediaQuery = computed(() => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)'));

const selectorValue: Ref<Theme> = ref(DEFAULT_THEME);

function onSystemThemeChanged() {
  selectorValue.value = themeMediaQuery.value.matches ? Theme.Dark : Theme.Light;
  onThemeChanged();
}

function onThemeChanged() {
  setTheme(selectorValue.value);
  saveTheme(selectorValue.value);
  applyTheme(selectorValue.value);
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('theme', theme);
}

function saveTheme(theme: Theme) {
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

    select {
        font-size: 16px;
        margin-left: 8px;
        color: var(--text-color);
        background: transparent;
        border: none;
        outline: none;
    }
}
</style>