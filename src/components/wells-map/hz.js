import {MathUtil} from '@int/geotoolkit/util/MathUtil';
import {Util} from '@int/geotoolkit/renderer/util';
import {Vector3, Matrix4, Shape} from '@int/geotoolkit3d/THREE';
import WellData from './well.json';

const wells = {};

function computeDeviation (values, ref) {
	const dev = [];
	for (let i = 0; i < values.length; i++) {
		dev.push(values[i] - values[0]);
	}
	return dev;
}
function extractValues (wellpath, size, tubeprecision) {
	const vertices = [];
	const normals = [];

	let j;
	const pts2d = createBezierEllipsis(tubeprecision);
	const ptscount = pts2d.length;
	const scalexy = new Vector3(1, 1, 1);
	const mat4 = new Matrix4();
	const angle = 0;
	const up = new Vector3(0, 0, -1);
	const zero = new Vector3();
	const vector3 = zero.clone();
	const orientedUp = zero.clone();
	const pathLength = wellpath.x.length;


	for (let i = 0; i < pathLength; i++) {
		scalexy.x = size * 2;
		scalexy.y = size * 2;
		let normalize;
		const current = new Vector3(wellpath.x[i], wellpath.y[i], wellpath.z[i]);
		let refAngle;
		if (i > 0) {
			normalize = vector3.set(wellpath.x[i], wellpath.y[i], wellpath.z[i])
				.sub(new Vector3(wellpath.x[i - 1], wellpath.y[i - 1], wellpath.z[i - 1])).normalize();
			refAngle = Math.atan2((normalize.x * normalize.x + normalize.y * normalize.y), (normalize.z * normalize.z));
			mat4.lookAt(zero, normalize, refAngle > 0.1745 ? orientedUp.set(0, 0, 1) : orientedUp.set(0, 1, 0));
		} else {
			normalize = vector3.set(wellpath.x[i + 1], wellpath.y[i + 1], wellpath.z[i + 1]).sub(current).normalize();
			refAngle = Math.atan2((normalize.x * normalize.x + normalize.y * normalize.y), (normalize.z * normalize.z));
			mat4.lookAt(zero, normalize, refAngle > 0.17 ? orientedUp.set(0, 0, 1) : orientedUp.set(0, 1, 0));
		}

		for (j = 1; j < ptscount - 1; j++) {
			vector3.set(pts2d[j].x, pts2d[j].y, 0);
			vector3.multiply(scalexy); // Scale the ellipsis point in xy
			vector3.applyAxisAngle(up, angle); // Roll, using 'up' as the ellipsis is not oriented yet
			vector3.applyMatrix4(mat4); // Rotation 3D, rotates the point around the ellipsis center so that the ellipsis is orthogonal
			// to the path
			vector3.add(current); // Translation, translates the ellipsis point to be 'around' the wellpath
			vertices.push(vector3.x, vector3.y, vector3.z);
			vector3.sub(current).normalize();
			normals.push(vector3.x, vector3.y, vector3.z);
		}
	}

	return vertices;
}

function computeSimpleLogArrayLogData (count) {
	const oneMdLogData = [];
	for (let sector = 0; sector < 8; sector++) {
		oneMdLogData.push(Math.cos(sector));
	}
	const logData = [];
	let md = 0;
	const mapFunc = function (e) {
		return Math.sin(md) * e;
	};
	for (; md < count; md++) {
		logData.push(oneMdLogData.map(mapFunc));
	}
	return logData;
}

function lerp (t0, t1, t) {
	const ret = {};
	ret.e = t0.e + t * (t1.e - t0.e);
	ret.x = t0.x + t * (t1.x - t0.x);
	ret.y = t0.y + t * (t1.y - t0.y);
	ret.xd = t0.xd + t * (t1.xd - t0.xd);
	ret.yd = t0.yd + t * (t1.yd - t0.yd);
	return ret;
}

function generateLogArrayHor (complexlogarray, factor) {
	const well3410A44 = wells.getWell_34_10_A_44();
	const length = well3410A44.elevation.length;
	for (let i = 0; i < ((length - 1) * factor); i++) {
		const index = Math.floor(i / factor);

		const e0 = index === 0 ? -200 : well3410A44.elevation[index];
		const e1 = well3410A44.elevation[index + 1];
		const l = lerp({
			e: e0,
			x: well3410A44.x[index],
			y: well3410A44.y[index],
			xd: well3410A44.xDeviation[index],
			yd: well3410A44.yDeviation[index]
		}, {
			e: e1,
			x: well3410A44.x[index + 1],
			y: well3410A44.y[index + 1],
			xd: well3410A44.xDeviation[index + 1],
			yd: well3410A44.yDeviation[index + 1]
		}, (i % factor) / factor);

		complexlogarray.elevation[i] = l.e;
		complexlogarray.x[i] = l.x;
		complexlogarray.y[i] = l.y;
		complexlogarray.xDeviation[i] = l.xd;
		complexlogarray.yDeviation[i] = l.yd;
		complexlogarray.logData[i] = [];

		for (let j = 0; j < 64; j++) {
			let le = 14;
			le += le % 2;
			complexlogarray.logData[i][j] = MathUtil.getSeededRandom(0, 1, 7) * 30;
		}
	}

	complexlogarray.horizons = [];
	const array = extractValues({
		x: complexlogarray.xDeviation,
		y: complexlogarray.yDeviation,
		z: complexlogarray.elevation
	}, 30, 64 / 4);
	let top = -1;
	let bot = -1;
	for (let ii = 0; ii < array.length / 3 - 2; ii++) {
		const slice = Math.floor(ii / 64);
		const sector = (ii - 16) % 64;

		if (sector === 32 && top === -1) {
			// const rand = Math.cos(array[ii * 3 + 2]) * 30;
			top = array[ii * 3 + 2];
			bot = array[ii * 3 + 2] - 30;
			complexlogarray.horizons.push({
				top: top,
				bot: bot
			});
		}
		if (top === -1) continue;
		if (array[ii * 3 + 2] <= top && array[ii * 3 + 2] >= bot) {
			complexlogarray.logData[slice][sector] = Math.sin(top) * 300;
		}

		if (array[ii * 3 + 2] < bot - 80) {
			top = -1;
			bot = -1;
		}
	}
}

function createBezierEllipsis (tubeprecision) {
	const shape = new Shape();
	shape.moveTo(0, 0);
	const segments = Util.getEllipseBezierReferencePoints(0, 0, 1, 1);
	let segment = segments[0];
	shape.moveTo(segment.getX1(), segment.getY1());
	for (let i = 0; i < segments.length; ++i) {
		segment = segments[i];
		shape.bezierCurveTo(segment.getX2(), segment.getY2(), segment.getX3(), segment.getY3(), segment.getX4(), segment.getY4());
	}
	shape.closePath();
	return shape.extractPoints(tubeprecision).shape;
}

const DEBUG = false;
function generateLogArrayCyl (complexlogarray, factor) {
	const well3410A44 = wells.getWell_34_10_A_44();
	const length = well3410A44.elevation.length;
	for (let i = 0; i < ((length - 1) * factor); i++) {
		const index = Math.floor(i / factor);
		const l = lerp({
			e: index === 0 ? -200 : well3410A44.elevation[index],
			x: well3410A44.x[index],
			y: well3410A44.y[index],
			xd: DEBUG ? (i > 200 ? complexlogarray.xDeviation[i - 1] + (i < 500 ? 5 : 0) : 0) : well3410A44.xDeviation[index],
			yd: DEBUG ? (i > 400 ? complexlogarray.yDeviation[i - 1] + 5 : 0) : well3410A44.yDeviation[index]
		}, {
			e: well3410A44.elevation[index + 1],
			x: well3410A44.x[index + 1],
			y: well3410A44.y[index + 1],
			xd: DEBUG ? (i > 200 ? complexlogarray.xDeviation[i - 1] + (i < 500 ? 5 : 0) : 0) : well3410A44.xDeviation[index + 1],
			yd: DEBUG ? (i > 400 ? complexlogarray.yDeviation[i - 1] + 5 : 0) : well3410A44.yDeviation[index + 1]
		}, (i % factor) / factor);

		complexlogarray.elevation[i] = l.e;
		complexlogarray.x[i] = l.x;
		complexlogarray.y[i] = l.y;
		complexlogarray.xDeviation[i] = l.xd;
		complexlogarray.yDeviation[i] = l.yd;
		complexlogarray.logData[i] = [];
		for (let j = 0; j < 64; j++) {
			let le = 14;
			le += le % 2;
			let def =
				Math.abs(Math.cos(i % (MathUtil.getSeededRandom(0, 1, 7) * 10)) / 3) + (i % 50 === 0 ? Math.abs(Math.sin(i / 50)) : 0);
			if (i % 37 < 3) {
				def += Math.abs(Math.sin(i / 37));
			} else if (i % 40 < 10) {
				def *= 1.5;
			}

			if (j % 17 < 3) {
				def /= 1.3;
			}

			complexlogarray.logData[i][j] = def * 75;
		}
	}
}

wells.well_34_10_A_44 = WellData.well_34_10_A_44;
wells.getWell_34_10_A_44 = function () {
	const well3410A44 = wells.well_34_10_A_44;
	if (well3410A44['xRef'] == null) {
		well3410A44.xRef = well3410A44.x[0];
		well3410A44.yRef = well3410A44.y[0];

		well3410A44.xDeviation = computeDeviation(well3410A44.x, well3410A44.xRef);
		well3410A44.yDeviation = computeDeviation(well3410A44.y, well3410A44.yRef);
	}
	return well3410A44;
};


wells.well_mgx_02 = WellData.well_mgx_02;
wells.getWell_mgx_02 = function () {
	const wellMgx02 = wells.well_mgx_02;
	if (wellMgx02['x'] == null) {
		const well3410A44 = wells.getWell_34_10_A_44();
		wellMgx02['x'] = [];
		for (let i = 0; i < 250; i++) {
			for (let j = 0; j < 6; j++) {
				wellMgx02.x[i * 6 + j] = well3410A44.x[i] + j * (well3410A44.x[i + 1] - well3410A44.x[i]) / 6;
				wellMgx02.y[i * 6 + j] = well3410A44.y[i] + j * (well3410A44.y[i + 1] - well3410A44.y[i]) / 6;
				wellMgx02.elevation[i * 6 + j] =
					well3410A44.elevation[i] + j * (well3410A44.elevation[i + 1] - well3410A44.elevation[i]) / 6;
			}
		}

		wells.well_mgx_02.xRef = wells.well_mgx_02.x[0];
		wells.well_mgx_02.yRef = wells.well_mgx_02.y[0];
		wells.well_mgx_02.xDeviation =
			computeDeviation(wells.well_mgx_02.x, wells.well_mgx_02.xRef);
		wells.well_mgx_02.yDeviation =
			computeDeviation(wells.well_mgx_02.y, wells.well_mgx_02.yRef);
	}
	return wellMgx02;
};


wells.well_simplelogarray = {
	elevation: [-0, -5, -10, -15, -20, -25],
	x: [0, 0, 0, 0, 0, 0],
	y: [0, 0, 0, 0, 0, 0]
};
wells.getWell_simplelogarray = function () {
	let WellSimpleLogArray = wells.well_simplelogarray;
	if (WellSimpleLogArray.xRef == null) {
		WellSimpleLogArray = wells.well_simplelogarray;
		WellSimpleLogArray.xRef = WellSimpleLogArray.x[0];
		WellSimpleLogArray.yRef = WellSimpleLogArray.y[0];
		WellSimpleLogArray.xDeviation = computeDeviation(WellSimpleLogArray.x, WellSimpleLogArray.xRef);
		WellSimpleLogArray.yDeviation = computeDeviation(WellSimpleLogArray.y, WellSimpleLogArray.yRef);
		WellSimpleLogArray.logData = computeSimpleLogArrayLogData(WellSimpleLogArray.y.length);
	}
	return WellSimpleLogArray;
};

wells.well_complexlogarray = {};
wells.getWell_complexlogarray = function () {
	if (wells.well_complexlogarray.xRef == null) {
		const well3410A44 = wells.getWell_34_10_A_44();
		wells.well_complexlogarray = {
			elevation: [],
			x: [],
			y: [],
			xRef: well3410A44.xRef,
			yRef: well3410A44.yRef,
			xDeviation: [],
			yDeviation: [],
			logData: []
		};
		generateLogArrayCyl(wells.well_complexlogarray, 100);
	}
	return wells.well_complexlogarray;
};


wells.well_horizonslogarray = {};
wells.getWell_horizonslogarray = function () {
	if (wells.well_horizonslogarray.xRef == null) {
		const well3410A44 = wells.getWell_34_10_A_44();
		wells.well_horizonslogarray = {

			elevation: [],
			x: [],
			y: [],
			xRef: well3410A44.xRef,
			yRef: well3410A44.yRef,
			xDeviation: [],
			yDeviation: [],
			logData: []
		};
		generateLogArrayHor(wells.well_horizonslogarray, 3);
	}
	return wells.well_horizonslogarray;
};

wells.well_Pipe = null;
wells.getWell_pipe = function () {
	if (wells.well_Pipe == null) {
		const well3410A44 = wells.getWell_34_10_A_44();
		let i;
		const length = well3410A44.x.length;
		const positions = [], normals = [], binormals = [], tangents = [], values = [], radii = [];
		for (i = 0; i < length; i++) {
			positions.push(new Vector3(well3410A44.xDeviation[i], well3410A44.yDeviation[i], well3410A44.elevation[i]));
			values.push(well3410A44.dls[i]);
		}
		tangents.push(new Vector3().copy(positions[1]).sub(positions[0]).normalize());
		radii.push(Math.abs(well3410A44.azim[0]) + Math.abs(well3410A44.incl[0]));
		for (i = 1; i < length - 1; i++) {
			tangents.push(new Vector3().copy(positions[i + 1]).sub(positions[i - 1]).normalize());
			radii.push(radii[i - 1] + Math.abs(well3410A44.azim[i]) + Math.abs(well3410A44.incl[i]));
		}
		tangents.push(new Vector3().copy(positions[length - 1]).sub(positions[length - 2]).normalize());
		tangents.push(new Vector3(0, 0, 0));
		radii.push(radii[length - 2] + Math.abs(well3410A44.azim[length - 1]) + Math.abs(well3410A44.incl[length - 1]));
		const tmp = new Vector3();
		let min = Number.MAX_VALUE;
		const tx = Math.abs(tangents[0].x);
		const ty = Math.abs(tangents[0].y);
		const tz = Math.abs(tangents[0].z);
		if (tx <= min) {
			min = tx;
			tmp.set(1, 0, 0);
		}
		if (ty <= min) {
			min = ty;
			tmp.set(0, 1, 0);
		}
		if (tz <= min) {
			tmp.set(0, 0, 1);
		}
		const offset = 10 - radii[0];
		const scale = (100 - 10) / (radii[0] + radii[radii.length - 1]);
		normals.push(new Vector3().crossVectors(tangents[0], tmp.crossVectors(tangents[0], tmp)));
		binormals.push(new Vector3().crossVectors(tangents[0], normals[0]));
		for (i = 1; i <= length; i++) {
			normals.push(new Vector3().copy(normals[i - 1]).applyMatrix4(
				new Matrix4().makeRotationAxis(tmp.crossVectors(tangents[i - 1], tangents[i]).normalize(),
					Math.acos(MathUtil.clamp(tangents[i - 1].dot(tangents[i]), -1, 1)))));
			binormals.push(new Vector3().crossVectors(tangents[i], normals[i]));
			radii[i - 1] = radii[i - 1] * scale + offset;
		}
		wells.well_Pipe = {
			'positions': positions,
			'normals': normals,
			'binormals': binormals,
			'tangents': tangents,
			'values': values,
			'radii': radii
		};
	}
	return wells.well_Pipe;
};
export {wells};

