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
import { Styleable } from '@/common/styling/Styleable';
import { Group } from '@int/geotoolkit/scene/Group';
import { ToolkitThemesLoader } from '@/common/styling/ToolkitThemesLoader';
import { AppTheme } from '@/common/styling/AppTheme';
import { Deferred } from '@/common/model/Deferred';

export class WellsMap implements Styleable {

	private initialization = new Deferred<WellsMap>();
	private rootShape = new Group();

	constructor(
		private canvasElement: HTMLCanvasElement,
		private referenceElement: HTMLElement,
		private themesLoader: ToolkitThemesLoader,
		private field: Field,
		private initialZoom: number
	) {
		field.loaded
			.then(() => this.initialize())
			.then(() => this.initialization.resolve(this))
	}

	private initialize() {
		this.createPlot(
			WellsMap.createMap()
				.addLayer(WellsMap.createTilesLayer())
				.addLayer(WellsMap.createExplorationLayer()
					.addShape(this.rootShape
						.addChild(this.createField())
						.addChild(this.createWells())
					)
				)
				.setZoomLevel(this.initialZoom)
				.panTo(this.field.explorationCoordinates, GeodeticSystem.WGS84)
		);
	}

	private createPlot(map: Map) {
		const plot = new StretchablePlot({
			canvaselement: this.canvasElement,
			root: map
		});
		plot.setRefElement(this.referenceElement);
		return plot;
	}

	static createMap() {
		return new Map({
			system: GeodeticSystem.WGS84,
			tooltip: {
				alignment: AnchorType.BottomCenter,
				offsetx: 0,
				offsety: 0,
				mode: PointerMode.Hover,
				autoupdate: false
			}
		})
	}

	static createTilesLayer() {
		return new TileLayer({
			url: 'https://demo.int.com/osm_tiles/',
			formatterfunction: (z: number, y: number, x: number) => z + '/' + x + '/' + y + '.png'
		})
	}

	static createExplorationLayer() {
		return new ShapeLayer({
			alpha: 0.75,
			tooltip: {
				visible: true,
				formatter: (shapes: Shape[]) => shapes[0] && shapes[0].getName() || null
			}
		});
	}

	private  createField() {
		const {x, y, name} = this.field.zoneCoordinates;
		return new Polygon({ x, y })
			.setLineStyle('red')
			.setCssClass('ExplorationMapField')
			.setName(`Zone of exploration '${name}'`)
	}

	private createWells() {
		return this.field.wellsCoordinates.map(({x, y, name}) => {
			const path = new Path()
				.setCssClass('ExplorationMapWell')
				.setLineStyle('red')
				.setName(`Trajectory of ${name}`)
				.moveTo(x[0], y[0]);

			for (let i = 1; i < x.length; i++) path.lineTo(x[i], y[i]);
			return path;
		});
	}

	public applyTheme(theme: AppTheme) {
		this.rootShape.setCss(this.themesLoader.getThemeCss(theme));
	}

	public get initialized(): Promise<WellsMap> {
		return this.initialization.promise;
	}

}