import {Styleable} from '@/common/styling/Styleable';
import {AppTheme} from '@/common/styling/AppTheme';
import {LineStyle, Patterns} from '@int/geotoolkit/attributes/LineStyle';
import {TextStyle} from '@int/geotoolkit/attributes/TextStyle';
import {Wells3D} from '@/components/wells-3d/Wells3D';
import {WellStaticPoint} from '@/components/wells-3d/objects/WellStaticPoint';

interface ModelTheme {
    axisLineStyle: LineStyle,
    gridLineStyle: LineStyle,
    textStyle: TextStyle
}

const FONT = 'bold 11px Arial';

const THEME_DARK: ModelTheme = {
    axisLineStyle: new LineStyle({color: '#777777', pattern: Patterns.Solid}),
    gridLineStyle: new LineStyle({color: '#505050', pattern: Patterns.Dash}),
    textStyle: new TextStyle({color: '#ffffff', font: FONT})
};

const THEME_LIGHT: ModelTheme = {
    axisLineStyle: new LineStyle({color: '#dddddd', pattern: Patterns.Solid}),
    gridLineStyle: new LineStyle({color: '#cccccc', pattern: Patterns.Dash}),
    textStyle: new TextStyle({color: '#505050', font: FONT})
};

export class Wells3DStyleable extends Wells3D implements Styleable {

    public applyTheme (appTheme: AppTheme): void {
        const modelTheme = appTheme === AppTheme.Dark ? THEME_DARK : THEME_LIGHT;

        this.applyThemeToGrid(modelTheme);
        this.applyThemeToWellNames(modelTheme);
    }

    private applyThemeToGrid (theme: ModelTheme) {
        this.grid.setOptions({
            grid: {
                linestyles: {x: theme.gridLineStyle, y: theme.gridLineStyle, z: theme.gridLineStyle}
            },
            axis: {
                linestyles: {x: theme.axisLineStyle, y: theme.axisLineStyle, z: theme.axisLineStyle},
                textstyles: {x: theme.textStyle, y: theme.textStyle, z: theme.textStyle}
            },
            title: {
                textstyles: {x: theme.textStyle, y: theme.textStyle, z: theme.textStyle}
            }
        });
    }

    private applyThemeToWellNames (theme: ModelTheme) {
        this.wellNames.forEach((point: WellStaticPoint) => point.setAnnotation(point.getLabel(), theme.textStyle));
    }

}
