<template>
    <div class="wells-map" ref="root">
        <canvas ref="canvas"/>
    </div>
</template>

<script lang="ts">
import { Map } from '@int/geotoolkit/map/Map';
import { Plot } from '@int/geotoolkit/plot/Plot';
import { Tile } from '@int/geotoolkit/map/layers/Tile';
import { Rect } from '@int/geotoolkit/util/Rect';
import { Options, Vue } from 'vue-class-component';

const BING_KEY = 'AlBIEAbAFzZkDPtXQ2zN0MdBcIpcucCpPvSiRTeHMwpZvIizIGMM1G07NFzlW0MH';

@Options({
    name: 'WellsMap',
    data() {
        return {
            plot: null
        }
    },
    mounted() {
        this.createPlot();
        this.resizePlot();
        this.addResizeListener();
    },
    methods: {
        createPlot() {
            this.plot = new Plot({
                canvaselement: this.$refs.canvas,
                root: this.createMap(),
                autosize: true
            })
        },
        createMap() {
            const openStreetsMapLayer = new Tile({
                url: 'https://demo.int.com/osm_tiles/',
                formatterfunction: (z: number, y: number, x: number) => z + '/' + x + '/' + y + '.png'
            });

            return new Map()
                .addLayer(openStreetsMapLayer)
        },
        resizePlot() {
            this.plot.setSize(this.$refs.root.clientWidth, this.$refs.root.clientHeight);
        },
        addResizeListener() {
            window.addEventListener('resize', () => this.resizePlot());
        }
    }
})
export default class WellsMap extends Vue {}
</script>

<style lang="scss" scoped>
.wells-map {
    padding: 0;
    overflow: hidden;
}
</style>