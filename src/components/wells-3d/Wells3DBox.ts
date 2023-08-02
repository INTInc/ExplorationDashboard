import {Well} from '@/data-sources/Well';
import {Range} from '@int/geotoolkit/util/Range';
import {MathUtil} from '@int/geotoolkit/util/MathUtil';

export class Wells3DBox {

    public xLimits: Range;
    public yLimits: Range;
    public zLimits: Range;

    constructor (wells: Well[]) {
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
        let limits = MathUtil.getLimits(xLimits);
        this.xLimits = new Range(limits[0], limits[1]);
        limits = MathUtil.getLimits(yLimits);
        this.yLimits = new Range(limits[0], limits[1]);
        limits = MathUtil.getLimits(zLimits);
        this.zLimits = new Range(limits[0], limits[1]);
    }

    public get length (): number {
        return this.xLimits.getSize();
    }

    public get width (): number {
        return this.yLimits.getSize();
    }

    public get height (): number {
        return this.zLimits.getSize();
    }

}
