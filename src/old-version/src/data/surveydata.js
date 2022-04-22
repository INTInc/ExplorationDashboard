/*
 * Copyright: Copyright (c) 2013 by INT, Inc.  All rights reserved.<br>
 * Company: INT, Inc. <br>
 * INT PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */

ExplorationDemo.data = ExplorationDemo.data || {};
ExplorationDemo.data.SurveyData = (function () {
    var EPSILON = geotoolkit.util.Math.epsilon;

    var Data = function (options) {
        if(options == null) {
            options = {};
        }
        var opts = geotoolkit.mergeObjects(options, {
            'name': '',
            'x': [],
            'y': [],
            'tvd': [],
            'md': [],
            'deviation': {
                'x': [],
                'y': [],
                'elevation': []
            },
            'value': [],
            'tops': []
        });

        this._name = opts['name'];

        this._dataX = opts['x'];
        this._dataY = opts['y'];
        this._tvd = opts['tvd'];
        this._md = opts['md'];

        this._devX = opts['deviation']['x'];
        this._devY = opts['deviation']['y'];
        this._elevation = opts['deviation']['elevation'];

        this._values = opts['value'];
        this._tops = opts['tops'];

        this._wellPosition = new THREE.Vector3(this._dataX[0], this._dataY[0], -this._tvd[0]);
    };

    Data.prototype.getName = function () {
        return this._name;
    };

    Data.prototype.getValues = function () {
        return this._values;
    };

    Data.prototype.getWellPosition = function () {
        return this._wellPosition;
    };

    Data.prototype.getDeviation = function () {
        return {
            'x': this._devX,
            'y': this._devY,
            'z': this._elevation
        };
    };

    Data.prototype.addTops = function (tops) {
        this._tops = tops;
    };

    Data.prototype.getTops = function () {
        return this._tops;
    };

    Data.prototype.getPointAtMD = function (md, isDeviatedPoint) {
        var index = getIndex(this._md, md);
        if(index < 0) {
            return this.getPointAtIndex(0, isDeviatedPoint);
        }
        return this.getPointAtIndex(index, isDeviatedPoint);
    };

    Data.prototype.getNextPointAtMD = function (md, isDeviatedPoint) {
        var index = getIndex(this._md, md);
        if(index + 1 === this._md.length) {
            return this.getPointAtIndex(index, isDeviatedPoint);
        }
        return this.getPointAtIndex(index + 1, isDeviatedPoint);
    };

    Data.prototype.getPointAtIndex = function (i, isDeviatedPoint) {
        if(isDeviatedPoint) {
            return new THREE.Vector3(0, 0, 0).add(this.getDeviationPointAtIndex(i));
        }
        return this._wellPosition.clone().add(this.getDeviationPointAtIndex(i));
    };

    Data.prototype.getDeviationPointAtIndex = function (i) {
        return new THREE.Vector3(
            this._devX[i],
            this._devY[i],
            this._elevation[i]
        );
    };

    function getIndex(arr, value) {
        var i, dist1, dist2;
        i = _findIndex(value, arr.length, arr);
        if(i >= 0) {
            //index found
            return i;
        } else {
            i = ~i;//bitwise index
            i = Math.min(i, arr.length - 1);
            //compute distance between n-1 and n
            dist1 = Math.abs(value - arr[Math.max(i - 1, 0)]);
            dist2 = Math.abs(value - arr[i]);
            if(dist1 < dist2) {
                return i - 1;
            } else {
                return i;
            }
        }
    }

    function _findIndex(value, length, arr) {
        var i = 0, end = length - 1;
        if(end >= 0) {
            var k, j = end;
            while(i <= j) {
                k = (i + j) >> 1;
                if(Math.abs(arr[k] - value) <= EPSILON) {
                    return k;
                } else if(arr[k] < value) {
                    i = k + 1;
                    continue;
                }
                j = k - 1;
            }
        }
        return ~i;
    }

    return Data;
})();