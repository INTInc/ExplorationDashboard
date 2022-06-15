<template>
  <div class="theme-switcher">
    <button class="button" @click="toggleTheme">
      <i :class="selectorValue === AppTheme.Dark ? 'fa-sun' : 'fa-moon'" class="fa"/>
    </button>
  </div>
</template>

<script lang="ts" setup>
import {useStore} from '@/store';
import {AppTheme} from '@/common/styling/AppTheme';
import {onMounted, ref} from '@vue/runtime-core';
import {computed, Ref} from 'vue';
import {MediaQueryHelper} from '@/common/layout/MediaQueryHelper';

const STORAGE_ITEM_KEY = 'preferred-theme';
const DEFAULT_THEME = AppTheme.Light;

const {setAppTheme} = useStore();

const savedTheme = computed(() => localStorage.getItem(STORAGE_ITEM_KEY) as AppTheme);
const themeMediaQuery = computed(() => MediaQueryHelper.preferredTheme());

const selectorValue: Ref<AppTheme> = ref(DEFAULT_THEME);

function toggleTheme () {
    selectorValue.value = selectorValue.value === AppTheme.Dark ? AppTheme.Light : AppTheme.Dark;
    onThemeChanged();
}

function onSystemThemeChanged () {
    selectorValue.value = themeMediaQuery.value.matches ? AppTheme.Dark : AppTheme.Light;
    onThemeChanged();
}

function onThemeChanged () {
    setAppTheme(selectorValue.value);
    saveTheme(selectorValue.value);
    applyTheme(selectorValue.value);
}

function applyTheme (theme: AppTheme) {
    document.documentElement.setAttribute('theme', theme);
}

function saveTheme (theme: AppTheme) {
    localStorage.setItem(STORAGE_ITEM_KEY, theme);
}

onMounted(() => {
    selectorValue.value = savedTheme.value || DEFAULT_THEME;
    themeMediaQuery.value.addEventListener('change', onSystemThemeChanged);
    onThemeChanged();
});
</script>

<style lang="scss" scoped>
.theme-switcher {
  display: flex;
  align-items: center;
  justify-content: right;
  padding: 16px 16px 0 16px;
}
</style>
