/*
 * Copyright: Copyright (c) 2013 by INT, Inc.  All rights reserved.<br>
 * Company: INT, Inc. <br>
 * INT PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */

ExplorationDemo.view = ExplorationDemo.view || {};
ExplorationDemo.view.View = (function () {

    var EXPLORATION_ID = '#exploration-tab';

    var DECIMATE = true;
    var DECIMATE_VALUE = 1000;

    var DEFAULT_MAP_ZOOM = 3;
    var WELL_MAP_ZOOM = 12;
    var ZOOM_SPEED = 80;//ms

    var DEFAULT_MAP_CENTER_LAT = 61.204268;
    var DEFAULT_MAP_CENTER_LNG = 2.201707;

    var POLYLINE_COLOR = '#ff0000';
    var POLYLINE_OPACITY = 1.0;
    var POLYLINE_LINE_WIDTH = 2;

    var CURVE_COLORS = {
        'GR': "#4d7731",//green
        'CALI': "#ed7d31",//orange
        'NPHI': "#c00000",//red
        'RHOB': "#5b9bd5",//blue
        'ILD': "#262626",//black
        'ILM': "#5b9bd5"//blue
    };
    var GR_FILL_COLOR = '#ffc000';
    var GR_REFERENCE_LINE_VALUE = 60;

    var TRAJECTORY_CURVE_COLOR = '#262626';
    var HORIZONTAL_NORMALIZED_MIN = 992;
    var HORIZONTAL_NORMALIZED_MAX = 2109;
    var CURVE_NORMALIZATION_LIMITS = {
        'GR': {min: 0, max: 150},
        'CALI': {min: 0, max: 10},
        'NPHI': {min: 0.45, max: -0.15},
        'RHOB': {min: 1.95, max: 2.95},
        'ILD': {min: 0.2, max: 2000},
        'ILM': {min: 0.2, max: 2000}
    };
    var TOP_CURVE_COLORS = topColorMapping(1);
    var TOP_CURVE_FILLING = topColorMapping();

    var WELL_NAME_COLOR = '#5b9bd5';
    var WELL_TRAJECTORY_COLOR = '#70ad47';
    var WELL_LOG_COLOR = '#c00000';
    var WELL_LOG_FILL_COLOR = GR_FILL_COLOR;
    var WELL_NAME_ANNOTATION_TEXT_STYLE = new geotoolkit.attributes.TextStyle({
        'font': "bold 14px Open Sans",
        'color': WELL_NAME_COLOR
    });
    var CURVE_OFFSET = 75;
    var CURSOR_TRACKING_COLOR = 'red';
    var CURSOR_DIMENSION = 100;

    var TOP_ANNOTATION_RADIUS = 20;
    var TOP_ANNOTATION_TEXT_STYLE = new geotoolkit.attributes.TextStyle({
        'font': "italic 10px Open Sans"
    });

    function topColorMapping(alpha) {
        var top = alpha === 1 ? alpha : 0.25;
        var bottom = alpha === 1 ? alpha : 0.75;

        return [
            'rgba( 128, 0, 0 , ' + top + ')',//a
            'rgba( 110, 61 , 217, ' + top + ')',//b
            'rgba( 237, 125, 49 , ' + top + ')',//c
            'rgba( 61, 217 ,74 , ' + bottom + ')',//d
            'rgba( 61, 121, 217 , ' + bottom + ')',//e
            'rgba( 217, 217, 61, ' + bottom + ')',//f
            'rgba( 136, 217, 61, ' + bottom + ')',//g
            'rgba( 217, 89, 61, ' + bottom + ')'//h
        ];
    }

    //@formatter:off
    var TEMPLATE = [
        '<div class="col-lg-4 col-md-4 col-sm-5 col-xs-12 first-container vertical-height widget-padding">' ,
            '<div id="vertical-container">',
                '<div class="toolbox collapsed">',
                    '<div class="icon-spin widget-settings-icon"><i class="fa fa-cogs"></i></div>' ,
                    '<div class="toolbox-content"></div>' ,
                '</div>' ,
            '</div>' ,
        '</div>',
        '<div class="col-lg-8 col-md-8 col-sm-7 col-xs-12 vertical-height second-container">',
            '<div class="top-horizontal-row">',
                '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 horizontal-wlw vertical-height widget-padding" >',
                    '<div id="horizontal-container" >',
                         '<div class="toolbox collapsed">',
                            '<div class="icon-spin widget-settings-icon"><i class="fa fa-cogs"></i></div>',
                            '<div class="toolbox-content"></div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>',
            '<div class="bottom-horizontal-row">',
                '<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12 bottom-row-vertical-height google-map-div-container">',
                    '<div id="google-map-view-container" class="vertical-height"></div>',
                    '<div class="toolbox collapsed google-map">',
                        '<div class="icon-spin widget-settings-icon"><i class="fa fa-cogs"></i></div>',
                        '<div class="toolbox-content"></div>',
                    '</div>',
                '</div>',
                '<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12 bottom-row-vertical-height dynamic-view-3d-layout">',
                    '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 view-3d-div-container vertical-height">',
                        '<div id="3d-view-container">',
                            '<div class="toolbox collapsed toolbox-3d">',
                                '<div class="icon-spin widget-settings-icon"><i class="fa fa-cogs"></i></div>',
                                '<div class="toolbox-content"></div>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>'
    ].join('\n');

    var TEMPLATE_WARNING_WEBGL = [
        '<div class="warning-container">',
            '<i class="fa fa-times-circle warning-sign"></i>',
            '<p class="warning-text">Warning, your device doesn\'t support WebGL.</p>',
        '</div>'
    ].join('\n');

    var EXPAND_WIDGET_TOOL = [
        '<div class="widget-expand-tool icon-spin" id="<%= id %>" title="Expand">',
            '<i class="glyphicon glyphicon-resize-full small-size"></i>',
        '</div>'
    ].join('\n');

    var RESET_EXPAND_WIDGET_TOOL = [
        '<div class="widget-reset-expand-tool icon-spin" id="<%= id %>" title="Reset Expand" style="display:none;">',
            '<i class="glyphicon glyphicon-resize-small"></i>',
        '</div>'
    ].join('\n');

    var ZOOM_IN_TOOL = [
        '<div id="<%= id %>" class="col-lg-12 col-md-12 col-sm-12 col-xs-12"><i class="fa fa-search-plus tool" title="Zoom In"></i></div>'
    ].join('\n');

    var ZOOM_OUT_TOOL = [
        '<div id="<%= id %>" class="col-lg-12 col-md-12 col-sm-12 col-xs-12"><i class="fa fa-search-minus tool" title="Zoom Out"></i></div>'
    ].join('\n');

    var SHOW_HIDE_HEADER = [
        '<div id="<%= id %>" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 tool-separator active"><i class="fa fa-list-ol tool" title="Show/Hide Header"></i></div>'
    ].join('\n');

    var RUBBERBAND_TOOL = [
        '<div id="<%= id %>" class="col-lg-12 col-md-12 col-sm-12 col-xs-12"><i class="glyphicon glyphicon-sound-stereo tool <% if( isRotated ) {%> fa-rotate-90 <%} %>" title="Rubberband Zoom"></i></div>'
    ].join('\n');

    var FIT_TO_BOUNDS_ZOOM_TOOL = [
        '<div id="<%= id %>" class="col-lg-12 col-md-12 col-sm-12 col-xs-12"><i class="fa fa-arrows-alt tool" title="Fit To Bounds"></i></div>'
    ].join('\n');

    var CENTER_MAP_TOOL = [
        '<div id="<%= id %>" class="col-lg-12 col-md-12 col-sm-12 col-xs-12"><i class="fa fa-crosshairs tool" title="Center Map"></i></div>'
    ].join('\n');

    var DOMAINE_TOOL = [
        '<div id="<%= id %>-md" class="domain-tool col-lg-12 col-md-12 col-sm-12 col-xs-12 active"><span class="domain-text">MD</span></div>',
        '<% if( mode ==="vertical") { %> <div id="<%= id %>-tvd" class="domain-tool col-lg-12 col-md-12 col-sm-12 col-xs-12"><span class="domain-text">TVD</span></div> <% } %>',
        '<div id="<%= id %>-hzd" class="domain-tool col-lg-12 col-md-12 col-sm-12 col-xs-12"><span class="domain-text">HZD</span></div>'
    ].join('\n');

    var CYLINDER_TOOL = [
        '<div id="<%= id %>" class="col-lg-12 col-md-12 col-sm-12 col-xs-12"><i class="fa fa-database tool" title="Show Cylinder Mode"></i></div>'
    ].join('\n');
    //@formatter:on

    var View = function () {
        var me = this;
        me.$el = $(_.template(TEMPLATE)({}));

        me._map = null;
        me._hWidget = null;
        me._vWidget = null;
        me._3dplot = null;
        me._isMobileDevice = WEPDemos.utils.isMobileDevice();
    };

    View.prototype.initialize = function () {
        var me = this;

        me.createHorizontalWidget();
        me.createVerticalWidget();

        me.createGoogleMapWidget();
        me.loadGoogleMapData();

        if (WEPDemos.utils.isWebGLCompatible()) {
            me.create3DWidget();
        } else {
            me.createWebGLWarning();
        }

        me.loadVerticalWidgetData();
        me.loadHorizontalWidgetData();
    };

    View.prototype.showHTMLElements = function () {
        var me = this;

        //pan to right position google maps
        me._map['panTo'](new google['maps']['LatLng'](DEFAULT_MAP_CENTER_LAT, DEFAULT_MAP_CENTER_LNG));

        //refresh horizontal welllog widgets depth limits
        geotoolkit.selection.from(me._hWidget.getTrackContainer()).where(function (node) {
            return (node != null && node instanceof geotoolkit.welllog.CompositeLogCurve && node.getName().indexOf("GR") !== -1);
        }).select(function (nodes) {
            var min = nodes.getDataSource().getMinDepth();
            var max = nodes.getDataSource().getMaxDepth();

            me._hWidget.setVisibleDepthLimits(min, max);//TODO fix bug Infinity limits
        });

        //refresh vertical welllog widgets depth limits
        var limits = me._vWidget.getDepthLimits();
        me._vWidget.setVisibleDepthLimits(limits.getLow(), limits.getHigh());
        me._vWidget.fitToHeight();

        //scroll down in header to see TVD and GR on start
        limits = me._hWidget.getHeaderContainer().getModelLimits();
        var y = limits.getHeight() - me._hWidget.getHeaderContainer().getBounds().getHeight();
        //me._hWidget.getHeaderContainer().setVisibleModelLimits(new geotoolkit.util.Rect(limits.getX(), y, limits.getWidth(),
        // limits.getHeight()));
    };

    View.prototype.loadVerticalWidgetData = function () {
        var instance = this;
        var widget = instance._vWidget;

        var url;
        if (WEPDemos.utils.isDesktopDevice()) {
            url = DECIMATE ? 'data/wellB-2/logs_desktop_decimated.las' : 'data/wellB-2/logs_desktop.las';
        }
        else if (WEPDemos.utils.isTabletDevice()) {
            url = DECIMATE ? 'data/wellB-2/logs_tablet_decimated.las' : 'data/wellB-2/logs_tablet.las';
        }
        else if (instance._isMobileDevice) {
            url = DECIMATE ? 'data/wellB-2/logs_smartphone_decimated.las' : 'data-2/well/logs_smartphone.las';
        }

        $.ajax({
            'url': url,
            'cache': true,
            success: function (raw) {
                if (raw == null || widget == null) {
                    return;
                }
                var logParser = geotoolkit.welllog.data.las.LasParser.getParserInstance(raw);
                var sections = logParser.buildSections();

                var names = sections.map(function (el) {
                    return el.name;
                });

                var indexLAS = names.indexOf('LAS2');
                if (indexLAS < 0) {
                    return;
                }
                var data = sections[indexLAS];

                var depths = data.getCurveData('DEPT');
                var tvds = data.getCurveData('TVD');
                var hzds = data.getCurveData('HRZDISP');
                var log, logData, multiLogData, logVisual, prevLogVisual, track, info, unit, limits;

                var curvesMnemonics = ['GR', 'CALI', 'NPHI', 'RHOB', 'ILD', 'ILM'];
                var curvesTracksIndex = [0, 0, 2, 2, 3, 3];

                curvesMnemonics.forEach(function (mnemonic, index) {
                    log = data.getCurveData(mnemonic);
                    info = data.getCurveInfo(mnemonic);
                    unit = info != null ? info.getUnit() : null;

                    multiLogData = new ExplorationDemo.data.MultiLogData({
                        'mds': depths,
                        'tvds': tvds,
                        'hzds': hzds,
                        'values': log,
                        'name': mnemonic
                    });

                    widget.addMultiLogDataReference(multiLogData);
                    logData = multiLogData.getSpecificLogData(widget.getDomain());

                    if (unit != null) {
                        multiLogData.setValueUnit(unit);
                    }

                    logVisual = new geotoolkit.welllog.CompositeLogCurve(logData, true);
                    logVisual.setLineStyle(new geotoolkit.attributes.LineStyle({
                        'color': CURVE_COLORS[mnemonic],
                        'width': 1,
                        'pattern': geotoolkit.attributes.LineStyle.Patterns.Solid
                    }));

                    if (curvesTracksIndex[index] === 3) {
                        //Logarithmic mode
                        logVisual.setLogarithmicScale(true);
                    }

                    limits = CURVE_NORMALIZATION_LIMITS[mnemonic];
                    if (limits != null) {
                        logVisual.setNormalizationLimits(limits.min, limits.max);
                    }

                    track = widget.getTrackAt(curvesTracksIndex[index]);
                    track.addChild(logVisual);

                    if (index === 0) {
                        // add GR right reference line to
                        var refLine = new geotoolkit.welllog.LogReferenceLine((GR_REFERENCE_LINE_VALUE - limits.min) / (limits.max - limits.min));
                        track.addChild(refLine);

                        logVisual.setRightReferencePointSet(refLine);
                        logVisual.getRightFill().getFillStyle().setColor(GR_FILL_COLOR);
                    }

                    if (index === 3) {
                        //case add left /right filling between NPHI and RHOB
                        prevLogVisual.setLeftReferencePointSet(logVisual);
                        prevLogVisual.setRightReferencePointSet(logVisual);
                        prevLogVisual.getLeftFill().getFillStyle().setColor('#ffc000');
                        prevLogVisual.getRightFill().getFillStyle().setColor('#70ad47');
                    }

                    prevLogVisual = logVisual;
                });

                widget.setDepthLimits(logData.getMinDepth(), logData.getMaxDepth());

                $(EXPLORATION_ID).trigger('data-loaded');//TODO improve this
            },
            error: onError
        });


        $.ajax({
            'url': 'data/wellB-2/surveys.las',
            'cache': true,
            success: function (raw) {
                if (raw == null || widget == null) {
                    return;
                }
                var logParser = geotoolkit.welllog.data.las.LasParser.getParserInstance(raw);
                var sections = logParser.buildSections();

                var names = sections.map(function (el) {
                    return el.name;
                });

                var indexLAS = names.indexOf('LAS2');
                if (indexLAS < 0) {
                    return;
                }
                var data = sections[indexLAS];

                //update 2d Section
                var depths = data.getCurveData('MD');
                var tvds = data.getCurveData('TVD');
                var hzds = data.getCurveData('HRZDISP');
                var log, logData = null, multiLogData, min, max, info, unit;

                ['TVD'].forEach(function (mnemonic, index) {
                    log = data.getCurveData(mnemonic);
                    info = data.getCurveInfo(mnemonic);
                    unit = info != null ? info.getUnit() : null;
                    multiLogData = new ExplorationDemo.data.MultiLogData({
                        'mds': depths,
                        'tvds': tvds,
                        'hzds': hzds,
                        'values': log,
                        'name': mnemonic
                    });

                    widget.addMultiLogDataReference(multiLogData);
                    logData = multiLogData.getSpecificLogData(widget.getDomain());

                    if (unit != null) {
                        multiLogData.setValueUnit(unit);
                    }
                });

                if (logData == null) {
                    return;
                }

                $(EXPLORATION_ID).trigger('data-loaded');//TODO improve this

                //update 3d section
                if (instance._3dplot) {
                    var posX = data.getCurveData('X'),
                        posY = data.getCurveData('Y'),
                        posZ = -data.getCurveData('TVD');

                    var devX = data.getCurveData('DX');
                    var devY = data.getCurveData('DY');
                    var values = data.getCurveData('DLS');
                    var elevation = data.getCurveData('Z');

                    var surveyData = new ExplorationDemo.data.SurveyData({
                        'name': "WELLB-2",
                        'x': posX,
                        'y': posY,
                        'tvd': posZ,
                        'md': depths,
                        'deviation': {
                            'x': devX,
                            'y': devY,
                            'elevation': elevation
                        },
                        'value': values
                    });

                    instance.createWellTrajectory(surveyData);

                    var cursor = instance.create3DCursorTracking();
                    widget.getToolByName('cross-hair').addListener('onPositionChanged', instance.updateCrossHairCursor.bind({
                        widget: widget,
                        cursor: cursor,
                        surveydata: surveyData
                    }));

                    loadTops(surveyData);
                }
                else {
                    loadTops(null);
                }

            },
            error: onError
        });

        function loadTops(surveyData) {
            return $.ajax({
                'url': 'data/wellB-2/tops.json',
                'cache': true,
                success: function (raw) {
                    if (raw == null || widget == null) {
                        return;
                    }

                    var marker, depth, linestyle, name;
                    var domain = widget.getDomain();

                    raw.forEach(function (top, index) {
                        name = top['name'];
                        marker = new geotoolkit.welllog.LogMarker(null, name);
                        marker.__MD__ = top['MD'];
                        marker.__TVD__ = top['TVD'];
                        marker.__HZD__ = top['HRZDISP'];
                        marker.getSpecificData = getSpecificData;

                        linestyle = new geotoolkit.attributes.LineStyle(TOP_CURVE_COLORS[index], 1);
                        marker.setLineStyle(linestyle);
                        marker.getTextStyle().setFont('bold 12px Arial');
                        marker.getTextStyle().setColor(TOP_CURVE_COLORS[index]);
                        marker.setNameLabelPosition(geotoolkit.util.AnchorType.RightTop);
                        marker.setDepthLabelPosition(geotoolkit.util.AnchorType.RightBottom);

                        depth = marker.getSpecificData(domain);
                        marker.setDepthValue(depth, name);

                        widget.getTrackContainer().addChild(marker);
                    });

                    $(EXPLORATION_ID).trigger('data-loaded');//TODO improve this

                    if (!instance._3dplot || surveyData == null) {
                        return;
                    }
                    surveyData.addTops(raw);
                    instance.add3DTopsToTrajectory(surveyData);
                },
                error: onError

            });

            function getSpecificData(domain) {
                switch (domain) {
                    case 'MD':
                        return this.__MD__;
                    case 'TVD':
                        return this.__TVD__;
                    case 'HZD':
                        return this.__HZD__;
                }
            }
        }

        function onError(error) {
            throw 'error : ' + error;
        }
    };

    View.prototype.loadHorizontalWidgetData = function () {
        var instance = this;
        var widget = instance._hWidget;

        var track = widget.getTrackAt(0);
        var indexToInsert = track.getChildrenCount();

        var url;
        if (WEPDemos.utils.isDesktopDevice()) {
            url = 'data/wellB-32/logs_desktop.las';
        }
        else if (WEPDemos.utils.isTabletDevice()) {
            url = 'data/wellB-32/logs_tablet.las';
        }
        else if (instance._isMobileDevice) {
            url = 'data/wellB-32/logs_smartphone.las';
        }

        $.ajax({
            'url': url,
            'cache': true,
            success: function (raw) {
                if (raw == null || widget == null) {
                    return;
                }
                var logParser = geotoolkit.welllog.data.las.LasParser.getParserInstance(raw);
                var sections = logParser.buildSections();

                var names = sections.map(function (el) {
                    return el.name;
                });

                var indexLAS = names.indexOf('LAS2');
                if (indexLAS < 0) {
                    return;
                }
                var data = sections[indexLAS];

                var depths = data.getCurveData('DEPT');
                var tvds = data.getCurveData('TVD');
                var hzds = data.getCurveData('HRZDISP');
                var log, multiLogData, logData, logVisual, info, unit, limits;
                var curvesMnemonics = ['GR'];
                curvesMnemonics.forEach(function (mnemonic, index) {
                    log = data.getCurveData(mnemonic);
                    info = data.getCurveInfo(mnemonic);
                    unit = info != null ? info.getUnit() : null;
                    multiLogData = new ExplorationDemo.data.MultiLogData({
                        'mds': depths,
                        'tvds': tvds,
                        'hzds': hzds,
                        'values': log,
                        'name': mnemonic
                    });

                    widget.addMultiLogDataReference(multiLogData);
                    logData = multiLogData.getSpecificLogData(widget.getDomain());

                    if (unit != null) {
                        multiLogData.setValueUnit(unit);
                    }

                    logVisual = new geotoolkit.welllog.CompositeLogCurve(logData, true);
                    logVisual.setLineStyle(new geotoolkit.attributes.LineStyle({
                        'color': CURVE_COLORS[mnemonic],
                        'width': 1,
                        'pattern': geotoolkit.attributes.LineStyle.Patterns.Solid
                    }));

                    limits = CURVE_NORMALIZATION_LIMITS[mnemonic];
                    if (limits != null) {
                        logVisual.setNormalizationLimits(limits.min, limits.max);
                    }

                    var microPositionLeft = 0.5;
                    var microPositionRight = 1;
                    logVisual.setMicroPosition(microPositionLeft, microPositionRight);

                    var modelGR = (GR_REFERENCE_LINE_VALUE - limits.min) / (limits.max - limits.min);
                    var modelGRMicroPos = microPositionLeft + modelGR * (microPositionRight - microPositionLeft);

                    // add GR right reference line to
                    var refLine = new geotoolkit.welllog.LogReferenceLine(modelGRMicroPos);
                    track.addChild(refLine);

                    track.addChild(logVisual);

                    logVisual.setRightReferencePointSet(refLine);
                    logVisual.getRightFill().getFillStyle().setColor(GR_FILL_COLOR);
                });

                $(EXPLORATION_ID).trigger('data-loaded');//TODO improve this
            },
            error: onError
        });

        $.ajax({
            'url': 'data/wellB-32/surveys.las',
            'cache': true,
            success: function (raw) {
                loadTops();
                if (raw == null || widget == null) {
                    return;
                }
                var logParser = geotoolkit.welllog.data.las.LasParser.getParserInstance(raw);
                var sections = logParser.buildSections();

                var names = sections.map(function (el) {
                    return el.name;
                });

                var indexLAS = names.indexOf('LAS2');
                if (indexLAS < 0) {
                    return;
                }
                var data = sections[indexLAS];

                var depths = data.getCurveData('MD');
                var tvds = data.getCurveData('TVD');
                var hzds = data.getCurveData('HRZDISP');

                //decimat data before a depth
                var decimate_index = 0;
                if (DECIMATE) {
                    var dpths = data.getCurveData('MD');
                    for (var i = 0; i < dpths.length; ++i) {
                        if (dpths[i] < DECIMATE_VALUE) {
                            decimate_index = i;
                            continue;
                        }
                        ++decimate_index;
                        break;
                    }
                    depths = depths.slice(decimate_index, depths.length);
                    tvds = tvds.slice(decimate_index, tvds.length);
                    hzds = hzds.slice(decimate_index, hzds.length);
                }

                var log, logData = null, multiLogData, logVisual, min, max, info, unit;

                ['TVD'].forEach(function (mnemonic, index) {
                    log = data.getCurveData(mnemonic);
                    if (DECIMATE) {
                        log = log.slice(decimate_index, log.length);
                    }
                    info = data.getCurveInfo(mnemonic);
                    unit = info != null ? info.getUnit() : null;
                    multiLogData = new ExplorationDemo.data.MultiLogData({
                        'mds': depths,
                        'tvds': tvds,
                        'hzds': hzds,
                        'values': log,
                        'name': mnemonic
                    });

                    widget.addMultiLogDataReference(multiLogData);
                    logData = multiLogData.getSpecificLogData(widget.getDomain());

                    if (unit != null) {
                        multiLogData.setValueUnit(unit);
                    }

                    logVisual = new geotoolkit.welllog.CompositeLogCurve(logData, true);
                    logVisual.setLineStyle(new geotoolkit.attributes.LineStyle({
                        'color': TRAJECTORY_CURVE_COLOR,
                        'width': 4,
                        'pattern': geotoolkit.attributes.LineStyle.Patterns.Solid
                    }));

                    if (mnemonic === 'TVD') {
                        //need to flip min and max values
                        logVisual.setNormalizationLimits(HORIZONTAL_NORMALIZED_MAX, HORIZONTAL_NORMALIZED_MIN);
                    }

                    track.addChild(logVisual);
                });

                if (logData == null) {
                    return;
                }

                min = logData.getMinDepth();
                max = logData.getMaxDepth();
                widget.setDepthLimits(min, max);

                $(EXPLORATION_ID).trigger('data-loaded');//TODO improve this

                //update 3d section
                if (instance._3dplot) {
                    var posX = data.getCurveData('X'),
                        posY = data.getCurveData('Y'),
                        posZ = data.getCurveData('TVD');

                    var devX = data.getCurveData('DX');
                    var devY = data.getCurveData('DY');
                    var values = data.getCurveData('DLS');
                    var elevation = data.getCurveData('Z');

                    var surveyData = new ExplorationDemo.data.SurveyData({
                        'name': "WELLB-32",
                        'x': posX,
                        'y': posY,
                        'tvd': posZ,
                        'md': depths,
                        'deviation': {
                            'x': devX,
                            'y': devY,
                            'elevation': elevation
                        },
                        'value': values
                    });
                    instance.createWellTrajectory(surveyData);

                    var cursor = instance.create3DCursorTracking();
                    load3DTops(surveyData);
                    widget.getToolByName('cross-hair').addListener('onPositionChanged', instance.updateCrossHairCursor.bind({
                        widget: widget,
                        cursor: cursor,
                        surveydata: surveyData
                    }));
                }
            },
            error: onError
        });

        var loadTops = function () {
            $.ajax({
                'url': 'data/wellB-32/tops.las',
                'cache': true,
                success: function (raw) {
                    if (raw == null || widget == null) {
                        return;
                    }

                    var logParser = geotoolkit.welllog.data.las.LasParser.getParserInstance(raw);
                    var sections = logParser.buildSections();

                    var names = sections.map(function (el) {
                        return el.name;
                    });

                    var indexLAS = names.indexOf('LAS2');
                    if (indexLAS < 0) {
                        return;
                    }
                    var data = sections[indexLAS];

                    var depths = data.getCurveData('MD');
                    var tvds = data.getCurveData('TVD');
                    var hzds = data.getCurveData('HRZDISP');

                    //decimat data before a depth
                    var decimate_index = 0;
                    if (DECIMATE) {
                        var dpths = data.getCurveData('MD');
                        for (var i = 0; i < dpths.length; ++i) {
                            if (dpths[i] < DECIMATE_VALUE) {
                                decimate_index = i;
                                continue;
                            }
                            break;
                        }
                        depths = depths.slice(decimate_index, depths.length);
                        tvds = tvds.slice(decimate_index, tvds.length);
                        hzds = hzds.slice(decimate_index, hzds.length);
                    }

                    var log, logData, logVisual, multiLogData, prevLogVisual = null, curveFilling, info, unit;
                    var tops = ['TopA', 'TopB', 'TopC', 'TopD', 'TopE', 'TopF', 'TopG', 'TopH'];

                    tops.forEach(function (mnemonic, index, array) {
                        log = data.getCurveData(mnemonic);
                        if (DECIMATE) {
                            log = log.slice(decimate_index, log.length);
                        }
                        info = data.getCurveInfo(mnemonic);
                        unit = info != null ? info.getUnit() : null;
                        multiLogData = new ExplorationDemo.data.MultiLogData({
                            'mds': depths,
                            'tvds': tvds,
                            'hzds': hzds,
                            'values': log,
                            'name': mnemonic
                        });

                        widget.addMultiLogDataReference(multiLogData);
                        logData = multiLogData.getSpecificLogData(widget.getDomain());

                        if (unit != null) {
                            multiLogData.setValueUnit(unit);
                        }

                        logVisual = new geotoolkit.welllog.CompositeLogCurve(logData, true);
                        logVisual.setLineStyle(new geotoolkit.attributes.LineStyle({
                            'color': TOP_CURVE_COLORS[index],
                            'width': 1,
                            'pattern': geotoolkit.attributes.LineStyle.Patterns.Solid
                        }));

                        logVisual.setNormalizationLimits(HORIZONTAL_NORMALIZED_MAX, HORIZONTAL_NORMALIZED_MIN);

                        if (prevLogVisual != null) {
                            curveFilling = new geotoolkit.welllog.LogFill({
                                'curve1': prevLogVisual,
                                'curve2': logVisual,
                                'fillstyle': new geotoolkit.attributes.FillStyle(TOP_CURVE_FILLING[index - 1])
                            });
                            track.insertChild(indexToInsert, curveFilling);

                            if (index === array.length - 1) {
                                curveFilling = new geotoolkit.welllog.LogFill({
                                    'curve1': logVisual,
                                    'curve2': new geotoolkit.welllog.LogReferenceLine(0),
                                    'fillstyle': new geotoolkit.attributes.FillStyle(TOP_CURVE_FILLING[index])
                                });
                                track.insertChild(indexToInsert, curveFilling);
                            }
                        }

                        track.insertChild(indexToInsert, logVisual);

                        prevLogVisual = logVisual;
                    });

                    $(EXPLORATION_ID).trigger('data-loaded');//TODO improve this
                },
                error: onError
            });
        };

        var load3DTops = function (surveyData) {
            $.ajax({
                'url': 'data/wellB-32/tops.json',
                'cache': true,
                success: function (raw) {
                    if (raw == null) {
                        return;
                    }
                    if (!instance._3dplot || surveyData == null) {
                        return;
                    }
                    surveyData.addTops(raw);
                    instance.add3DTopsToTrajectory(surveyData);
                },
                error: onError
            });
        };

        function onError(error) {
            throw 'error : ' + error;
        }
    };

    View.prototype.createHorizontalWidget = function () {
        var $parent = $('#horizontal-container');
        var canvas = document.createElement('canvas');
        var width = 400;
        var height = 400;

        $parent.append(canvas);
        canvas.width = width;
        canvas.height = height;

        var widget = new ExplorationDemo.widgets.HorizontalLogWidget();

        var plot = new geotoolkit.plot.Plot({
            'canvasElement': canvas,
            'root': new geotoolkit.scene.Group()
                .setAutoModelLimitsMode(true)
                .setLayout(new geotoolkit.layout.CssLayout())
                .addChild(widget),
            'autoSize': false,
            'autoUpdate': true,
            'autoRootBounds': true
        });

        var toolContainer = new geotoolkit.controls.tools.ToolsContainer(plot).add(widget.getTool());

        widget.initializeComponent();
        widget.setOrientation(geotoolkit.util.Orientation.Horizontal);

        $(window).bind('resize', resizeHorizontalWidget);
        function resizeHorizontalWidget() {
            var $el = $('#horizontal-container');
            var width = +$el.width();
            var height = +$el.height();

            var offset = $el.find('canvas').offset();
            if (offset.top === 0 && offset.left === 0) {
                //element not visible on screen
                return;
            }

            if (width === plot.getCanvasWidth() && height === plot.getCanvasHeight()) {
                return;
            }

            plot.setSize(width, height);
            widget.setBounds(new geotoolkit.util.Rect(0, 0, width, height));
            widget.updateWidgetLayout();
        }

        this._hWidget = widget;

        createToolsForHorizontalWidget(widget, 'horizontal-widget-tool-', $parent);
        function createToolsForHorizontalWidget(widget, stringId, $toolElement) {
            $toolElement.find('div.icon-spin.widget-settings-icon').on('click', function (event) {
                $(this).parent().toggleClass('collapsed');
                event.stopPropagation();
            });
            $toolElement.on('click', function () {
                //auto collapse when click outside
                var $el = $(this).find('.toolbox');
                $el.addClass('collapsed');
            });

            var id = _.uniqueId(stringId);
            var html = _.template(ZOOM_IN_TOOL)({'id': id});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id).on('click', function (event) {
                widget.zoomIn();
                event.stopPropagation();
            });

            id = _.uniqueId(stringId);
            html = _.template(ZOOM_OUT_TOOL)({'id': id});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id).on('click', function (event) {
                widget.zoomOut();
                event.stopPropagation();
            });

            id = _.uniqueId(stringId);
            html = _.template(FIT_TO_BOUNDS_ZOOM_TOOL)({'id': id});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id).on('click', function (event) {
                fitToWidthHorizontalWidget(widget);
                event.stopPropagation();
            });


            //Custom RubberBand Tool
            var customRubberBand = widget.getToolByName('rubberband-custom');
            var rubberbandTool = widget.getToolByName('rubberband');
            var panTool = widget.getToolByName('trackPanning');

            id = _.uniqueId(stringId);
            html = _.template(RUBBERBAND_TOOL)({'id': id, 'isRotated': false});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id).on('click', function (event) {
                if (!rubberbandTool.isEnabled()) {
                    $(this).addClass('active');
                    rubberbandTool.setEnabled(true);
                    rubberbandTool.setMode(geotoolkit.controls.tools.RubberBand.Mode.Vertical);

                    customRubberBand.setEnabled(false);
                } else {
                    $(this).removeClass('active');
                    rubberbandTool.setEnabled(false);
                    event.stopPropagation();
                }
            });

            var rubberbandId = '#' + id;
            rubberbandTool.addListener('onStateChanged', function () {
                if (!rubberbandTool.isEnabled()) {
                    $(rubberbandId).removeClass('active');
                }
            });

            id = _.uniqueId(stringId);
            html = _.template(RUBBERBAND_TOOL)({'id': id, 'isRotated': true});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id).on('click', function (event) {
                if (!customRubberBand.isEnabled()) {
                    $(this).addClass('active');
                    customRubberBand.setEnabled(true);
                    customRubberBand.setMode(geotoolkit.controls.tools.RubberBand.Mode.Horizontal);

                    rubberbandTool.setEnabled(false);
                } else {
                    $(this).removeClass('active');
                    customRubberBand.setEnabled(false);
                    event.stopPropagation();
                }
            });

            var customRubberBandId = '#' + id;
            customRubberBand.addListener('onStateChanged', function () {
                if (!customRubberBand.isEnabled()) {
                    $(customRubberBandId).removeClass('active');
                }
            });

            id = _.uniqueId(stringId);
            html = _.template(SHOW_HIDE_HEADER)({'id': id});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id).on('click', function (event) {
                var $el = $(this);
                $el.toggleClass('active');
                var checked = $el.hasClass('active');

                var trackControlGroup = geotoolkit.selection.from(widget).where(function (nd) {
                    return nd.getName() === "TrackControlGroup";
                }).selectFirst();
                var headerControlGroup = geotoolkit.selection.from(widget).where(function (nd) {
                    return nd.getName() === "HeaderControlGroup";
                }).selectFirst();

                if (widget.previousHeaderHeight == null || !checked) {
                    widget.previousHeaderHeight = headerControlGroup.getBounds().getHeight();
                }

                var height = checked ? widget.previousHeaderHeight : 0;
                trackControlGroup.setLayoutStyle({'left': '0', 'bottom': '0', 'right': '0', 'top': height});
                headerControlGroup.setLayoutStyle({'left': '0', 'height': height, 'right': '0', 'top': '0'});

                widget.updateLayout();
                widget.getToolByName('horizontal-splitter').setPlots([headerControlGroup, trackControlGroup]);
                widget.invalidate();
                event.stopPropagation();
            });

            id = _.uniqueId(stringId);
            html = _.template(DOMAINE_TOOL)({'id': id, 'mode': 'horizontal'});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id + '-md').on('click', onDomainClick);
            $toolElement.find('#' + id + '-hzd').on('click', onDomainClick);

            function onDomainClick(event) {
                var value = $(this).find('span').html();
                $(this).parent().find('div.domain-tool').removeClass('active');
                $(this).toggleClass('active');
                switch (value) {
                    default:
                    case 'MD' :
                        widget.setDomain('MD');
                        break;
                    case 'HZD' :
                        widget.setDomain('HZD');
                        break;
                }
                event.stopPropagation();
            }
        }

        //if (!WEPDemos.utils.isMobileDevice()) {
        createExpandButtonForHorizontalWidget(this, 'horizontal-widget-expand-', $parent, resizeHorizontalWidget);
        //}
        function createExpandButtonForHorizontalWidget(instance, stringId, $toolElement, resize) {
            var isMobile = instance._isMobileDevice;
            //EXPAND button
            var id = _.uniqueId(stringId);
            var html = _.template(EXPAND_WIDGET_TOOL)({'id': id});
            $toolElement.find('.toolbox').prepend(html);
            var $expandElement = $toolElement.find('#' + id);

            //RESET EXPAND button
            id = _.uniqueId(stringId);
            html = _.template(RESET_EXPAND_WIDGET_TOOL)({'id': id});
            $toolElement.find('.toolbox').prepend(html);
            var $resetExpandElement = $toolElement.find('#' + id);

            $expandElement.on('click', function () {
                var $el = $(this);
                var $i = $el.find('i');
                var $widget = $toolElement.parent();
                var $bottomContainer = $('.bottom-horizontal-row');

                var $widgetWrapper = $widget.parent();
                var $rightPanelWrapper = $widgetWrapper.parent();

                if ($i.hasClass('glyphicon-resize-small')) {
                    $widget.removeClass('widget-full-screen');
                    $rightPanelWrapper.removeClass('widget-full-screen');

                    $i.removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');

                    $resetExpandElement.hide();
                    $bottomContainer.show();
                    $(window).trigger('resize');
                    return;
                }

                if (isMobile || $i.hasClass('large-size')) {

                    $widgetWrapper.removeClass('large-size');
                    $i.removeClass('large-size').addClass('small-size');

                    $widget.addClass('widget-full-screen');
                    $rightPanelWrapper.addClass('widget-full-screen');

                    $i.addClass('glyphicon-resize-small').removeClass('glyphicon-resize-full');

                    $resetExpandElement.hide();
                    $bottomContainer.hide();
                } else if ($i.hasClass('small-size')) {

                    $widgetWrapper.addClass('large-size');
                    $i.addClass('large-size').removeClass('small-size');

                    $resetExpandElement.show();
                    $bottomContainer.hide();
                }

                resize();
            });

            $toolElement.find('#' + id).on('click', function () {
                var $el = $(this);
                var $i = $el.find('i');
                var $expandIElement = $expandElement.find('i');
                var $bottomContainer = $('.bottom-horizontal-row');

                var $widget = $toolElement.parent();
                var $second = $('.second-container');
                var $row = $('.top-horizontal-row');

                $i.removeClass('large-size').addClass('small-size');

                $widget.removeClass('widget-full-screen');
                $second.removeClass('widget-full-screen');
                $row.removeClass('large-size');

                $expandIElement.removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');
                $expandIElement.removeClass('large-size').addClass('small-size');

                $el.hide();
                $bottomContainer.show();
                $(window).trigger('resize');
            });
        }
    };

    View.prototype.createVerticalWidget = function () {
        var $parent = $('#vertical-container');
        var canvas = document.createElement('canvas');
        var width = 400;
        var height = 400;

        $parent.append(canvas);
        canvas.width = width;
        canvas.height = height;

        var widget = new ExplorationDemo.widgets.VerticalLogWidget();

        var plot = new geotoolkit.plot.Plot({
            'canvasElement': canvas,
            'root': new geotoolkit.scene.Group()
                .setAutoModelLimitsMode(true)
                .setLayout(new geotoolkit.layout.CssLayout())
                .addChild(widget),
            'autoSize': false,
            'autoUpdate': true,
            'autoRootBounds': true
        });

        var toolContainer = new geotoolkit.controls.tools.ToolsContainer(plot).add(widget.getTool());

        widget.initializeComponent();

        $(window).bind('resize', resizeVerticalWidget);
        function resizeVerticalWidget() {
            var $el = $('#vertical-container');
            var width = +$el.width();
            var height = +$el.height();

            var offset = $el.find('canvas').offset();
            if (offset.top === 0 && offset.left === 0) {
                //element not visible on screen
                return;
            }

            if (width === plot.getCanvasWidth() && height === plot.getCanvasHeight()) {
                return;
            }
            plot.setSize(width, height);
            widget.setBounds(new geotoolkit.util.Rect(0, 0, width, height));
            widget.updateWidgetLayout();
        }

        this._vWidget = widget;

        createToolsForVerticalWidget(widget, 'vertical-widget-tool-', $parent);
        function createToolsForVerticalWidget(widget, stringId, $toolElement) {
            $toolElement.find('div.icon-spin.widget-settings-icon').on('click', function (event) {
                $(this).parent().toggleClass('collapsed');
                event.stopPropagation();
            });
            $toolElement.on('click', function () {
                //auto collapse when click outside
                var $el = $(this).find('.toolbox');
                $el.addClass('collapsed');
            });

            var id = _.uniqueId(stringId);
            var html = _.template(ZOOM_IN_TOOL)({'id': id});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id).on('click', function (event) {
                widget.zoomIn();
                event.stopPropagation();
            });

            id = _.uniqueId(stringId);
            html = _.template(ZOOM_OUT_TOOL)({'id': id});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id).on('click', function (event) {
                widget.zoomOut();
                event.stopPropagation();
            });

            id = _.uniqueId(stringId);
            html = _.template(FIT_TO_BOUNDS_ZOOM_TOOL)({'id': id});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id).on('click', function (event) {
                var limits = widget.getDepthLimits();
                widget.setVisibleDepthLimits(limits.getLow(), limits.getHigh());
                event.stopPropagation();
            });

            var rubberbandTool = widget.getToolByName('rubberband');
            id = _.uniqueId(stringId);
            html = _.template(RUBBERBAND_TOOL)({'id': id, 'isRotated': true});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id).on('click', function (event) {
                if (!rubberbandTool.isEnabled()) {
                    $(this).addClass('active');
                    rubberbandTool.setEnabled(true);
                    rubberbandTool.setMode(geotoolkit.controls.tools.RubberBand.Mode.Vertical);
                } else {
                    $(this).removeClass('active');
                    rubberbandTool.setEnabled(false);
                    event.stopPropagation();
                }
            });

            var rubberbandId = '#' + id;
            rubberbandTool.addListener('onStateChanged', function () {
                if (!rubberbandTool.isEnabled()) {
                    $(rubberbandId).removeClass('active');
                }
            });

            id = _.uniqueId(stringId);
            html = _.template(SHOW_HIDE_HEADER)({'id': id});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id).on('click', function (event) {
                var $el = $(this);
                $el.toggleClass('active');
                var checked = $el.hasClass('active');

                var trackControlGroup = geotoolkit.selection.from(widget).where(function (nd) {
                    return nd.getName() === "TrackControlGroup";
                }).selectFirst();
                var headerControlGroup = geotoolkit.selection.from(widget).where(function (nd) {
                    return nd.getName() === "HeaderControlGroup";
                }).selectFirst();

                if (widget.previousHeaderHeight == null || !checked) {
                    widget.previousHeaderHeight = headerControlGroup.getBounds().getHeight();
                }

                var height = checked ? widget.previousHeaderHeight : 0;
                trackControlGroup.setLayoutStyle({'left': '0', 'bottom': '0', 'right': '0', 'top': height});
                headerControlGroup.setLayoutStyle({'left': '0', 'height': height, 'right': '0', 'top': '0'});

                widget.updateLayout();
                widget.getToolByName('horizontal-splitter').setPlots([headerControlGroup, trackControlGroup]);
                widget.invalidate();
                event.stopPropagation();
            });

            id = _.uniqueId(stringId);
            html = _.template(DOMAINE_TOOL)({'id': id, 'mode': 'vertical'});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id + '-md').on('click', onDomainClick);
            $toolElement.find('#' + id + '-tvd').on('click', onDomainClick);
            $toolElement.find('#' + id + '-hzd').on('click', onDomainClick);

            function onDomainClick(event) {
                var value = $(this).find('span').html();
                $(this).parent().find('div.domain-tool').removeClass('active');
                $(this).toggleClass('active');
                switch (value) {
                    default:
                    case 'MD' :
                        widget.setDomain('MD');
                        break;

                    case 'TVD' :
                        widget.setDomain('TVD');
                        break;
                    case 'HZD' :
                        widget.setDomain('HZD');
                        break;
                }
                event.stopPropagation();
            }
        }

        createExpandButtonForVerticalWidget(widget, 'vertical-widget-expand-', $parent, resizeVerticalWidget);
        function createExpandButtonForVerticalWidget(widget, stringId, $toolElement, resize) {
            var id = _.uniqueId(stringId);
            var html = _.template(EXPAND_WIDGET_TOOL)({'id': id});
            $toolElement.find('.toolbox').prepend(html);
            $toolElement.find('#' + id).on('click', function () {
                var $el = $(this);
                var $i = $el.find('i');
                var $widget = $toolElement.parent();
                var $container = $widget.parent();
                if ($i.hasClass('glyphicon-resize-full')) {
                    $widget.addClass('widget-full-screen');
                    $container.css('overflow', 'hidden');

                    $i.addClass('glyphicon-resize-small').removeClass('glyphicon-resize-full');
                } else {
                    $widget.removeClass('widget-full-screen');
                    $container.css('overflow', '');

                    $i.removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');
                }
                resize();
            });
        }
    };

    View.prototype.create3DWidget = function () {
        var $el = $('#3d-view-container');
        var width = $el.parent().width();
        var height = $el.parent().height();
        $el.width(width);
        $el.height(height);

        var plot = new geotoolkit3d.Plot({
            'container': document.getElementById('3d-view-container'),
            'camera': {
                'position': new THREE.Vector3(-1600, -1600, -1000),
                'lookat': new THREE.Vector3(0, 0, -1000)
            },
            'renderer': {
                'clearcolor': 'white'
            }
        });
        plot.setSize(width, height);

        var grid = new geotoolkit3d.scene.grid.Grid({
            'start': new THREE.Vector3(-400, -400, -1800),
            'end': new THREE.Vector3(400, 400, 0),
            'modelstart': new THREE.Vector3(-400, -400, 1800),
            'modelend': new THREE.Vector3(400, 400, 0),
            'grid': {
                'linestyles': {
                    'x': new geotoolkit.attributes.LineStyle({
                        'color': 'darkgrey',
                        'pattern': geotoolkit.attributes.LineStyle.Patterns.Dash
                    }),
                    'y': new geotoolkit.attributes.LineStyle({
                        'color': 'darkgrey',
                        'pattern': geotoolkit.attributes.LineStyle.Patterns.Dash
                    }),
                    'z': new geotoolkit.attributes.LineStyle({
                        'color': 'darkgrey',
                        'pattern': geotoolkit.attributes.LineStyle.Patterns.Dash
                    })
                }
            },
            'axis': {
                'linestyles': {
                    'x': new geotoolkit.attributes.LineStyle({
                        'color': 'black'
                    }),
                    'y': new geotoolkit.attributes.LineStyle({
                        'color': 'black'
                    }),
                    'z': new geotoolkit.attributes.LineStyle({
                        'color': 'black'
                    })
                },
                'textstyles': {
                    'x': new geotoolkit.attributes.TextStyle({
                        'color': 'black'
                    }),
                    'y': new geotoolkit.attributes.TextStyle({
                        'color': 'black'
                    }),
                    'z': new geotoolkit.attributes.TextStyle({
                        'color': 'black'
                    })
                },
                'formatters': {
                    'z': function (value) {
                        return (value).toFixed(1);
                    }
                }
            },
            'title': {
                'textstyles': {
                    'x': new geotoolkit.attributes.TextStyle({
                        'color': 'black'
                    }),
                    'y': new geotoolkit.attributes.TextStyle({
                        'color': 'black'
                    }),
                    'z': new geotoolkit.attributes.TextStyle({
                        'color': 'black'
                    })
                }
            }
        });

        plot.getRoot().add(grid);

        this._3dplot = plot;

        $(window).bind('resize', resizePlot3d);
        function resizePlot3d() {
            var dim = plot.getSize();
            var width = $el.parent().width();
            var height = $el.parent().height();

            if (dim.getWidth() !== width || dim.getHeight() !== height) {
                //resize component
                plot.setSize(width, height);
                $el.width(width);
                $el.height(height);
            }
        }

        createToolsFor3DView(this, 'widget-3d-tool-', $el);
        function createToolsFor3DView(instance, stringId, $toolElement) {
            $toolElement.find('div.icon-spin.widget-settings-icon').on('click', function (event) {
                $(this).parent().toggleClass('collapsed');
                event.stopPropagation();
            });
            $toolElement.on('click', function () {
                //auto collapse when click outside
                var $el = $(this).find('.toolbox');
                $el.addClass('collapsed');
            });

            var id = _.uniqueId(stringId);
            var html = _.template(CYLINDER_TOOL)({'id': id});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id).on('click', function () {
                var $el = $(this);
                $el.toggleClass('active');

                var checked = $el.hasClass('active');
                instance.display3dInTubeMode(checked);
            });
        }

        createExpandButtonFor3DWidget(this, 'widget-3d-expand-', $el, resizePlot3d);
        function createExpandButtonFor3DWidget(instance, stringId, $toolElement, resize) {
            var isMobile = instance._isMobileDevice;
            //EXPAND button
            var id = _.uniqueId(stringId);
            var html = _.template(EXPAND_WIDGET_TOOL)({'id': id});
            $toolElement.find('.toolbox').prepend(html);
            var $expandElement = $toolElement.find('#' + id);

            //RESET EXPAND button
            id = _.uniqueId(stringId);
            html = _.template(RESET_EXPAND_WIDGET_TOOL)({'id': id});
            $toolElement.find('.toolbox').prepend(html);
            var $resetExpandElement = $toolElement.find('#' + id);

            $expandElement.on('click', function () {
                var $el = $(this);
                var $i = $el.find('i');

                var $widget = $toolElement.parent();
                var $map = $('.google-map-div-container');
                var $hWidget = $('.top-horizontal-row');
                var $vWidget = $('#vertical-container').parent();

                var $widgetWrapper = $widget.parent();
                var $parentWrapper = $widgetWrapper.parent();
                var $rightPanelWrapper = $parentWrapper.parent();

                if ($i.hasClass('glyphicon-resize-small')) {
                    // RESET EXPAND TO INITIAL POSITION
                    $widget.removeClass('widget-full-screen');
                    $rightPanelWrapper.removeClass('widget-full-screen');
                    $widgetWrapper.removeClass('widget-full-screen');

                    $i.removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');

                    $resetExpandElement.hide();
                    $vWidget.show();
                    $map.show();
                    $hWidget.show();
                    $(window).trigger('resize');
                    return;
                }

                if (isMobile || $i.hasClass('large-size')) {
                    //MAIN PANEL FULL
                    $i.removeClass('large-size').addClass('small-size');
                    $widgetWrapper.removeClass('large-size');
                    $parentWrapper.removeClass('large-size');

                    $resetExpandElement.hide();
                    $vWidget.hide();

                    $widget.addClass('widget-full-screen');
                    $rightPanelWrapper.addClass('widget-full-screen');
                    $widgetWrapper.addClass('widget-full-screen');

                    $i.addClass('glyphicon-resize-small').removeClass('glyphicon-resize-full');

                } else if ($i.hasClass('small-size')) {

                    //BOTTOM PANEL FULL
                    $i.addClass('medium-size').removeClass('small-size');
                    $widgetWrapper.addClass('medium-size');

                    $resetExpandElement.show();
                    $vWidget.show();
                    $map.hide();
                } else if ($i.hasClass('medium-size')) {

                    //RIGHT PANEL FULL
                    $i.removeClass('medium-size').addClass('large-size');
                    $widgetWrapper.removeClass('medium-size').addClass('large-size');
                    $parentWrapper.addClass('large-size');

                    $resetExpandElement.show();
                    $vWidget.show();
                    $map.hide();
                    $hWidget.hide();
                }
                resize();
            });


            $resetExpandElement.on('click', function () {
                var $el = $(this);
                var $i = $el.find('i');
                var $resetIElement = $expandElement.find('i');

                var $widget = $toolElement.parent();
                var $map = $('.google-map-div-container');
                var $hWidget = $('.top-horizontal-row');

                var $widgetWrapper = $widget.parent();
                var $parentWrapper = $widgetWrapper.parent();
                var $rightPanelWrapper = $parentWrapper.parent();

                $widget.removeClass('widget-full-screen');
                $rightPanelWrapper.removeClass('widget-full-screen');
                $widgetWrapper.removeClass('widget-full-screen');

                $widgetWrapper.removeClass('large-size').removeClass('medium-size').addClass('small-size');
                $parentWrapper.removeClass('large-size').removeClass('medium-size').addClass('small-size');
                $resetIElement.removeClass('large-size').removeClass('medium-size').addClass('small-size');

                $resetIElement.removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');
                $map.show();
                $hWidget.show();
                $el.hide();
                $(window).trigger('resize');
            });
        }
    };

    View.prototype.createWebGLWarning = function () {
        var $el = $('#3d-view-container');
        var html = _.template(TEMPLATE_WARNING_WEBGL)();
        $el.append(html);
    };

    View.prototype.update3dGridBounds = function () {
        var me = this;
        if (!me._3dplot) {
            return;
        }
        var root = me._3dplot.getRoot();

        var start = new THREE.Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        var end = new THREE.Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
        var init = new THREE.Box3(start, end);

        var grid = null, tmp = null;
        root.traverse(function (element) {
            if (element == null) {
                return;
            }
            if (element instanceof THREE.Scene) {
                return;
            }
            if (element instanceof geotoolkit3d.scene.grid.Grid) {
                grid = element;
                return;
            }
            if (element.geometry && element.geometry instanceof geotoolkit3d.scene.well.LineGeometry) {
                element.geometry.computeBoundingBox();
                tmp = new THREE.Box3(
                    element.localToWorld(element.geometry.boundingBox.min.clone()),
                    element.localToWorld(element.geometry.boundingBox.max.clone())
                );

                init.union(tmp);
            }
        });

        if (tmp == null) return;

        //make box looks like a cube
        var size = init.getSize();
        var diffX = 0, diffY = 0, diffZ = 0;
        if (size.x > size.y) {
            diffY = size.x - size.y;
            diffX = diffY / 2;
            diffZ = diffY / 10;
            init.expandByVector(new THREE.Vector3(diffX, diffY, diffZ));
        } else {
            diffX = size.y - size.x;
            diffY = diffX / 2;
            diffZ = diffX / 10;
            init.expandByVector(new THREE.Vector3(diffX, diffY, diffZ));
        }

        if (grid != null) {
            grid.setOptions({
                'start': init.min.clone(),
                'end': init.max.clone(),
                'modelstart': init.min.clone().setZ(-init.min.z),
                'modelend': init.max.clone().setZ(-init.max.z)
            });
        }

        me._3dplot.setOptions({
            'modellimits': new THREE.Box3(
                init.min.clone(),
                init.max.clone()
            )
        });

        var direction = me._3dplot.getCameraDirection();
        var offset = direction.setLength(init.min.clone().distanceTo(init.max.clone()) / 15);
        //set camera location
        me._3dplot.setCameraLocation(init.min.clone().sub(offset).setZ(init.min.z / 10));
        //look at the middle.
        me._3dplot.setCameraLookAt(new THREE.Vector3(
            (init.min.x + init.max.x) / 2,
            (init.min.y + init.max.y) / 2,
            (init.min.z + init.max.z) / 2
        ));
    };

    View.prototype.createGoogleMapWidget = function () {
        var me = this;
        var mapOptions = {
            'zoom': DEFAULT_MAP_ZOOM,
            'center': new google['maps']['LatLng'](DEFAULT_MAP_CENTER_LAT, DEFAULT_MAP_CENTER_LNG),
            'mapTypeId': google['maps']['MapTypeId']['ROADMAP'],
            'disableDefaultUI': true,
            'mapTypeControl': false,
            'streetViewControl': false
        };

        me._map = new google['maps']['Map'](document.getElementById('google-map-view-container'), mapOptions);
        $('#google-map-view-container').data('map', me._map);
        me._map['markers'] = [];
        me._map['polylines'] = [];

        $(window).bind('resize', resizeGoogleMap);
        var map = me._map;

        function resizeGoogleMap() {
            google['maps']['event']['trigger'](map, "resize");
        }

        var $el = $('.google-map-div-container');

        createToolsForGoogleMap('google-map-tool-', $el);
        function createToolsForGoogleMap(stringId, $toolElement) {
            $toolElement.find('div.icon-spin.widget-settings-icon').on('click', function (event) {
                $(this).parent().toggleClass('collapsed');
                event.stopPropagation();
            });
            $toolElement.on('click', function () {
                //auto collapse when click outside
                var $el = $(this).find('.toolbox');
                $el.addClass('collapsed');
            });

            var id = _.uniqueId(stringId);
            var html = _.template(ZOOM_IN_TOOL)({'id': id});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id).on('click', function (event) {
                map['panTo'](new google['maps']['LatLng'](DEFAULT_MAP_CENTER_LAT, DEFAULT_MAP_CENTER_LNG));

                function smoothZoom(map, max, cnt) {
                    if (cnt >= max) {
                        return;
                    }
                    else {
                        var zoomchanged = google['maps']['event']['addListener'](map, 'zoom_changed', function (event) {
                            google['maps']['event']['removeListener'](zoomchanged);
                            smoothZoom(map, max, cnt + 1);
                        });
                        setTimeout(function () {
                            map['setZoom'](cnt);
                        }, ZOOM_SPEED);
                    }
                }

                smoothZoom(map, WELL_MAP_ZOOM, map['getZoom']());
                event.stopPropagation();
            });

            id = _.uniqueId(stringId);
            html = _.template(FIT_TO_BOUNDS_ZOOM_TOOL)({'id': id});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id).on('click', function (event) {
                map['panTo'](new google['maps']['LatLng'](DEFAULT_MAP_CENTER_LAT, DEFAULT_MAP_CENTER_LNG));

                function smoothZoom(map, min, cnt) {
                    if (cnt <= min) {
                        return;
                    }
                    else {
                        var zoomchanged = google['maps']['event']['addListener'](map, 'zoom_changed', function (event) {
                            google['maps']['event']['removeListener'](zoomchanged);
                            smoothZoom(map, min, cnt - 1);
                        });
                        setTimeout(function () {
                            map['setZoom'](cnt);
                        }, ZOOM_SPEED);
                    }
                }

                smoothZoom(map, DEFAULT_MAP_ZOOM, map['getZoom']());
                event.stopPropagation();
            });


            id = _.uniqueId(stringId);
            html = _.template(CENTER_MAP_TOOL)({'id': id});
            $toolElement.find('.toolbox-content').append(html);
            $toolElement.find('#' + id).on('click', function (event) {
                map['panTo'](new google['maps']['LatLng'](DEFAULT_MAP_CENTER_LAT, DEFAULT_MAP_CENTER_LNG));
                event.stopPropagation();
            });
        }

        createExpandButtonForGoogleMap(this, 'widget-map-expand-', $el, resizeGoogleMap);
        function createExpandButtonForGoogleMap(instance, stringId, $toolElement, resize) {
            var isMobile = instance._isMobileDevice;
            //EXPAND button
            var id = _.uniqueId(stringId);
            var html = _.template(EXPAND_WIDGET_TOOL)({'id': id});
            $toolElement.find('.toolbox').prepend(html);
            var $expandElement = $toolElement.find('#' + id);

            //RESET EXPAND button
            id = _.uniqueId(stringId);
            html = _.template(RESET_EXPAND_WIDGET_TOOL)({'id': id});
            $toolElement.find('.toolbox').prepend(html);
            var $resetExpandElement = $toolElement.find('#' + id);

            $expandElement.on('click', function () {
                var $el = $(this);
                var $i = $el.find('i');

                var $widget = $toolElement;
                var $3d = $('.dynamic-view-3d-layout');
                var $hWidget = $('.top-horizontal-row');
                var $vWidget = $('#vertical-container').parent();

                var $widgetWrapper = $widget.parent();
                var $parentWrapper = $widgetWrapper.parent();
                var $rightPanelWrapper = $parentWrapper.parent();

                if ($i.hasClass('glyphicon-resize-small')) {
                    //RESET EXPAND TO INITIAL POSITION
                    $widget.removeClass('widget-full-screen');
                    $parentWrapper.removeClass('widget-full-screen');
                    $widgetWrapper.removeClass('widget-full-screen');
                    $rightPanelWrapper.removeClass('widget-full-screen');

                    $widget.removeClass('large-size').removeClass('medium-size').addClass('small-size');
                    $widgetWrapper.removeClass('large-size').removeClass('medium-size').addClass('small-size');

                    $i.removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');

                    $resetExpandElement.hide();
                    $vWidget.show();
                    $3d.show();
                    $hWidget.show();

                    $(window).trigger('resize');
                    map['panTo'](new google['maps']['LatLng'](DEFAULT_MAP_CENTER_LAT, DEFAULT_MAP_CENTER_LNG));
                    return;
                }

                if (isMobile || $i.hasClass('large-size')) {
                    //MAIN PANEL FULL
                    $i.removeClass('large-size').addClass('small-size');

                    $widget.addClass('widget-full-screen');
                    $widgetWrapper.addClass('widget-full-screen');
                    $parentWrapper.addClass('widget-full-screen');
                    $rightPanelWrapper.addClass('widget-full-screen');

                    $i.addClass('glyphicon-resize-small').removeClass('glyphicon-resize-full');

                    $resetExpandElement.hide();
                    $vWidget.hide();

                } else if ($i.hasClass('small-size')) {
                    //BOTTOM PANEL FULL
                    $i.addClass('medium-size').removeClass('small-size');

                    $widget.addClass('medium-size');
                    $widgetWrapper.addClass('medium-size');

                    $resetExpandElement.show();
                    $vWidget.show();
                    $3d.hide();
                }
                else if ($i.hasClass('medium-size')) {

                    //RIGHT PANEL FULL
                    $i.removeClass('medium-size').addClass('large-size');

                    $widget.removeClass('medium-size').addClass('large-size');
                    $widgetWrapper.addClass('large-size');

                    $resetExpandElement.show();
                    $vWidget.show();
                    $3d.hide();
                    $hWidget.hide();
                }

                resize();
                map['panTo'](new google['maps']['LatLng'](DEFAULT_MAP_CENTER_LAT, DEFAULT_MAP_CENTER_LNG));
            });

            $resetExpandElement.on('click', function () {
                var $resetIElement = $expandElement.find('i');
                var $widget = $toolElement;
                var $3d = $('.dynamic-view-3d-layout');
                var $hWidget = $('.top-horizontal-row');
                var $vWidget = $('#vertical-container').parent();

                var $widgetWrapper = $widget.parent();
                var $parentWrapper = $widgetWrapper.parent();
                var $rightPanelWrapper = $parentWrapper.parent();

                $widget.removeClass('widget-full-screen');
                $parentWrapper.removeClass('widget-full-screen');
                $widgetWrapper.removeClass('widget-full-screen');
                $rightPanelWrapper.removeClass('widget-full-screen');

                $resetIElement.removeClass('large-size').removeClass('medium-size').addClass('small-size');
                $widget.removeClass('large-size').removeClass('medium-size').addClass('small-size');
                $widgetWrapper.removeClass('large-size').removeClass('medium-size').addClass('small-size');
                $parentWrapper.removeClass('large-size').removeClass('medium-size').addClass('small-size');
                $rightPanelWrapper.removeClass('large-size').removeClass('medium-size').addClass('small-size');

                $resetIElement.removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');

                $resetExpandElement.hide();
                $vWidget.show();
                $3d.show();
                $hWidget.show();

                $(window).trigger('resize');
                map['panTo'](new google['maps']['LatLng'](DEFAULT_MAP_CENTER_LAT, DEFAULT_MAP_CENTER_LNG));
            });

        }
    };

    View.prototype.loadGoogleMapData = function () {
        var instance = this;

        $.ajax({
            'url': 'data/fieldB.json',
            'cache': true,
            success: function (raw) {
                if (raw == null) {
                    return;
                }

                var verticalWell = raw[0]['Platform B Production']['wells'][0]['path'];
                instance.createMapViewMarker(verticalWell);

                var horizontalWell = raw[0]['Platform B Production']['wells'][1]['path'];
                instance.createMapViewMarker(horizontalWell);
            },
            error: function onError(error) {
                throw 'error : ' + error;
            }
        });
    };

    View.prototype.getHtml = function () {
        return this.$el;
    };

    View.prototype.createWellTrajectory = function (data) {
        var me = this;
        var wellPosition = data.getWellPosition();
        var wellName = data.getName();

        var deviation = data.getDeviation();
        var values = data.getValues();

        var geometry = new geotoolkit3d.scene.well.LineGeometry({
            'data': {
                'x': deviation['x'],
                'y': deviation['y'],
                'z': deviation['z']
            }
        });
        var material = new THREE.LineBasicMaterial({
            color: WELL_TRAJECTORY_COLOR
        });

        var lineTraj = new THREE.Line(geometry, material);
        lineTraj.position.copy(wellPosition);
        lineTraj.__surveydata__ = data;

        var curve2DMaterial = new geotoolkit3d.scene.well.LogCurve2DMaterial({
            'data': {
                'x': deviation['x'],
                'y': deviation['y'],
                'z': deviation['z'],
                'values': values
            },
            'color': new THREE.Color(WELL_LOG_COLOR),
            'radius': CURVE_OFFSET
        });
        var curve2d = new THREE.Line(geometry.clone(), curve2DMaterial);
        curve2d.position.set(wellPosition.x, wellPosition.y, wellPosition.z);

        var logFill = new geotoolkit3d.scene.well.LogFill2D({
            'data': {
                'x': deviation['x'],
                'y': deviation['y'],
                'z': deviation['z'],
                'values1': values
            },
            'colorprovider': new THREE.Color(WELL_LOG_FILL_COLOR),
            'radius': CURVE_OFFSET
        });
        logFill.position.set(wellPosition.x, wellPosition.y, wellPosition.z);

        var wellAnnot = new geotoolkit3d.scene.AnnotationBase({
            'title': wellName,
            'titlestyle': WELL_NAME_ANNOTATION_TEXT_STYLE,
            'linestyle': new geotoolkit.attributes.LineStyle({
                'color': 'white'
            })
        });

        var position = geometry.attributes.position;
        var anchorPoint = new THREE.Vector3(position.getX(position.count - 1), position.getY(position.count - 1), position.getZ(position.count - 1));
        wellAnnot.setAnchorPoint(anchorPoint);
        wellAnnot.position.set(wellPosition['x'], wellPosition['y'], wellPosition['z']);

        //create Tube Object but hide it
        geometry = new geotoolkit3d.scene.well.TubeGeometry({
            'data': {
                'x': deviation['x'],
                'y': deviation['y'],
                'z': deviation['z']
            },
            'radiusmax': 20
        });
        material = new THREE.MeshLambertMaterial({
            color: WELL_TRAJECTORY_COLOR,
            opacity: 1,
            side: THREE.FrontSide,
            transparent: false
        });

        var tubeTraj = new THREE.Mesh(geometry, material);
        tubeTraj.position.copy(wellPosition);
        tubeTraj.__surveydata__ = data;
        tubeTraj.visible = false;

        //add new trajectory to the 3dview
        me._3dplot.getRoot().add(wellAnnot);
        me._3dplot.getRoot().add(curve2d);
        me._3dplot.getRoot().add(logFill);
        me._3dplot.getRoot().add(lineTraj);
        me._3dplot.getRoot().add(tubeTraj);

        me.update3dGridBounds();
    };

    View.prototype.createMapViewMarker = function (well) {
        var WELL_ICON = buildMarkerObject('images/pin_well.png', 64, 64, 32, 32);

        var WELL_SHAPE = {
            'coords': [0, 0, 0, 30, 30, 30, 30, 0],
            'type': 'poly'
        };

        var points = well.map(function (pt) {
            return getLatLng(pt);
        });

        var marker = new google['maps']['Marker']({
            'position': getLatLng(well[0]),
            'map': this._map,
            'icon': WELL_ICON,
            'anchorPoint': new google['maps']['Point'](0, -15),
            'shape': WELL_SHAPE,
            'zIndex': 3
        });

        var polyline = new google['maps']['Polyline']({
            'path': points,
            'map': this._map,
            'geodesic': true,
            'strokeColor': POLYLINE_COLOR,
            'strokeOpacity': POLYLINE_OPACITY,
            'strokeWeight': POLYLINE_LINE_WIDTH
        });

        function getLatLng(data) {
            var pos = data.split(',');
            return new google['maps']['LatLng'](pos[0], pos[1]);
        }

        function buildMarkerObject(url, sizex, sizey, scalex, scaley) {
            return {
                'url': url,
                'size': new google['maps']['Size'](sizex, sizey),
                'scaledSize': new google['maps']['Size'](scalex, scaley),
                'anchor': new google['maps']['Point'](scalex / 2, scaley)
            };
        }
    };

    View.prototype.add3DTopsToTrajectory = function (data) {
        var me = this;
        var wellPosition = data.getWellPosition();
        var tops = data.getTops();

        var annot, sphere, name, color, pt1, pt2;
        tops.forEach(function (top, index) {
            name = top['name'];
            color = TOP_CURVE_COLORS[index];
            pt1 = data.getPointAtMD(top['MD'], true);
            pt2 = data.getNextPointAtMD(top['MD'], true);

            sphere = new geotoolkit3d.scene.well.schematic.Sphere({
                'data': {
                    'x': [pt1.x, (pt1.x + pt2.x) / 2],
                    'y': [pt1.y, (pt1.y + pt2.y) / 2],
                    'z': [pt1.z, (pt1.z + pt2.z) / 2]
                },
                'radius': TOP_ANNOTATION_RADIUS,
                'fillstyle': new geotoolkit.attributes.FillStyle(color)
            });
            sphere.position.copy(wellPosition);

            annot = new geotoolkit3d.scene.AnnotationBase({
                'title': name,
                'titlestyle': TOP_ANNOTATION_TEXT_STYLE.setColor(color),
                'linestyle': new geotoolkit.attributes.LineStyle(color, 1),
                'mode': geotoolkit3d.scene.AnnotationBase.Mode.center
            });

            sphere.setAnnotation(annot);

            me._3dplot.getRoot().add(sphere);
        });
    };

    View.prototype.display3dInTubeMode = function (isTube) {
        if (this._3dplot == null) {
            return;
        }

        this._3dplot.getRoot().traverse(function (node) {
            if (node == null) {
                return;
            }
            if (node.geometry instanceof geotoolkit3d.scene.well.LineGeometry) {
                node.visible = !isTube;
                node.invalidateObject();
            }
            if (node instanceof geotoolkit3d.scene.well.schematic.Sphere) {
                node.visible = !isTube;
                node.invalidateObject();
            }
            if (node.geometry instanceof geotoolkit3d.scene.well.TubeGeometry) {
                node.visible = isTube;
                node.invalidateObject();
            }
        });

    };

    View.prototype.create3DCursorTracking = function () {
        var location = new THREE.Vector3(0, 0, 0);
        var geometry = new geotoolkit3d.scene.ellipse.FilledEllipseGeometry();
        var cursorFill = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
            color: CURSOR_TRACKING_COLOR,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.60
        }));
        cursorFill.position.copy(location);
        cursorFill.rotation.set(0, 0, 0);
        cursorFill.scale.set(CURSOR_DIMENSION, CURSOR_DIMENSION, 1);

        var geo = new geotoolkit3d.scene.ellipse.EllipseGeometry();
        var cursorLine = new THREE.Line(geo, new THREE.LineBasicMaterial({
            color: CURSOR_TRACKING_COLOR
        }));
        cursorLine.position.copy(location);
        cursorLine.rotation.set(0, 0, 0);
        cursorLine.scale.set(CURSOR_DIMENSION, CURSOR_DIMENSION, 1);

        cursorFill.visible = false;
        cursorLine.visible = false;

        this._3dplot.getRoot().add(cursorFill);
        this._3dplot.getRoot().add(cursorLine);

        return {
            filling: cursorFill,
            line: cursorLine
        };
    };

    View.prototype.updateCrossHairCursor = function (event) {
        var widget = this.widget;
        var surveyData = this.surveydata;
        var cursor = this.cursor;

        if (widget.getDomain() !== 'MD') {
            cursor.filling.visible = false;
            cursor.line.visible = false;
            return;
        }

        var md = event.getPosition().getY();
        var pt = surveyData.getPointAtMD(md);
        var lookat = surveyData.getNextPointAtMD(md);
        [
            cursor.filling, cursor.line
        ].forEach(function (element) {
                element.visible = true;
                element.position.copy(pt);
                element.lookAt(lookat);
                element.invalidateObject();
            });
    };

    function fitToWidthHorizontalWidget(widget) {
        //Fit To Height code for horizontal element.
        var limits = widget.getDepthLimits();
        widget.setVisibleDepthLimits(limits.getLow(), limits.getHigh());
        widget.resetNormalizationLimits(HORIZONTAL_NORMALIZED_MAX, HORIZONTAL_NORMALIZED_MIN);
    }

    return View;
})();
