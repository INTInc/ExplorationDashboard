/*
 * Copyright: Copyright (c) 2013 by INT, Inc.  All rights reserved.<br>
 * Company: INT, Inc. <br>
 * INT PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */

ExplorationDemo.widgets = ExplorationDemo.widgets || {};
ExplorationDemo.widgets.WellLogWidget = (function () {

    var DEFAULT_HEADER_TEXT_STYLE = new geotoolkit.attributes.TextStyle({
        'color': '#eee',
        'font': "12px Open Sans"
    });

    var DEFAULT_CROSSHAIR_TEXTSTYLE = new geotoolkit.attributes.TextStyle({
        'color': 'rgba(204, 0, 102, 1)',
        'font': "bold 12px Open Sans"
    });

    var DEFAULT_SELECTION_LINESTYLE = new geotoolkit.attributes.LineStyle('rgba(255,0,0,1)', 1);
    var DEFAULT_SELECTION_FILLSTYLE = new geotoolkit.attributes.FillStyle('rgba(255,0,0,0.2)');

    var MAJOR_LABEL_COLOR = '#9e9e9e';
    var MINOR_LABEL_COLOR = 'transparent';

    var MAJOR_TICK_COLOR =  "#dddddd";
    var MINOR_TICK_COLOR = "#f7f7f7";

    var DEFAULT_CONFIG = {
        'indextype': 'depth',
        'indexunit': 'm',
        'horizontalscrollable': false,
        'verticalscrollable': false,
        'footer': {
            'visible': false
        },
        'highlight': {
            'linestyle': new geotoolkit.attributes.LineStyle('transparent'),
            'fillstyle': new geotoolkit.attributes.FillStyle('transparent')
        },
        'viewcache': true,
        'indextrack': {
            'styles': {
                'label': {
                    'major': MAJOR_LABEL_COLOR,
                    'minor': MINOR_LABEL_COLOR,
                    'edge': MAJOR_LABEL_COLOR
                },
                'tick': {
                    'major': MAJOR_TICK_COLOR,
                    'minor': MINOR_TICK_COLOR,
                    'edge': MAJOR_TICK_COLOR
                }
            }
        },
        'track': {
            'border': {
                'color': "transparent"
            }
        }
    };

    var Widget = function (config) {
        var props = geotoolkit.mergeObjects(config, DEFAULT_CONFIG);
        geotoolkit.welllog.widgets.WellLogWidget.call(this, props);

        this._device = WEPDemos.utils.getDevice();
        this._domain = 'MD';
        this._cacheDataRef = {};

        var instance = this;
        this.on(geotoolkit.welllog.widgets.WellLogWidget.Events.TracksSizeChanged, function adjustTracksSize() {
            instance.fitTracksToBounds();
            instance.updateWidgetLayout();
        });

        var rubberbandTool = this.getToolByName('rubberband');
        if (rubberbandTool) {
            rubberbandTool.setLineStyle(DEFAULT_SELECTION_LINESTYLE);
            rubberbandTool.setFillStyle(DEFAULT_SELECTION_FILLSTYLE);
        }

        var headerProvider = this.getHeaderContainer().getHeaderProvider();

        var CustomAdaptiveLogCurveVisualHeader = new geotoolkit.welllog.header.AdaptiveLogCurveVisualHeader();
        CustomAdaptiveLogCurveVisualHeader.setElement('ScaleFrom', {'horizontalpos': 'left', 'verticalpos': 'top'});
        CustomAdaptiveLogCurveVisualHeader.setElement('ScaleTo', {'horizontalpos': 'right', 'verticalpos': 'top'});
        CustomAdaptiveLogCurveVisualHeader.setElement('Line', {'horizontalpos': 'center', 'verticalpos': 'center'});
        CustomAdaptiveLogCurveVisualHeader.setElement('Name', {'horizontalpos': 'center', 'verticalpos': 'top'});
        CustomAdaptiveLogCurveVisualHeader.setElement('Unit', {'horizontalpos': 'center', 'verticalpos': 'bottom'});
        CustomAdaptiveLogCurveVisualHeader.setElement('Tracking', {'horizontalpos': 'center', 'verticalpos': 'bottom'});

        headerProvider.registerHeaderProvider(geotoolkit.welllog.CompositeLogCurve.getClassName(), CustomAdaptiveLogCurveVisualHeader);
        //headerProvider.registerHeaderProvider(geotoolkit.welllog.CompositeLogCurve.getClassName(), new geotoolkit.welllog.header.LogCurveVisualHeader());
        headerProvider.registerHeaderProvider(geotoolkit.welllog.LogFill.getClassName(), null);

        var logAxisVisualHeader = headerProvider.getHeaderProvider(geotoolkit.welllog.LogAxis.getClassName());
        logAxisVisualHeader.setHeaderType(geotoolkit.welllog.header.LogAxisVisualHeader.HeaderType.Simple);

        this.customizeWidgetTools();
    };
    geotoolkit.inherits(Widget, geotoolkit.welllog.widgets.WellLogWidget);
    geotoolkit.setClassName(Widget, 'ExplorationDemo.widgets.HorizontalLogWidget');

    Widget.prototype.customizeWidgetTools = function () {
        var rubberbandTool = this.getToolByName('rubberband');
        var pan = this.getToolByName('trackPanning');

        rubberbandTool.addListener('onStateChanged', function () {
            if (rubberbandTool.isEnabled()) {
                pan.setEnabled(false);
            } else {
                pan.setEnabled(true);
            }
        });

        var crosshair = this.getToolByName('cross-hair');

        crosshair.setSettings({
            'east': {
                'visible': true,
                'textstyle': DEFAULT_CROSSHAIR_TEXTSTYLE
            }
        });
    };

    Widget.prototype.changeGridColor = function () {
        geotoolkit.selection.from(this.getTrackContainer()).where(function (node) {
            return (
                node != null &&
                node.getName() != null &&
                (
                    node.getName().indexOf("IndexGrids") !== -1 ||
                    node.getName().indexOf("LinearGrids") !== -1 ||
                    node.getName().indexOf('Log10Grids') !== -1
                )
            );
        }).select(function (nodes) {
            var node;
            for (var i = 0; i < nodes.getChildrenCount(); ++i) {
                node = nodes.getChild(i);

                if (node instanceof geotoolkit.welllog.LogHorizontalGrid) {
                    var tg = node.getTickGenerator();
                    tg.setVisibleTickGrade("EDGE", false);
                    tg.getTickStyle("MAJOR").setColor(MAJOR_TICK_COLOR).setWidth(1);
                    tg.getTickStyle("MINOR").setColor(MINOR_TICK_COLOR).setWidth(1);
                } else if (node instanceof geotoolkit.welllog.LogLinearValueGrid) {
                    if (node.getId() === "LinearGrid1") {
                        node.getLineStyle().setColor(MINOR_TICK_COLOR).setWidth(1);
                    } else if (node.getId() === "LinearGrid2") {
                        node.getLineStyle().setColor(MAJOR_TICK_COLOR).setWidth(1);
                    }
                } else if (node instanceof geotoolkit.welllog.LogLog10ValueGrid) {
                    if (node.getId() === "LogGrid1") {
                        node.getLineStyle().setColor(MINOR_TICK_COLOR).setWidth(1);
                    } else if (node.getId() === "LogGrid2") {
                        node.getLineStyle().setColor(MAJOR_TICK_COLOR).setWidth(1);
                    }
                }
            }
        });

        geotoolkit.selection.from(this.getTrackContainer()).where(function (node) {
            return (
                node != null &&
                node.getId() != null &&
                node.getId().indexOf('AXIS') !== -1
            );
        }).select(function (node) {
            if (!(node instanceof geotoolkit.welllog.LogAxis)) {
                return;
            }

            var tg = node.getTickGenerator();
            var labelstyle = tg.getLabelStyle("MAJOR");
            var font = labelstyle.getFont();
            labelstyle.setFont("bold " + font);

            labelstyle = tg.getLabelStyle("EDGE");
            font = labelstyle.getFont();
            labelstyle.setFont("bold " + font);
        });
    };

    Widget.prototype.setBounds = function (rect) {
        geotoolkit.welllog.widgets.WellLogWidget.prototype.setBounds.call(this, rect);

        if (this.getParent() == null) {
            return;
        }
        //compute new track size
        this.fitTracksToBounds();
        this.updateWidgetLayout();
    };

    Widget.prototype.updateWidgetLayout = function () {
        this.updateLayout();
        var trackContainer = this.getTrackContainer();
        var headerContainer = this.getHeaderContainer();
        var footerContainer = this.getFooterContainer();

        if (trackContainer == null || headerContainer == null || footerContainer == null) {
            return;
        }

        [headerContainer, footerContainer]
            .forEach(function (container) {
                container.rebuild();
                container.setBounds(container.getBounds().clone().setWidth(trackContainer.getBounds().getWidth()));
                if (container.getModelLimits() != null) {
                    container.setModelLimits(container.getModelLimits().clone().setWidth(trackContainer.getModelLimits().getWidth()));
                }
            });
        trackContainer.adjustPosition();
        headerContainer.adjustPosition();
        footerContainer.adjustPosition();
        this.updateScrollPositions()
            .invalidate();
    };

    Widget.prototype.getDomain = function () {
        return this._domain;
    };

    Widget.prototype.setDomain = function (domain) {
        if (this._domain === domain) {
            return;
        }
        this._domain = domain;

        //TODO when data is ready in the las then do this.
        var logCurves = geotoolkit.selection.from(this.getTrackContainer()).where(function (node) {
            return node instanceof geotoolkit.welllog.LogCurve;
        }).selectToArray();

        var ids = logCurves.map(function (el) {
            return el.getDataSource().__id__;
        });

        var instance = this;
        var newLogData, multiLogData, id, min = Number.MAX_VALUE, max = Number.MIN_VALUE;
        logCurves.forEach(function (logCurve, index) {
            id = ids[index];
            multiLogData = instance.getMultiLogDataById(id);
            newLogData = multiLogData.getSpecificLogData(domain);
            min = Math.min(min, newLogData.getMinDepth());
            max = Math.max(max, newLogData.getMaxDepth());
            logCurve.setData(newLogData, false, true);
        });

        //change log axis name to display domain
        this.updateLogAxisDisplayName();

        //change markers positions
        var markers = geotoolkit.selection.from(this.getTrackContainer()).where(function (node) {
            return node instanceof geotoolkit.welllog.LogMarker;
        }).selectToArray();
        markers.forEach(function (marker) {
            newLogData = marker.getSpecificData(domain);
            marker.setDepthValue(newLogData, marker.getNameLabel());
        });

        this.setDepthLimits(min, max);
        this.setVisibleDepthLimits(min, max);
        this.updateWidgetLayout();

        if (this.getOrientation() === geotoolkit.util.Orientation.Vertical) {
            this.fitToHeight();
        }
    };

    Widget.prototype.addMultiLogDataReference = function (multi) {
        this._cacheDataRef[multi.__id__] = multi;
    };

    Widget.prototype.getMultiLogDataById = function (id) {
        return this._cacheDataRef[id];
    };

    Widget.prototype.updateLogAxisDisplayName = function () {
        var domain = this.getDomain();
        //change log axis name to display domain
        var logAxis = geotoolkit.selection.from(this.getTrackContainer()).where(function (node) {
            return node instanceof geotoolkit.welllog.LogAxis;
        }).selectToArray();
        logAxis.forEach(function (logaxis) {
            logaxis.setName(domain);
        });
    };

    geotoolkit.obfuscate(Widget, geotoolkit.welllog.widgets.WellLogWidget);
    return Widget;
})();