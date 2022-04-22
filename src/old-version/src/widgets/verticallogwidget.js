/*
 * Copyright: Copyright (c) 2013 by INT, Inc.  All rights reserved.<br>
 * Company: INT, Inc. <br>
 * INT PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */

ExplorationDemo.widgets = ExplorationDemo.widgets || {};
ExplorationDemo.widgets.VerticalLogWidget = (function () {

    var DEFAULT_CONFIG = {
        'header': {
            'visible': true,
            'height': 84
        }
    };

    var DEFAULT_LOGARITHMIC_DECADE_COUNT = 4;
    var DEFAULT_LOGARITHMIC_MIN = 0.2;
    var DEFAULT_LOGARITHMIC_MAX = 2000;

    var Widget = function () {
        ExplorationDemo.widgets.WellLogWidget.call(this, DEFAULT_CONFIG);
    };
    geotoolkit.inherits(Widget, ExplorationDemo.widgets.WellLogWidget);
    geotoolkit.setClassName(Widget, 'ExplorationDemo.widgets.VerticalLogWidget');

    Widget.prototype.initializeComponent = function () {
        var width = 250;
        if(this._device === 'mobile' || this._device === 'tablet') {
            width = 180;
        }
        this.insertTrack(geotoolkit.welllog.widgets.TrackType.LinearTrack, 0, width);
        this.insertTrack(geotoolkit.welllog.widgets.TrackType.IndexTrack, 1);
        this.insertTrack(geotoolkit.welllog.widgets.TrackType.LinearTrack, 2, width);
        this.insertTrack(geotoolkit.welllog.widgets.TrackType.LogTrack, 3, width);

        var logGrids = geotoolkit.selection.from(this.getTrackAt(3)).where(function (node) {
            return node.getId() === 'LogGrid1' || node.getId() === 'LogGrid2';
        }).selectToArray();

        logGrids.forEach(function (logGrid) {
            //change decade count
            logGrid.setDecadeCount(DEFAULT_LOGARITHMIC_DECADE_COUNT);
            //change logarithmic scale
            logGrid.setLogarithmicRange(DEFAULT_LOGARITHMIC_MIN, DEFAULT_LOGARITHMIC_MAX);
        });

        this.updateLogAxisDisplayName();

        this.changeGridColor();
    };

    Widget.prototype.fitTracksToBounds = function () {
        var tc = this.getTrackContainer();
        if(tc == null) {
            return;
        }
        var totalCount = tc.getChildrenCount();
        var count = 0;

        //we need to ignore log markers
        for (var i = 0; i < totalCount; ++i) {
            if (tc.getChild(i) instanceof geotoolkit.welllog.LogMarker) {
                continue;
            }
            ++count;
        }

        if(count !== 4 || this._device != 'desktop') {
            this.updateWidgetLayout();
            return;
        }

        var tcW = this.getBounds().getWidth();
        var idxW = tc.getChild(1).getBounds().getWidth();
        var remainingSpace = tcW - idxW;
        var trackW = Math.round(remainingSpace / 3);
        tc.setTrackWidth(trackW, tc.getChild(0));
        tc.setTrackWidth(idxW, tc.getChild(1));
        tc.setTrackWidth(trackW, tc.getChild(2));
        tc.setTrackWidth(trackW, tc.getChild(3));
    };

    geotoolkit.obfuscate(Widget, geotoolkit.welllog.widgets.WellLogWidget);
    return Widget;
})();