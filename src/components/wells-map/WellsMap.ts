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

export class WellsMap extends ToolkitCssStyleable<Group> {

	constructor(
		private canvasElement: HTMLCanvasElement,
		private referenceElement: HTMLElement,
		private field: Field,
		private initialZoom: number,
		cssLoader: ToolkitCssLoader
	) {
		super(new Group(), cssLoader);
		this.createPlot(
			WellsMap.createMap()
				.addLayer(WellsMap.createTilesLayer())
				.addLayer(WellsMap.createExplorationLayer()
					.addShape(
						this.root
							.addChild(this.createField())
							.addChild(this.createWells())
						)
					)
				.addLayer(WellsMap.createMarkersLayer()
					.addShape(this.createMarkers())
				)
				.setZoomLevel(this.initialZoom)
				.panTo(this.field.explorationCoordinates, GeodeticSystem.WGS84)
		);
		this.initialization.resolve(this);
	}

	private createPlot(map: Map) {
		const plot = new StretchablePlot({
			canvaselement: this.canvasElement,
			root: map
		});
		plot.setRefElement(this.referenceElement);
		return plot;
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

	private static createTilesLayer() {
		return new TileLayer({
			url: 'https://demo.int.com/osm_tiles/',
			formatterfunction: (z: number, y: number, x: number) => z + '/' + x + '/' + y + '.png'
		})
	}

	private static createMarkersLayer() {
		return new ShapeLayer({
			tooltip: {
				visible: true,
				formatter: (shapes: Shape[]) => shapes[0] && shapes[0].getName() || null
			}
		})
			.clearCache();
	}

	private static createExplorationLayer() {
		return new ShapeLayer();
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
				.setWidth(32)
				.setHeight(32)
				.setPainter(new FontPainter('', 'icomoon', '\u{e947}'))
				.setIsPointingUp(true)
				.setSizeIsInDeviceSpace(true)
				.setLineStyle(new LineStyle({color: 'darkred', width: 2}))
				.setFillStyle(new FillStyle('red'))
				.setAnchor(x[0], y[0])
		})
	}

}