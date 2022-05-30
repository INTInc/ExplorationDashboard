import { Map } from '@int/geotoolkit/map/Map';
import { GeodeticSystem } from '@int/geotoolkit/map/GeodeticSystem';
import { AnchorType } from '@int/geotoolkit/util/AnchorType';
import { PointerMode } from '@int/geotoolkit/controls/tools/PointerMode';
import { Tile as TileLayer } from '@int/geotoolkit/map/layers/Tile';
import { Field } from '@/data-sources/Field';
import { Styleable } from '@/common/styling/Styleable';
import { Polygon } from '@int/geotoolkit/scene/shapes/Polygon';
import { Path } from '@int/geotoolkit/scene/shapes/Path';
import { Shape as ShapeLayer } from '@int/geotoolkit/map/layers/Shape';
import { Shape } from '@int/geotoolkit/scene/shapes/Shape';
import { StretchablePlot } from '@/common/layout/StretchablePlot';

export async function createWellsMapWidget(
	canvasElement: HTMLCanvasElement,
	referenceElement: HTMLElement,
	field: Field
) {
	function createMap() {
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

	function createField(dataSource: Field) {
		const {x, y, name} = dataSource.zoneCoordinates;
		return new (Styleable(Polygon))({ x, y })
			.setLineStyle('red')
			.setCssClass('ExplorationMapField')
			.setName(`Zone of exploration '${name}'`)
	}

	function createWells(dataSource: Field) {
		return dataSource.wellsCoordinates.map(({x, y, name}) => {
			const path = new (Styleable(Path))({})
				.setCssClass('ExplorationMapWell')
				.setLineStyle('red')
				.setName(`Trajectory of ${name}`)
				.moveTo(x[0], y[0]);

			for (let i = 1; i < x.length; i++) path.lineTo(x[i], y[i]);
			return path;
		});
	}

	function createTilesLayer() {
		return new TileLayer({
			url: 'https://demo.int.com/osm_tiles/',
			formatterfunction: (z: number, y: number, x: number) => z + '/' + x + '/' + y + '.png'
		})
	}

	function createExplorationLayer() {
		return new ShapeLayer({
			alpha: 0.75,
			tooltip: {
				visible: true,
				formatter: (shapes: Shape[]) => shapes[0] && shapes[0].getName() || null
			}
		});
	}

	function createPlot(map: Map) {
		const plot = new StretchablePlot({
			canvaselement: canvasElement,
			root: map
		});
		plot.setRefElement(referenceElement);
		return plot;
	}

	function createWidget() {
		const
			map = createMap(),
			fieldShape = createField(field),
			wellShapes = createWells(field)

		map
			.addLayer(createTilesLayer())
			.addLayer(createExplorationLayer()
				.addShape(fieldShape)
				.addShape(wellShapes)
			)
			.setZoomLevel(7)
			.panTo(field.explorationCoordinates, GeodeticSystem.WGS84);

		createPlot(map);

		return { map, fieldShape, wellShapes }
	}

	return field.loaded.then(createWidget)
}