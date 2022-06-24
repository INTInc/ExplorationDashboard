import {AppTheme} from '@/common/styling/AppTheme';
import {WellsMap} from '@/components/wells-map/WellsMap';

export class WellsMapDynamicTiles extends WellsMap {

    applyTheme (theme: AppTheme): void {
        super.applyTheme(theme);
        const styleUrl = theme === AppTheme.Dark ?
            'https://www.arcgis.com/sharing/rest/content/items/5621d59a390a465c9018aab22de3fed8/resources/styles/root.json' :
            'https://www.arcgis.com/sharing/rest/content/items/7dc6cea0b1764a1f9af2e679f642f0f5/resources/styles/root.json';

        this.replaceTilesLayer(styleUrl);
    }

    private replaceTilesLayer (styleUrl: string) {
        this.map.removeLayer(this.map.getLayer(0));
        this.map.insertLayer(WellsMap.createTilesLayer({styleUrl}), 0);
    }

}
