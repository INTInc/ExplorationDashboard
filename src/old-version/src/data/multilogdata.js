/*
 * Copyright: Copyright (c) 2013 by INT, Inc.  All rights reserved.<br>
 * Company: INT, Inc. <br>
 * INT PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */

ExplorationDemo.data = ExplorationDemo.data || {};
ExplorationDemo.data.MultiLogData = (function () {

    var LogData = function (options) {
        this.__id__ = _.uniqueId('multilogdata-id-');
        options['depths'] = options['mds'];
        this._mdLogData = new geotoolkit.welllog.data.LogData(options);
        this._mdLogData.__id__ = this.__id__;

        options['depths'] = options['tvds'];
        this._tvdLogData = new geotoolkit.welllog.data.LogData(options);
        this._tvdLogData.__id__ = this.__id__;

        options['depths'] = options['hzds'];
        this._hzdsLogData = new geotoolkit.welllog.data.LogData(options);
        this._hzdsLogData.__id__ = this.__id__;
    };


    LogData.prototype.getSpecificLogData = function (domain) {
        switch(domain) {
            case 'MD':
                return this._mdLogData;

            case 'TVD':
                return this._tvdLogData;

            case 'HZD':
                return this._hzdsLogData;
        }
    };

    LogData.prototype.setValueUnit = function(unit){
        this._mdLogData.setValueUnit(unit);
        this._tvdLogData.setValueUnit(unit);
        this._hzdsLogData.setValueUnit(unit);
    };

    return LogData;
})();

