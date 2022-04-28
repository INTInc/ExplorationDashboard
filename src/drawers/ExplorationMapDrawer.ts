import { Path } from '@int/geotoolkit/scene/shapes/Path';
import { Polygon } from '@int/geotoolkit/scene/shapes/Polygon';
import { Shape } from '@int/geotoolkit/scene/shapes/Shape';
import { RgbaColor } from '@int/geotoolkit/util/RgbaColor';

import { Drawer } from './Drawer';
import { ExplorationMapAdapter } from '@/data-sources/exploration-map-adapter/ExplorationMapAdapter';

const PRIMARY_COLOR = new RgbaColor(140, 104, 205, 1);
const PRIMARY_TRANSPARENT_COLOR = new RgbaColor(140, 104, 205, 0.5);

export class ExplorationMapDrawer extends Drawer<ExplorationMapAdapter> {

    public get zone(): Polygon {
        this.checkDataSource();
        const {x, y, name} = this.dataSource.zoneCoordinates;
        return new Polygon({ x, y })
            .setFillStyle({
                color: PRIMARY_TRANSPARENT_COLOR
            })
            .setLineStyle({
                color: PRIMARY_COLOR,
                width: 3
            })
            .setName(name)
    }
    public get wells(): Path[] { 
        this.checkDataSource();
        return this.dataSource.wellsCoordinates.map(({x, y, name}) => {
            const path = new Path({})
                .setLineStyle({
                    color: PRIMARY_COLOR,
                    width: 3
                })
                .setName(name)
                .moveTo(x[0], y[0]);

            for (let i = 1; i < x.length; i++) path.lineTo(x[i], y[i]);
            return path;
        });
    }
    
}