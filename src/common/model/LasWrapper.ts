import {Range} from '@int/geotoolkit/util/Range';
import {Las20} from '@int/geotoolkit/welllog/data/las/Las20';
import {LasSection} from '@int/geotoolkit/welllog/data/las/LasSection';
import {LasParameter} from '@int/geotoolkit/welllog/data/las/LasParameter';
import {LasParameterSection} from '@int/geotoolkit/welllog/data/las/LasParameterSection';
import {LasDataSection} from '@int/geotoolkit/welllog/data/las/LasDataSection';
import {LasSectionGroup} from '@int/geotoolkit/welllog/data/las/LasSectionGroup';
import {LogData} from '@int/geotoolkit/welllog/data/LogData';

enum MeasureProperty {
    Start,
    Stop,
    Step,
    Null,
    Well = 5,
}

export class LasWrapper {

    private las: Las20 = new Las20();
    private curves: LasSectionGroup = new LasSectionGroup('', new LasParameterSection(), new LasParameterSection(), new LasDataSection());
    private properties: LasParameterSection = new LasParameterSection();
    private sourceLoaded = false;

    public get depthLimits (): Range {
        return new Range(
            parseFloat(this.property(MeasureProperty.Start)?.getValue() || ''),
            parseFloat(this.property(MeasureProperty.Stop)?.getValue() || '')
        );
    }

    public get wellName (): string | undefined {
        return this.property(MeasureProperty.Well)?.getValue();
    }

    public get nullValue (): number | undefined {
        return this.property(MeasureProperty.Null)?.getValue() as (number | undefined);
    }

    public get length (): number {
        return this.values(this.curves.getCurveMnemonics()[0]).length;
    }

    public setSource (text: string): LasWrapper {
        this.las.parse(text);
        this.curves = this.las.getSectionGroups()[0];
        this.properties = this.las.getSections()[1];
        this.sourceLoaded = true;

        return this;
    }

    public logData (
        measurement: string,
        indexMeasurement = this.curves.getCurveMnemonics()[0]
    ): LogData {
        const d = this.values(indexMeasurement);
        const v = this.values(measurement);
        let prev = d[0];
        for (let i = 1; i < d.length; i++) {
            if (prev > d[i]) {
                d.splice(i, 1);
                v.splice(i, 1);
            }
            prev = d[i];
        }
        return new LogData({
            name: measurement,
            depths: d,
            values: v
        })
            .setValueUnit(this.info(measurement).getUnit());
    }

    public values (measure: string): number[] {
        let values = new Array<number>();
        if (this.containMeasure(measure)) {
            values = this.curves.getCurveData(measure) as number[];
        } else {
            console.error(`Provided data not include measurement named ${measure}`);
        }
        return values;
    }

    public containMeasure (measure: string): boolean {
        return this.curves.getCurveMnemonics().includes(measure);
    }

    private property (propertyIndex: MeasureProperty) {
        return this.sourceLoaded ? this.properties.getData()[propertyIndex] : null;
    }

    private info (measurement: string) {
        return this.curves.getCurveInfo(measurement);
    }

}
