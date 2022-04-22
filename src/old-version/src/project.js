/*
 * Copyright: Copyright (c) 2013 by INT, Inc.  All rights reserved.<br>
 * Company: INT, Inc. <br>
 * INT PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */
Window['App'] = ExplorationDemo.Application = (function () {

    var EXPLORATION_ID = '#exploration-tab';

    var TOTAL_COUNT = 6;//TODO improve this
    var SHORT_DELAY = 250;
    var LONG_DELAY = 500;

    var App = function () {
        this.initialize();
    };

    App.prototype.initialize = function () {
        this.createExplorationView();
    };

    App.prototype.createExplorationView = function () {
        //create exploration tab
        var $html = $(EXPLORATION_ID);
        var view = new ExplorationDemo.view.View();
        $html.append(view.getHtml());

        view.initialize();

        $('#header .tab-title').html('Exploration Dashboard');

        if (WEPDemos.utils.isTabletDevice() || WEPDemos.utils.isMobileDevice()) {
            $(window).on('orientationchange', function () {
                view.showHTMLElements();
            });
        }

        //try to resize the view only once the data has been loaded
        var count = 0;
        $(EXPLORATION_ID).on('data-loaded', function (event, name) {
            ++count;

            if (count === TOTAL_COUNT) {
                var delay = (WEPDemos.utils.isTabletDevice() || WEPDemos.utils.isMobileDevice()) ? LONG_DELAY : SHORT_DELAY;
                setTimeout(function () {
                    $(window).trigger('resize');
                    view.showHTMLElements();
                }, delay);
            }
        });
    };

    return App;
})();