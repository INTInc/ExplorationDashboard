import {DataBinding} from '@int/geotoolkit/data/DataBinding';
import {LogCurve} from '@int/geotoolkit/welllog/LogCurve';
import {Node} from '@int/geotoolkit/scene/Node';
import {LogData} from '@int/geotoolkit/welllog/data/LogData';
import {WellLogSource} from '@/components/well-log/WellLogSource';
import {MathUtil} from '@int/geotoolkit/util/MathUtil';
import {Range} from '@int/geotoolkit/util/Range';
import {IndexMeasurement} from '@/common/model/IndexMeasurement';

export class WellB32 extends WellLogSource {

    public getBinding (): DataBinding {
        return {
            accept: (node: Node) => node instanceof LogCurve,
            unbind: (node) => {
                if (node instanceof LogCurve) {
                    node.setData({}, false);
                }
            },
            bind: (node: Node) => {
                if (node instanceof LogCurve) {
                    const logData = this.curveData(node.getName());
                    node.setData(logData, false);
                }
            },
            getClassName: () => ''
        };
    }

    public getLimits (): Range {
        const indexValues = this.tops.values(this.indexMeasurement || '');
        const indexLimits = MathUtil.getLimits(indexValues);
        return new Range(indexLimits[0], indexLimits[1]);
    }

    public getIndexMeasurements (): IndexMeasurement[] {
        return [
            new IndexMeasurement('MD'),
            new IndexMeasurement('HRZDISP', 'HRZ')
        ];
    }

    private curveData (curveName: string): LogData {
        const topsIndex = this.indexMeasurement;
        const measurementsIndex = this.indexMeasurement === 'MD' ? 'DEPT' : this.indexMeasurement;

        return curveName === 'GR' ?
            this.measurements.logData(curveName, measurementsIndex) :
            this.tops.logData(curveName, topsIndex);
    }
}
