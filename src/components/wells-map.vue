<template>
    <div class="wells-map" ref="root">
        <canvas ref="canvas"/>
    </div>
</template>

<script lang="ts">
import { Field } from '@/Field';

import { Map } from '@int/geotoolkit/map/Map';
import { Plot } from '@int/geotoolkit/plot/Plot';
import { Tile as TileLayer } from '@int/geotoolkit/map/layers/Tile';
import { Shape as ShapeLayer } from '@int/geotoolkit/map/layers/Shape';
import { Options, Vue } from 'vue-class-component';
import { GeodeticSystem } from '@int/geotoolkit/map/GeodeticSystem';
import { Shape } from '@int/geotoolkit/scene/shapes/Shape';
import { AnchorType } from '@int/geotoolkit/util/AnchorType';
import { PointerMode } from '@int/geotoolkit/controls/tools/PointerMode';

@Options({
    name: 'WellsMap',
    data() {
        return {
            map: null,
            plot: null
        }
    },
    mounted() {
        this.createMap();
        this.createPlot();
        this.resizePlot();
        this.addResizeListener();
    },
    methods: {
        createPlot() {
            this.plot = new Plot({
                canvaselement: this.$refs.canvas,
                root: this.map,
                autosize: true
            })
        },
        createMap() {
            const openStreetsMapLayer = new TileLayer({
                url: 'https://demo.int.com/osm_tiles/',
                formatterfunction: (z: number, y: number, x: number) => z + '/' + x + '/' + y + '.png'
            });
                
            this.map = new Map({
                system: GeodeticSystem.WGS84,
                tooltip: {
                    alignment: AnchorType.BottomCenter,
                    offsetx: 0,
                    offsety: 0,
                    mode: PointerMode.Hover,
                    autoupdate: false
                }
            })
                .addLayer(openStreetsMapLayer);

            this.showExplorationObjects();
        },
        showExplorationObjects() {
            const field = new Field('/data/fieldB.json');

            field.load().then(() => {               
                this.map.addLayer(
                    new ShapeLayer({
                        alpha: 0.75,
                        tooltip: {
                            visible: true,
                            formatter: (shapes: Shape[]) => shapes[0] && shapes[0].getName() || null
                        }
                    })
                        .addShape(field.zone)
                        .addShape(field.wells[0])
                        .addShape(field.wells[1])
                )
                    .setZoomLevel(5)
                    .panTo(field.position, GeodeticSystem.WGS84)
            });
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