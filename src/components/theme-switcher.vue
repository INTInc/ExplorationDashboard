<template>
    <div class="theme-switcher">
        <span>Theme:</span>
        <select v-model="selectorValue" @change="onThemeChanged">
            <option :value="Theme.System">System</option>
            <option :value="Theme.Light">Light</option>
            <option :value="Theme.Dark">Dark</option> 
        </select>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

enum Theme {
    System = 'system',
    Light = 'light',
    Dark = 'dark'
}

@Options({
    name: 'ThemeSwitcher',
    data() {
        return {
            Theme,
            selectorValue: Theme.System,
        }
    },
    mounted() {
        this.useDeviceTheme();
    },
    computed: {
        themeMediaQuery() {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)'); 
        },
        themeMediaQueryListener() {
            return (event: MediaQueryListEvent) => this.selectThemeByMediaQuery(event);
        }
    },
    methods: {
        onThemeChanged() {
            this.selectorValue === Theme.System ? this.useDeviceTheme() : this.useManualSelectedTheme();
        },
        useDeviceTheme() {
            this.themeMediaQuery.addEventListener('change', this.themeMediaQueryListener);
            this.selectThemeByMediaQuery(this.themeMediaQuery);
        },
        useManualSelectedTheme() {
            this.themeMediaQuery.removeEventListener('change', this.themeMediaQueryListener);
            this.setThemeAttribute(this.selectorValue);
        },
        selectThemeByMediaQuery(matchable: MediaQueryList | MediaQueryListEvent) {
           this.setThemeAttribute(matchable.matches ? Theme.Dark : Theme.Light);
        },
        setThemeAttribute(theme: Theme) {
            document.documentElement.setAttribute('theme', theme);
        },
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
        font-size: 14px;
        margin-left: 8px;
        color: var(--text-color);
        background: transparent;
        outline: none;
        padding: 8px;
        border: 1px solid var(--stroke-color);
        border-radius: 4px;

        //TODO fix select color, maybe use js dropdown instead
    }
}
</style>