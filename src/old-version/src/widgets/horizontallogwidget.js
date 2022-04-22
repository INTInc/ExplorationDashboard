/*
 * Copyright: Copyright (c) 2013 by INT, Inc.  All rights reserved.<br>
 * Company: INT, Inc. <br>
 * INT PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */

ExplorationDemo.widgets = ExplorationDemo.widgets || {};
ExplorationDemo.widgets.HorizontalLogWidget = (function () {

    var DEFAULT_CONFIG = {
        'header': {
            'visible': true,
            'height': 84
        }
    };

    var Widget = function () {
        ExplorationDemo.widgets.WellLogWidget.call(this, DEFAULT_CONFIG);

        this.createCustomRubberBandTool();
    };
    geotoolkit.inherits(Widget, ExplorationDemo.widgets.WellLogWidget);
    geotoolkit.setClassName(Widget, 'ExplorationDemo.widgets.HorizontalLogWidget');

    Widget.prototype.initializeComponent = function () {
        var browser = WEPDemos.utils.getDevice();
        var width = 200;
        if (browser === 'mobile' || browser === 'tablet') {
            width = 120;
        }

        this.insertTrack(geotoolkit.welllog.widgets.TrackType.LinearTrack, 0, width);
        this.insertTrack(geotoolkit.welllog.widgets.TrackType.IndexTrack, 1);

        this.updateLogAxisDisplayName();

        this.changeGridColor();
    };

    Widget.prototype.fitTracksToBounds = function () {
        var tc = this.getTrackContainer();
        if (tc == null) {
            return;
        }
        var count = tc.getChildrenCount();
        if (count !== 2) {
            this.updateWidgetLayout();
            return;
        }

        var tcW = this.getBounds().getHeight();
        var idxW = tc.getChild(1).getBounds().getWidth();
        var remainingSpace = tcW - idxW;
        tc.setTrackWidth(remainingSpace, tc.getChild(0));
        tc.setTrackWidth(idxW, tc.getChild(1));
    };


    Widget.prototype.createCustomRubberBandTool = function () {
        var manipulatorLayer = this.getToolByName('cross-hair').getManipulatorLayer();

        var customRubberBandTool = new geotoolkit.controls.tools.RubberBand(manipulatorLayer, geotoolkit.controls.tools.RubberBandRenderMode.Horizontal)
            .setEnabled(false)
            .setName('rubberband-custom')
            .setMode(geotoolkit.controls.tools.RubberBandRenderMode.Horizontal)
            .setLineStyle({
                'color': "rgba(204, 0, 102, 1)",
                'width': 2,
                'pixelsnapmode': {x: false, y: true}
            })
            .setFillStyle({
                'color': "rgba(204, 0, 102, 0.2)"
            })
            .setAutoDisabled(true)
            .addListener("onZoomEnd",
            function (sender, eventArgs) {
                var rect = eventArgs.getArea();
                var tc = this.getTrackContainer();
                var track = tc.getTrackAt(0);// represent first logtrack.
                var tr = track.getWorldTransform().createInverse();

                var modelRect = tr.transformRect(rect);
                var min = modelRect.getRight();
                var max = modelRect.getLeft();
                var range;

                if (isNaN(min) || isNaN(max)) {
                    return;
                }

                var visuals = geotoolkit.selection.from(this.getTrackContainer()).where(function (node) {
                    return (node instanceof geotoolkit.welllog.CompositeLogCurve && node.getName() !== 'GR');
                }).selectToArray();

                var valMin, valMax;
                visuals.forEach(function (visual) {
                    range = visual.getMinimumNormalizationLimit() - visual.getMaximumNormalizationLimit();
                    valMin = visual.getMaximumNormalizationLimit() + range * (1 - min); // Warning min/max are flipped
                    valMax = visual.getMaximumNormalizationLimit() + range * (1 - max);

                    visual.setNormalizationLimits(valMax, valMin);
                });

                track.invalidate();
                tc.invalidate();
            }.bind(this));

        var rubberbandTool = this.getToolByName('rubberband');
        var pan = this.getToolByName('trackPanning');

        customRubberBandTool.addListener('onStateChanged', function () {
            if (customRubberBandTool.isEnabled()) {
                rubberbandTool.setEnabled(false);
                pan.setEnabled(false);
            } else {
                pan.setEnabled(true);
            }
        });

        this.connectTool([customRubberBandTool]);
    };

    Widget.prototype.resetNormalizationLimits = function (min, max) {
        var visuals = geotoolkit.selection.from(this.getTrackContainer()).where(function (node) {
            return (node instanceof geotoolkit.welllog.CompositeLogCurve && node.getName() !== 'GR');
        }).selectToArray();

        visuals.forEach(function (visual) {
            visual.setNormalizationLimits(min, max); // warning it is reverted
        });
    };

    geotoolkit.obfuscate(Widget, geotoolkit.welllog.widgets.WellLogWidget);
    return Widget;
})();