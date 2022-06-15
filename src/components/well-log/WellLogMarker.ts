import {LogMarker} from '@int/geotoolkit/welllog/LogMarker';
import {WellAnnotation} from '@/common/model/WellAnnotation';
import {IndexMeasurement} from '@/common/model/IndexMeasurement';
import {LineStyle} from '@int/geotoolkit/attributes/LineStyle';
import {AnchorType} from '@int/geotoolkit/util/AnchorType';

export class WellLogMarker extends LogMarker {

    constructor (
        private annotation: WellAnnotation,
        private indexMeasurement: IndexMeasurement
    ) {
        super(annotation.getDepth(indexMeasurement.getKey()), annotation.getText());
        this
            .setLineStyle(new LineStyle({color: annotation.getColor(), width: 2}))
            .setVerticalTextOffset(-5)
            .setHorizontalTextOffset(5)
            .setNameLabelPosition(AnchorType.LeftTop)
            .setDepthLabelPosition(AnchorType.LeftBottom)
            .setFillStyleDepth(annotation.getColor())
            .setFillStyleName(annotation.getColor())
            .setFillDepthLabel(true)
            .setFillNameLabel(true);
    }

    public setIndexMeasurement (indexMeasurement: IndexMeasurement) {
        const depth = this.annotation.getDepth(indexMeasurement.getKey());
        this.setDepth(depth);
        this.setDepthLabel(depth + ' m');
    }

}
