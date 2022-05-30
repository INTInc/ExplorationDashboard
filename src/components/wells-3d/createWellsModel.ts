import { Plot } from '@int/geotoolkit3d/Plot';
import { StretchablePlot3 } from '@/common/layout/StretchablePlot3';
import { Wells3DBox } from '@/components/wells-3d/Wells3DBox';
import { Grid } from '@int/geotoolkit3d/scene/grid/Grid';
import { Color, Group, Line, LineBasicMaterial, Object3D, Vector3 } from '@int/geotoolkit3d/THREE';
import { Well } from '@/data-sources/Well';
import { LineGeometry } from '@int/geotoolkit3d/scene/well/LineGeometry';
import { KnownColors } from '@int/geotoolkit/util/ColorUtil';
import { MathUtil } from '@int/geotoolkit/util/MathUtil';
import { Sphere } from '@int/geotoolkit3d/scene/well/schematic/Sphere';
import { WellAnnotation } from '@/common/model/WellAnnotation';
import { FillStyle } from '@int/geotoolkit/attributes/FillStyle';
import { TextStyle } from '@int/geotoolkit/attributes/TextStyle';
import { AnnotationBase } from '@int/geotoolkit3d/scene/AnnotationBase';
import { LineStyle } from '@int/geotoolkit/attributes/LineStyle';
import { LogCurve2D } from '@int/geotoolkit3d/scene/well/LogCurve2D';
import { LogFill2D } from '@int/geotoolkit3d/scene/well/LogFill2D';
import { WellAnnotations } from '@/common/model/WellAnnotations';

export async function createWellsModel(
	containerElement: HTMLElement,
	referenceElement: HTMLElement,
	wells: Well[],
	annotations: Map<Well, WellAnnotations>,
	measurement: string | null,
	cameraDistance: number,
	modelPadding: number,
	showWellNames: boolean,
	showAnnotations: boolean,
	transparentScene: boolean,
	font: string,
) {
	function dataSourcesLoaded() {
		const promises: Array<Promise<unknown>> = [];

		wells.forEach(well => promises.push(well.loaded));
		annotations.forEach(annotations => promises.push(annotations.loaded));

		return Promise.all(promises);
	}

	function createPlot(): Plot {
		const plot = new StretchablePlot3({
			container: containerElement,
			renderer: {
				parameters: {
					alpha: transparentScene
				},
				clearcolor: 0x000000,
				clearcoloralpha: transparentScene ? 0: 1
			}
		});

		plot.setRefElement(referenceElement);
		return plot;
	}

	function createWellsBox(): Wells3DBox {
		return new Wells3DBox(wells);
	}

	function createBoxGrid(box: Wells3DBox, padding: number): Grid {
		return new Grid({
			start: new Vector3(-padding, - box.width / 2 - padding, 0),
			end: new Vector3(box.length + padding, box.width / 2 + padding, - box.height),
			modelstart: new Vector3(box.xLimits.getHigh() - padding,box.yLimits.getLow() - padding, box.zLimits.getLow()),
			modelend: new Vector3(box.xLimits.getHigh() + padding, box.yLimits.getHigh() + padding, box.zLimits.getHigh()),
		})
	}

	function setCamera(wellsBox: Wells3DBox, plot: Plot) {
		plot
			.setCameraLocation(new Vector3(wellsBox.length * 2, -cameraDistance, wellsBox.height / 2))
			.setCameraLookAt(new Vector3(wellsBox.length / 2, wellsBox.width / 2, -wellsBox.height));
	}

	function createGeometry(well: Well) {
		return new LineGeometry({
			data: {
				x: well.surveys.values('DX'),
				y: well.surveys.values('DY'),
				z: well.surveys.values('Z')
			}
		})
	}

	function createMaterial() {
		return new LineBasicMaterial({ color: KnownColors.Green, linewidth: 5 })
	}

	function createTrajectory(well: Well): Line {
		return new Line(createGeometry(well), createMaterial());
	}

	function trajectoryPoint(well: Well, value: number): Vector3 {
		const exactIndex: number =  well.surveys.values('MD').indexOf(value);
		return (exactIndex > 0)
			? vectorByIndex(well, exactIndex)
			: vectorByIndex(well, deviatedIndex(well, 'MD', value));
	}

	function vectorByIndex(well: Well, index: number): Vector3 {
		return new Vector3(
			well.surveys.values('DX')[index],
			well.surveys.values('DY')[index],
			well.surveys.values('Z')[index]
		);
	}

	function deviatedIndex(well: Well, measurement: string, value: number) {
		//TODO improve this, there must be more performant algorithm
		const values = well.surveys.values(measurement);
		const deviations = values.map(item => Math.abs(Math.abs(item) - value));

		const minDev = MathUtil.getMin(deviations);
		return deviations.indexOf(minDev);
	}

	function createWellTrajectories(): Line[] {
		return wells.map(well => createTrajectory(well));
	}

	function createWellNamesAnnotations(): Sphere[] {
		if (showWellNames)
			return wells
				.filter(well => well.surveys.wellName)
				.map(well => createAnnotation(new WellAnnotation({
					text: well.surveys.wellName as string,
					index: well.surveys.length - 1
				}), well));
		return [];
	}

	function createCustomAnnotations(): Sphere[] {
		const annotationObjects = new Array<Sphere>();
		if (showAnnotations) annotations.forEach((annotations, well) =>
			annotations.data.forEach(annotation => annotationObjects.push(createAnnotation(annotation, well)))
		);
		return annotationObjects;
	}

	function createAnnotation(annotation: WellAnnotation, well: Well): Sphere {
		let anchor = new Vector3();
		const origin = vectorByIndex(well, 0);

		if (annotation.index) {
			anchor = vectorByIndex(well, annotation.index);
		} else if (annotation.depth) {
			anchor = trajectoryPoint(well, annotation.depth);
		} else {
			return new Sphere({});
		}

		const sphere = new Sphere({
			data: anchor,
			fillstyle: new FillStyle({color: annotation.color || 'transparent' }),
			radius: 30
		});
		const titleStyle = new TextStyle({color: annotation.color || '#ffffff', font});
		const setTitleStyle = (textStyle: TextStyle) => setAnnotationTitleStyle(sphere, textStyle);

		sphere.position.copy(origin);
		sphere.userData = { well, setTitleStyle }
		sphere.setAnnotation(createMarkerLabel(annotation.text, anchor, origin).setTitleStyle(titleStyle));

		return sphere;
	}

	function setAnnotationTitleStyle(sphere: Sphere, textStyle: TextStyle) {
		const label = sphere.getAnnotation();
		if (label.getAnchorPoint()) {
			const newLabel = createMarkerLabel(label.getTitle(), label.getAnchorPoint() as Vector3, label.position)
			sphere.setAnnotation(newLabel.setTitleStyle(textStyle));
		}
	}

	function createMarkerLabel(text: string, anchor: Vector3, origin: Vector3): AnnotationBase {
		const annotationObject = new AnnotationBase({
			title: text,
			titlestyle: new TextStyle({font}),
			linestyle: new LineStyle('transparent')
		});
		annotationObject.setAnchorPoint(anchor);
		annotationObject.position.copy(origin);

		return annotationObject;
	}

	function createMeasurementCurve(well: Well, measurement: string): Group {
		const
			curveCoordinates = {
				x: well.surveys.values('DX'),
				y: well.surveys.values('DY'),
				z: well.surveys.values('Z')
			},
			curve = new LogCurve2D({
				data: {
					...curveCoordinates,
					values: well.surveys.values(measurement),
					nullvalue: well.surveys.nullValue
				},
				color: '#c00000',
				radius: 75
			}),
			fill = new LogFill2D({
				data: {
					...curveCoordinates,
					curvevalues1: well.surveys.values(measurement),
				},
				colorprovider: new Color('#ffc000'),
				radius: 75
			});

		const origin = vectorByIndex(well, 0);
		curve.position.copy(origin);
		fill.position.copy(origin);

		return new Group()
			.add(curve)
			.add(fill);
	}

	function createMeasurementLogs(): Group[] {
		return measurement !== null
			? wells.map(well => createMeasurementCurve(well, measurement))
			: [];
	}

	function createCursors(): Object3D[] {
		return wells.map(well => createCursor(well));
	}

	function createCursor(well: Well): Sphere {
		const sphere = new Sphere({
			data: vectorByIndex(well, 0),
			fillstyle: new FillStyle({color: KnownColors.Red }),
			radius: 75
		});
		sphere.position.copy(vectorByIndex(well, 0));
		sphere.visible = false;
		sphere.userData = {
			well,
			setDepth: (depth: number | null) => {
				if (depth === null || Number.isNaN(depth)) {
					sphere.visible = false;
				} else {
					sphere.visible = true;
					sphere.position.copy(vectorByIndex(well, deviatedIndex(well, 'MD', depth)));
					sphere.invalidateObject();
				}
			}
		}

		return sphere;
	}

	function createModel() {
		const
			plot = createPlot(),
			root = plot.getRoot(),
			wellsBox = createWellsBox(),
			grid = createBoxGrid(wellsBox, modelPadding),
			logs = createMeasurementLogs(),
			trajectories = createWellTrajectories(),
			customAnnotations = createCustomAnnotations(),
			wellNamesAnnotations = createWellNamesAnnotations(),
			cursorObjects = createCursors();

		root
			.add(grid)
			.add(...logs)
			.add(...trajectories)
			.add(...customAnnotations)
			.add(...wellNamesAnnotations)
			.add(...cursorObjects)

		setCamera(wellsBox, plot);

		return {
			grid,
			logs,
			trajectories,
			customAnnotations,
			wellNamesAnnotations,
			cursorObjects
		}
	}

	return dataSourcesLoaded().then(createModel);
}