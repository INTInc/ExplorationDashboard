<template>
    <div class="theme-switcher">
        <span>Theme:</span>
        <select v-model="selectorValue" @change="onThemeChanged">
            <option :value="Theme.Light">Light</option>
            <option :value="Theme.Dark">Dark</option> 
        </select>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

enum Theme {
    Light = 'light',
    Dark = 'dark'
}

const STORAGE_ITEM_KEY = 'preferred-theme';
const DEFAULT_THEME = Theme.Light;

@Options({
    name: 'ThemeSwitcher',
    data() {
        return {
            Theme,
            selectorValue: null
        }
    },
    mounted() {
        this.selectorValue = this.savedTheme || DEFAULT_THEME;
        this.themeMediaQuery.addEventListener('change', () => this.onSystemThemeChanged());
        this.onThemeChanged();
    },
    computed: {
        savedTheme(): Theme | null {
            return localStorage.getItem(STORAGE_ITEM_KEY) as Theme; 
        },
        themeMediaQuery(): MediaQueryList {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)'); 
        }
    },
    methods: {
        onSystemThemeChanged() {
           this.selectorValue = this.themeMediaQuery.matches ? Theme.Dark : Theme.Light;
           this.onThemeChanged();
        },
        onThemeChanged() {
           this.setTheme(this.selectorValue);
           this.saveTheme(this.selectorValue);
        },
        setTheme(theme: Theme) {
            document.documentElement.setAttribute('theme', theme);
        },
        saveTheme(theme: Theme) {
            
            localStorage.setItem(STORAGE_ITEM_KEY, theme);
        }
    }
})
export default class ThemeSwitcher extends Vue {}
</script>

<style scoped lang="scss">
.theme-switcher {
    padding: 16px;
    text-align: right;
    color: var(--text-color);

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