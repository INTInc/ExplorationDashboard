import {Map} from '@int/geotoolkit/map/Map';
import {GeodeticSystem} from '@int/geotoolkit/map/GeodeticSystem';
import {AnchorType} from '@int/geotoolkit/util/AnchorType';
import {PointerMode} from '@int/geotoolkit/controls/tools/PointerMode';
import {VectorTile as VectorTileLayer} from '@int/geotoolkit/map/layers/VectorTile';
import {Field} from '@/data-sources/Field';
import {Polygon} from '@int/geotoolkit/scene/shapes/Polygon';
import {Path} from '@int/geotoolkit/scene/shapes/Path';
import {Shape as ShapeLayer} from '@int/geotoolkit/map/layers/Shape';
import {Shape} from '@int/geotoolkit/scene/shapes/Shape';
import {StretchablePlot} from '@/common/layout/StretchablePlot';
import {Group} from '@int/geotoolkit/scene/Group';
import {ToolkitCssLoader} from '@/common/styling/ToolkitCssLoader';
import {ToolkitCssStyleable} from '@/common/styling/ToolkitCssStyleable';
import {SymbolShape} from '@int/geotoolkit/scene/shapes/SymbolShape';
import {FontPainter} from '@int/geotoolkit/scene/shapes/painters/FontPainter';
import {FillStyle} from '@int/geotoolkit/attributes/FillStyle';
import {LineStyle} from '@int/geotoolkit/attributes/LineStyle';
import {Plot} from '@int/geotoolkit/plot/Plot';
import {Toolbar} from '@int/geotoolkit/controls/toolbar/Toolbar';
import {Button} from '@int/geotoolkit/controls/toolbar/Button';
import {Orientation} from '@int/geotoolkit/util/Orientation';
import {loadFont} from '@int/geotoolkit/util/fontloader';
import {Styleable} from '@/common/styling/Styleable';
import {AppTheme} from '@/common/styling/AppTheme';

const ZOOM_IN_LEVEL = 12;
const ZOOM_OUT_LEVEL = 1;
const DEFAULT_ZOOM_LEVEL = 6.5;
const FONTS_DIRECTORY = '/fonts';

export class ArcGisWellsMap implements Styleable {

    private readonly plot: Plot;
    protected readonly map = ArcGisWellsMap.createMap();
    private readonly shapesRoot = new Group();
    private readonly styleables: Array<ToolkitCssStyleable<Group>>;

    constructor (
        private canvasElement: HTMLCanvasElement,
        private referenceElement: HTMLElement,
        private wellNames: Array<string>,
        private field: Field,
        cssLoader: ToolkitCssLoader
    ) {
        this.plot = this.createPlot();
        this.styleables = [
            new ToolkitCssStyleable(this.map, cssLoader),
            new ToolkitCssStyleable(this.shapesRoot, cssLoader)
        ];
        this.createToolbar();
        this.configureMap();
        this.addTilesLayer();
    }

    private static createMap () {
        return new Map({
            wrapped: false,
            cssclass: 'ExplorationMap',
            system: GeodeticSystem.WGS84,
            tooltip: {
                alignment: AnchorType.LeftTop,
                offsetx: 8,
                offsety: -8,
                mode: PointerMode.Hover,
                autoupdate: true
            }
        });
    }

    public applyTheme (theme: AppTheme) {
        this.styleables.forEach(s => s.applyTheme(theme));
    }

    protected createTilesLayer (options?: object): Promise<VectorTileLayer> {
        const layer =  new VectorTileLayer(Object.assign(options || {}, {
            url: 'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer'
        }));
        return layer.getDataSource()
            .loadServerData()
            .then(() => Promise.all(layer.getFonts().map(f => loadFont(FONTS_DIRECTORY, f))))
            .then(() => layer);
    }

    protected addTilesLayer () {
        this.createTilesLayer().then(tilesLayer => this.map.insertLayer(tilesLayer, 0));
    }

    private createPlot () {
        const plot = new StretchablePlot({
            canvaselement: this.canvasElement,
            root: this.map
        });
        plot.setRefElement(this.referenceElement);
        return plot;
    }

    private configureMap () {
        this.map
            .addLayer(this.createExplorationLayer())
            .addLayer(this.createMarkersLayer())
            .setZoomLevel(DEFAULT_ZOOM_LEVEL)
            .panTo(this.field.explorationCoordinates, GeodeticSystem.WGS84);
    }

    private createExplorationLayer () {
        return new ShapeLayer()
            .clearCache()
            .addShape(
                this.shapesRoot
                    .addChild(this.createField())
                    .addChild(this.createWells())
            );
    }

    private createMarkersLayer () {
        return new ShapeLayer({
            tooltip: {
                visible: true,
                formatter: (shapes: Shape[]) => shapes[0] && shapes[0].getName() || null
            }
        })
            .clearCache()
            .addShape(this.createMarkers())
    }

    private createField () {
        const {x, y} = this.field.zoneCoordinates;
        return new Polygon({x, y})
            .setLineStyle('red')
            .setCssClass('ExplorationMapField')
            .setName('field');
    }

    private getWells () {
        return this.field.wellsCoordinates.filter(({name}) => this.wellNames.includes(name));
    }

    private createWells () {
        return this.getWells().map(({x, y}, index) => {
            const path = new Path()
                .setCssClass('ExplorationMapWell')
                .setLineStyle('red')
                .moveTo(x[0], y[0])
                .setName('well ' + index);

            for (let i = 1; i < x.length; i++) path.lineTo(x[i], y[i]);
            return path;
        });
    }

    private createMarkers () {
        return this.getWells().map(({x, y, name}) => {
            return new SymbolShape({
                alignment: AnchorType.TopCenter
            })
                .setName(name)
                .setWidth(18)
                .setHeight(24)
                .setPainter(new FontPainter('', '"Font Awesome 6 Free"', '\u{f3c5}'))
                .setIsPointingUp(true)
                .setSizeIsInDeviceSpace(true)
                .setLineStyle(new LineStyle({color: 'darkred', width: 2}))
                .setFillStyle(new FillStyle('red'))
                .setAnchor(x[0], y[0]);
        });
    }

    private flyToExploration (zoomLevel?: number) {
        this.map.flyTo({
            level: zoomLevel || this.map.getZoomLevel(),
            location: this.field.explorationCoordinates,
            system: GeodeticSystem.WGS84
        });
    }

    private createToolbar () {
        new Toolbar({
            offset: 16,
            tools: this.plot.getTool(),
            alignment: AnchorType.RightBottom,
            orientation: Orientation.Horizontal,
            buttons: [
                new Button({
                    title: 'Zoom in',
                    icon: 'fa fa-magnifying-glass-plus',
                    action: () => this.flyToExploration(ZOOM_IN_LEVEL)
                }),
                new Button({
                    title: 'Fit to bounds',
                    icon: 'fa fa-expand',
                    action: () => this.flyToExploration(ZOOM_OUT_LEVEL)
                }),
                new Button({
                    title: 'Center map',
                    icon: 'fa fa-location-crosshairs',
                    action: () => this.flyToExploration()
                })]
        });
    }

}
