import { Well } from '@/data-sources/Well';
import { Range } from '@int/geotoolkit/util/Range';
import { MathUtil } from '@int/geotoolkit/util/MathUtil';

export class Wells3DBox {

	public xLimits: Range;
	public yLimits: Range;
	public zLimits: Range;

	constructor(wells: Well[]) {
		const
			xLimits: number[] = [],
			yLimits: number[] = [],
			zLimits: number[] = [];

		const getLimits = (well: Well, measure: string): number[] => MathUtil.getLimits(well.surveys.values(measure));

		wells.forEach(well => {
			xLimits.push(...getLimits(well, 'X'));
			yLimits.push(...getLimits(well, 'Y'));
			zLimits.push(...getLimits(well, 'Z'));
		});

		this.xLimits = new Range(...MathUtil.getLimits(xLimits));
		this.yLimits = new Range(...MathUtil.getLimits(yLimits));
		this.zLimits = new Range(...MathUtil.getLimits(zLimits));
	}

	public get length(): number {
		return this.xLimits.getSize();
	}

	public get width(): number {
		return this.yLimits.getSize();
	}

	public get height(): number {
		return this.zLimits.getSize();
	}

}