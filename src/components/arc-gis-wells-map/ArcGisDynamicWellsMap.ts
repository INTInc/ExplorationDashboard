import {AppTheme} from '@/common/styling/AppTheme';
import {ArcGisWellsMap} from '@/components/arc-gis-wells-map/ArcGisWellsMap';
import {VectorTile as VectorTileLayer} from '@int/geotoolkit/map/layers/VectorTile';
import {Deferred} from '@/common/model/Deferred';

const ARCGIS_SUBDOMAIN = 'rotl97ecctpzhow9';
const ARCGIS_LIGHT_MAP_ITEM = '23b05c45885c43b1b33a0666e919629b';
const ARCGIS_DARK_MAP_ITEM = 'dff09cf7812d4844bbc38beb6a5a7233';

export class ArcGisDynamicWellsMap extends ArcGisWellsMap {

    private tileLayers = new Map<AppTheme, VectorTileLayer>();
    private tileLayersLoaded = new Deferred<unknown>();

    constructor (...args: ConstructorParameters<typeof ArcGisWellsMap>) {
        super(...args);
    }

    applyTheme (theme:AppTheme) {
        super.applyTheme(theme);
        this.tileLayersLoaded.promise.then(() => {
            const selectedLayer = this.tileLayers.get(theme);
            if (selectedLayer) {
                this.tileLayers.forEach(layer => this.map.removeLayer(layer));
                this.map.insertLayer(selectedLayer, 0);
            }
        });
    }

    protected addTilesLayer () {
        Promise.all([
            this.createTilesLayerByArcGisItemId(ARCGIS_LIGHT_MAP_ITEM).then(layer => this.tileLayers.set(AppTheme.Light, layer)),
            this.createTilesLayerByArcGisItemId(ARCGIS_DARK_MAP_ITEM).then(layer => this.tileLayers.set(AppTheme.Dark, layer))
        ]).then(() => this.tileLayersLoaded.resolve(true));
    }

    private createTilesLayerByArcGisItemId (itemId: string) {
        const styleUrl = `https://${ARCGIS_SUBDOMAIN}.maps.arcgis.com/sharing/rest/content/items/${itemId}/resources/styles/root.json`;
        return this.createTilesLayer({ styleUrl });
    }

}
