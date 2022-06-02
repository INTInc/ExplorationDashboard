import { Map } from '@int/geotoolkit/map/Map';
import { GeodeticSystem } from '@int/geotoolkit/map/GeodeticSystem';
import { AnchorType } from '@int/geotoolkit/util/AnchorType';
import { PointerMode } from '@int/geotoolkit/controls/tools/PointerMode';
import { Tile as TileLayer } from '@int/geotoolkit/map/layers/Tile';
import { Field } from '@/data-sources/Field';
import { Polygon } from '@int/geotoolkit/scene/shapes/Polygon';
import { Path } from '@int/geotoolkit/scene/shapes/Path';
import { Shape as ShapeLayer } from '@int/geotoolkit/map/layers/Shape';
import { Shape } from '@int/geotoolkit/scene/shapes/Shape';
import { StretchablePlot } from '@/common/layout/StretchablePlot';
import { Group } from '@int/geotoolkit/scene/Group';
import { ToolkitCssLoader } from '@/common/styling/ToolkitCssLoader';
import { ToolkitCssStyleable } from '@/common/styling/ToolkitCssStyleable';
import { SymbolShape } from '@int/geotoolkit/scene/shapes/SymbolShape';
import { FontPainter } from '@int/geotoolkit/scene/shapes/painters/FontPainter';
import { FillStyle } from '@int/geotoolkit/attributes/FillStyle';
import { LineStyle } from '@int/geotoolkit/attributes/LineStyle';
import { Plot } from '@int/geotoolkit/plot/Plot';
import { Toolbar } from '@int/geotoolkit/controls/toolbar/Toolbar';
import { Orientation } from '@int/geotoolkit/util/Orientation';

export class WellsMap extends ToolkitCssStyleable<Group> {

	private readonly map = WellsMap.createMap();
	private readonly plot: Plot;
	private readonly toolbar: Toolbar;

	constructor(
		private canvasElement: HTMLCanvasElement,
		private referenceElement: HTMLElement,
		private field: Field,
		private initialZoom: number = 1,
		cssLoader: ToolkitCssLoader
	) {
		super(new Group(), cssLoader);
		this.plot = this.createPlot();
		this.toolbar = this.createToolbar();

		this.configureMap();
		this.initialization.resolve(this);
	}

	private static createMap() {
		return new Map({
			wrapped: false,
			system: GeodeticSystem.WGS84,
			tooltip: {
				alignment: AnchorType.LeftTop,
				offsetx: 8,
				offsety: -8,
				mode: PointerMode.Hover,
				autoupdate: true
			}
		})
	}

	private createPlot() {
		const plot = new StretchablePlot({
			canvaselement: this.canvasElement,
			root: this.map
		});
		plot.setRefElement(this.referenceElement);
		return plot;
	}

	private configureMap() {
		this.map
			.addLayer(WellsMap.createTilesLayer())
			.addLayer(this.createExplorationLayer())
			.addLayer(this.createMarkersLayer())
			.setZoomLevel(this.initialZoom)
			.panTo(this.field.explorationCoordinates, GeodeticSystem.WGS84)
	}

	private static createTilesLayer() {
		return new TileLayer({
			url: 'https://demo.int.com/osm_tiles/',
			formatterfunction: (z: number, y: number, x: number) => z + '/' + x + '/' + y + '.png'
		})
	}

	private createMarkersLayer() {
		return new ShapeLayer({
			tooltip: {
				visible: true,
				formatter: (shapes: Shape[]) => shapes[0] && shapes[0].getName() || null
			}
		})
			.clearCache()
			.addShape(this.createMarkers())
	}

	private createExplorationLayer() {
		return new ShapeLayer()
			.addShape(
				this.root
					.addChild(this.createField())
					.addChild(this.createWells())
			)
	}

	private  createField() {
		const {x, y} = this.field.zoneCoordinates;
		return new Polygon({ x, y })
			.setLineStyle('red')
			.setCssClass('ExplorationMapField')
			.setName('field')
	}

	private createWells() {
		return this.field.wellsCoordinates.map(({x, y}, index) => {
			const path = new Path()
				.setCssClass('ExplorationMapWell')
				.setLineStyle('red')
				.moveTo(x[0], y[0])
				.setName('well ' + index);

			for (let i = 1; i < x.length; i++) path.lineTo(x[i], y[i]);
			return path;
		});
	}

	private createMarkers() {
		return this.field.wellsCoordinates.map(({x, y, name}) => {
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
				.setAnchor(x[0], y[0])
		})
	}

	private createToolbar() {
		return new Toolbar({
			size: 30,
			fontsize: 12,
			gap: 0,
			orientation: Orientation.Vertical,
			alignment: AnchorType.LeftTop,
			tools: this.plot.getTool(),
			buttons: [
				'map-home',
				'-',
				'zoom-in',
				'zoom-out'
			]
		})
	}

}