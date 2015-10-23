/*! 
* DevExtreme (Core Library)
* Version: 14.2.3
* Build date: Dec 3, 2014
*
* Copyright (c) 2012 - 2014 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
*/

"use strict";
if (!window.DevExpress) {
    /*! Module core, file devexpress.js */
    (function($, global, undefined) {
        global.DevExpress = global.DevExpress || {};
        $.extend(global.DevExpress, {
            VERSION: "14.2.3",
            abstract: function() {
                throw global.DevExpress.Error("E0001");
            },
            stringFormat: function() {
                var s = arguments[0];
                for (var i = 0; i < arguments.length - 1; i++) {
                    var reg = new RegExp("\\{" + i + "\\}", "gm");
                    s = s.replace(reg, arguments[i + 1])
                }
                return s
            },
            parseUrl: function() {
                var a = document.createElement("a"),
                    props = ["protocol", "hostname", "port", "pathname", "search", "hash"];
                var normalizePath = function(value) {
                        if (value.charAt(0) !== "/")
                            value = "/" + value;
                        return value
                    };
                return function(url) {
                        a.href = url;
                        var result = {};
                        $.each(props, function() {
                            result[this] = a[this]
                        });
                        result.pathname = normalizePath(result.pathname);
                        return result
                    }
            }(),
            processHardwareBackButton: function() {
                this.hardwareBackButton.fire()
            },
            hardwareBackButton: $.Callbacks(),
            viewPort: function() {
                var $current;
                return function(element) {
                        if (!arguments.length)
                            return $current;
                        var $element = $(element);
                        var isNewViewportFound = !!$element.length;
                        var prevViewPort = this.viewPort();
                        $current = isNewViewportFound ? $element : $("body");
                        this.viewPortChanged.fire(isNewViewportFound ? this.viewPort() : $(), prevViewPort)
                    }
            }(),
            viewPortChanged: $.Callbacks(),
            hideTopOverlayCallback: function() {
                var callbacks = [];
                return {
                        add: function(callback) {
                            var indexOfCallback = $.inArray(callback, callbacks);
                            if (indexOfCallback === -1)
                                callbacks.push(callback)
                        },
                        remove: function(callback) {
                            var indexOfCallback = $.inArray(callback, callbacks);
                            if (indexOfCallback !== -1)
                                callbacks.splice(indexOfCallback, 1)
                        },
                        fire: function() {
                            var callback = callbacks.pop(),
                                result = !!callback;
                            if (result)
                                callback();
                            return result
                        },
                        hasCallback: function() {
                            return callbacks.length > 0
                        },
                        reset: function() {
                            callbacks = []
                        }
                    }
            }(),
            rtlEnabled: false
        });
        $(function() {
            DevExpress.viewPort(".dx-viewport")
        })
    })(jQuery, this);
    /*! Module core, file errors.js */
    (function($, DX) {
        var ERROR_MESSAGES = {
                E0001: "Method is not implemented",
                E0002: "Member name collision: {0}",
                E0003: "A class must be instantiated using the 'new' keyword",
                E0004: "The NAME property of the component is not specified",
                E0005: "Unknown device",
                E0006: "Unknown endpoint key is requested",
                E0007: "'Invalidate' method is called outside the update transaction",
                E0008: "Type of the option name is not appropriate to create an action",
                E0009: "Component '{0}' has not been initialized for an element",
                E0010: "Animation configuration with the '{0}' type requires '{1}' configuration as an plain object",
                E0011: "Unknown animation type '{0}'",
                E0012: "jQuery version is too old. Please upgrade jQuery to 1.10.0 or later",
                E0013: "KnockoutJS version is too old. Please upgrade KnockoutJS to 2.3.0 or later",
                E0014: "The 'release' method shouldn't be called for an unlocked Lock object",
                E0015: "Queued task returned an unexpected result",
                E0017: "Event namespace is not defined",
                E0018: "DevExpress.ui.dxPopup widget is required",
                E0020: "Template engine '{0}' is not supported",
                E0021: "Unknown theme is set: {0}",
                E0022: "LINK[rel=dx-theme] tags must go before DevExpress included scripts",
                E0023: "Template name is not specified",
                E0100: "Unknown validation type is detected",
                E0101: "Misconfigured range validation rule is detected",
                E0102: "Misconfigured comparison validation rule is detected",
                E0110: "Unknown validation group is detected",
                E0120: "Adapter for a dxValidator component cannot be configured",
                W0000: "'{0}' is deprecated in {1}. {2}",
                W0001: "{0} - '{1}' option is deprecated in {2}. {3}",
                W0002: "{0} - '{1}' method is deprecated in {2}. {3}",
                W0003: "{0} - '{1}' property is deprecated in {2}. {3}",
                W0004: "Timeout for theme loading is over: {0}"
            };
        var ERROR_URL = "http://js.devexpress.com/error/" + DX.VERSION.split(".").slice(0, 2).join("_") + "/";
        var combineMessage = function(args) {
                var id = args[0];
                args = args.slice(1);
                return formatMessage(id, formatDetails(id, args))
            };
        var formatDetails = function(id, args) {
                args = [DX.ERROR_MESSAGES[id]].concat(args);
                return DX.stringFormat.apply(this, args).replace(/\.*\s*?$/, '')
            };
        var formatMessage = function(id, details) {
                return DX.stringFormat.apply(this, ["{0} - {1}. See:\n{2}", id, details, ERROR_URL + id])
            };
        var makeError = function(args) {
                var id = args[0],
                    args = args.slice(1),
                    details = formatDetails(id, args),
                    message = formatMessage(id, details);
                return $.extend(new Error(message), {details: details})
            };
        $.extend(DX, {
            Error: function(id) {
                return makeError($.makeArray(arguments))
            },
            log: function(id) {
                var method = "log",
                    logger = DX.utils.logger;
                if (/^E\d+$/.test(id))
                    method = "error";
                else if (/^W\d+$/.test(id))
                    method = "warn";
                logger[method](method === "log" ? id : combineMessage($.makeArray(arguments)))
            },
            ERROR_MESSAGES: ERROR_MESSAGES
        })
    })($, DevExpress);
    /*! Module core, file class.js */
    (function($, global, DX, undefined) {
        DX.Class = function() {
            var wrapOverridden = function(baseProto, methodName, method) {
                    return function() {
                            var prevCallBase = this.callBase;
                            this.callBase = baseProto[methodName];
                            try {
                                return method.apply(this, arguments)
                            }
                            finally {
                                this.callBase = prevCallBase
                            }
                        }
                };
            var clonePrototype = function(obj) {
                    var func = function(){};
                    func.prototype = obj.prototype;
                    return new func
                };
            var classImpl = function(){};
            var redefine = function(members) {
                    var that = this;
                    if (!members)
                        return that;
                    var memberNames = $.map(members, function(_, k) {
                            return k
                        });
                    $.each(["toString", "toLocaleString", "valueOf"], function() {
                        if (members[this])
                            memberNames.push(this)
                    });
                    $.each(memberNames, function() {
                        var overridden = $.isFunction(that.prototype[this]) && $.isFunction(members[this]);
                        that.prototype[this] = overridden ? wrapOverridden(that.parent.prototype, this, members[this]) : members[this]
                    });
                    return that
                };
            var include = function() {
                    var classObj = this;
                    $.each(arguments, function() {
                        if (this.ctor)
                            classObj._includedCtors.push(this.ctor);
                        if (this.postCtor)
                            classObj._includedPostCtors.push(this.postCtor);
                        for (var name in this) {
                            if (name === "ctor" || name === "postCtor")
                                continue;
                            if (name in classObj.prototype)
                                throw DX.Error("E0002", name);
                            classObj.prototype[name] = this[name]
                        }
                    });
                    return classObj
                };
            var subclassOf = function(parentClass) {
                    if (this.parent === parentClass)
                        return true;
                    if (!this.parent || !this.parent.subclassOf)
                        return false;
                    return this.parent.subclassOf(parentClass)
                };
            classImpl.inherit = function(members) {
                var inheritor = function() {
                        if (!this || this === global || typeof this.constructor !== "function")
                            throw DX.Error("E0003");
                        var instance = this,
                            ctor = instance.ctor;
                        $.each(instance.constructor._includedCtors, function() {
                            this.call(instance)
                        });
                        if (ctor)
                            ctor.apply(instance, arguments);
                        $.each(instance.constructor._includedPostCtors, function() {
                            this.call(instance)
                        })
                    };
                inheritor.prototype = clonePrototype(this);
                inheritor.inherit = this.inherit;
                inheritor.redefine = redefine;
                inheritor.include = include;
                inheritor.subclassOf = subclassOf;
                inheritor.parent = this;
                inheritor._includedCtors = this._includedCtors ? this._includedCtors.slice(0) : [];
                inheritor._includedPostCtors = this._includedPostCtors ? this._includedPostCtors.slice(0) : [];
                inheritor.prototype.constructor = inheritor;
                inheritor.redefine(members);
                return inheritor
            };
            return classImpl
        }()
    })(jQuery, this, DevExpress);
    /*! Module core, file queue.js */
    (function($, global, undefined) {
        var DX = global.DevExpress;
        function createQueue(discardPendingTasks) {
            var _tasks = [],
                _busy = false;
            function exec() {
                while (_tasks.length) {
                    _busy = true;
                    var task = _tasks.shift(),
                        result = task();
                    if (result === undefined)
                        continue;
                    if (result.then) {
                        $.when(result).always(exec);
                        return
                    }
                    throw DX.Error("E0015");
                }
                _busy = false
            }
            function add(task, removeTaskCallback) {
                if (!discardPendingTasks)
                    _tasks.push(task);
                else {
                    if (_tasks[0] && removeTaskCallback)
                        removeTaskCallback(_tasks[0]);
                    _tasks = [task]
                }
                if (!_busy)
                    exec()
            }
            function busy() {
                return _busy
            }
            return {
                    add: add,
                    busy: busy
                }
        }
        $.extend(global.DevExpress, {
            createQueue: createQueue,
            enqueue: createQueue().add
        })
    })(jQuery, this);
    /*! Module core, file inflector.js */
    (function($, DX, undefined) {
        var _normalize = function(text) {
                if (text === undefined || text === null)
                    return "";
                return String(text)
            };
        var _ucfirst = function(text) {
                return _normalize(text).charAt(0).toUpperCase() + text.substr(1)
            };
        var _chop = function(text) {
                return _normalize(text).replace(/([a-z\d])([A-Z])/g, "$1 $2").split(/[\s_-]+/)
            };
        var dasherize = function(text) {
                return $.map(_chop(text), function(p) {
                        return p.toLowerCase()
                    }).join("-")
            };
        var underscore = function(text) {
                return dasherize(text).replace(/-/g, "_")
            };
        var camelize = function(text, upperFirst) {
                return $.map(_chop(text), function(p, i) {
                        p = p.toLowerCase();
                        if (upperFirst || i > 0)
                            p = _ucfirst(p);
                        return p
                    }).join("")
            };
        var humanize = function(text) {
                return _ucfirst(dasherize(text).replace(/-/g, " "))
            };
        var titleize = function(text) {
                return $.map(_chop(text), function(p) {
                        return _ucfirst(p.toLowerCase())
                    }).join(" ")
            };
        DX.inflector = {
            dasherize: dasherize,
            camelize: camelize,
            humanize: humanize,
            titleize: titleize,
            underscore: underscore
        }
    })(jQuery, DevExpress);
    /*! Module core, file eventsMixin.js */
    (function($, DX, undefined) {
        var EventsMixin = {
                ctor: function() {
                    this._events = {}
                },
                fireEvent: function(eventName, eventArgs) {
                    var callbacks = this._events[eventName];
                    if (callbacks)
                        callbacks.fireWith(this, eventArgs);
                    return this
                },
                on: function(eventName, eventHandler) {
                    if ($.isPlainObject(eventName))
                        $.each(eventName, $.proxy(function(e, h) {
                            this.on(e, h)
                        }, this));
                    else {
                        var callbacks = this._events[eventName],
                            addFn;
                        if (!callbacks) {
                            callbacks = $.Callbacks();
                            this._events[eventName] = callbacks
                        }
                        addFn = callbacks.originalAdd || callbacks.add;
                        addFn.call(callbacks, eventHandler)
                    }
                    return this
                },
                off: function(eventName, eventHandler) {
                    var callbacks = this._events[eventName];
                    if (callbacks)
                        if ($.isFunction(eventHandler))
                            callbacks.remove(eventHandler);
                        else
                            callbacks.empty();
                    return this
                },
                _disposeEvents: function() {
                    $.each(this._events, function() {
                        this.empty()
                    })
                },
                _callbacksToEvents: function(className, eventNames) {
                    var that = this;
                    $.each(eventNames, function(_, eventName) {
                        var callbacksProperty = that[eventName],
                            originalAdd;
                        if (callbacksProperty !== undefined) {
                            originalAdd = callbacksProperty.add;
                            callbacksProperty.originalAdd = originalAdd;
                            callbacksProperty.add = function() {
                                DX.log("W0003", className, eventName, "14.2", "Use the '" + eventName + "' event instead");
                                return originalAdd.apply(that, arguments)
                            };
                            that._events[eventName] = callbacksProperty
                        }
                    })
                }
            };
        $.extend(DX, {EventsMixin: EventsMixin})
    })(jQuery, DevExpress);
    /*! Module core, file jquery.js */
    (function($) {
        (function checkjQueryVersion(version) {
            version = version.split(".");
            if (version[0] < 1 || version[0] == 1 && version[1] < 10)
                throw DX.Error("E0012");
        })($.fn.jquery)
    })(jQuery);
    /*! Module core, file utils.common.js */
    (function($, DX, undefined) {
        var isDefined = function(object) {
                return object !== null && object !== undefined
            };
        var isString = function(object) {
                return $.type(object) === 'string'
            };
        var isNumber = function(object) {
                return typeof object === "number" && isFinite(object) || $.isNumeric(object)
            };
        var isObject = function(object) {
                return $.type(object) === 'object'
            };
        var isArray = function(object) {
                return $.type(object) === 'array'
            };
        var isDate = function(object) {
                return $.type(object) === 'date'
            };
        var isFunction = function(object) {
                return $.type(object) === 'function'
            };
        var isExponential = function(value) {
                return isNumber(value) && value.toString().indexOf('e') !== -1
            };
        var extendFromObject = function(target, source, overrideExistingValues) {
                target = target || {};
                for (var prop in source)
                    if (source.hasOwnProperty(prop)) {
                        var value = source[prop];
                        if (!(prop in target) || overrideExistingValues)
                            target[prop] = value
                    }
                return target
            };
        var clone = function() {
                function Clone(){}
                return function(obj) {
                        Clone.prototype = obj;
                        return new Clone
                    }
            }();
        var executeAsync = function(action, context) {
                var deferred = $.Deferred(),
                    normalizedContext = context || this;
                setTimeout(function() {
                    var result = action.call(normalizedContext);
                    if (result && result.done && $.isFunction(result.done))
                        result.done(function() {
                            deferred.resolveWith(normalizedContext)
                        });
                    else
                        deferred.resolveWith(normalizedContext)
                }, 0);
                return deferred.promise()
            };
        var findBestMatches = function(targetFilter, items, mapFn) {
                var bestMatches = [],
                    maxMatchCount = 0;
                $.each(items, function(index, itemSrc) {
                    var matchCount = 0,
                        item = mapFn ? mapFn(itemSrc) : itemSrc;
                    $.each(targetFilter, function(paramName) {
                        var value = item[paramName];
                        if (value === undefined)
                            return;
                        if (value === targetFilter[paramName]) {
                            matchCount++;
                            return
                        }
                        matchCount = -1;
                        return false
                    });
                    if (matchCount < maxMatchCount)
                        return;
                    if (matchCount > maxMatchCount) {
                        bestMatches.length = 0;
                        maxMatchCount = matchCount
                    }
                    bestMatches.push(itemSrc)
                });
                return bestMatches
            };
        var preg_quote = function(str) {
                return (str + "").replace(/([\+\*\?\\\.\[\^\]\$\(\)\{\}\>\<\|\=\!\:])/g, "\\$1")
            };
        var replaceAll = function(text, searchToken, replacementToken) {
                return text.replace(new RegExp("(" + preg_quote(searchToken) + ")", "gi"), replacementToken)
            };
        var splitPair = function(raw) {
                switch (typeof raw) {
                    case"string":
                        return raw.split(/\s+/, 2);
                    case"object":
                        return [raw.x || raw.h, raw.y || raw.v];
                    case"number":
                        return [raw];
                    default:
                        return raw
                }
            };
        var stringPairToObject = function(raw) {
                var pair = splitPair(raw),
                    h = parseInt(pair && pair[0], 10),
                    v = parseInt(pair && pair[1], 10);
                if (!isFinite(h))
                    h = 0;
                if (!isFinite(v))
                    v = h;
                return {
                        h: h,
                        v: v
                    }
            };
        function icontains(elem, text) {
            var result = false;
            $.each($(elem).contents(), function(index, content) {
                if (content.nodeType === 3 && (content.textContent || content.nodeValue || "").toLowerCase().indexOf((text || "").toLowerCase()) > -1) {
                    result = true;
                    return false
                }
            });
            return result
        }
        $.expr[":"].dxicontains = $.expr.createPseudo(function(text) {
            return function(elem) {
                    return icontains(elem, text)
                }
        });
        function deepExtendArraySafe(target, changes) {
            var prevValue,
                newValue;
            for (var name in changes) {
                prevValue = target[name];
                newValue = changes[name];
                if (target === newValue)
                    continue;
                if ($.isPlainObject(newValue) && !(newValue instanceof $.Event))
                    target[name] = deepExtendArraySafe($.isPlainObject(prevValue) ? prevValue : {}, newValue);
                else if (newValue !== undefined)
                    target[name] = newValue
            }
            return target
        }
        function unwrapObservable(value) {
            if (DX.support.hasKo)
                return ko.utils.unwrapObservable(value);
            return value
        }
        DX.utils = {
            isDefined: isDefined,
            isString: isString,
            isNumber: isNumber,
            isObject: isObject,
            isArray: isArray,
            isDate: isDate,
            isFunction: isFunction,
            isExponential: isExponential,
            extendFromObject: extendFromObject,
            clone: clone,
            executeAsync: executeAsync,
            stringFormat: DX.stringFormat,
            findBestMatches: findBestMatches,
            replaceAll: replaceAll,
            deepExtendArraySafe: deepExtendArraySafe,
            splitPair: splitPair,
            stringPairToObject: stringPairToObject,
            unwrapObservable: unwrapObservable
        }
    })(jQuery, DevExpress);
    /*! Module core, file utils.console.js */
    (function($, DX, undefined) {
        var logger = function() {
                var console = window.console;
                function info(text) {
                    if (!console || !$.isFunction(console.info))
                        return;
                    console.info(text)
                }
                function warn(text) {
                    if (!console || !$.isFunction(console.warn))
                        return;
                    console.warn(text)
                }
                function error(text) {
                    if (!console || !$.isFunction(console.error))
                        return;
                    console.error(text)
                }
                return {
                        info: info,
                        warn: warn,
                        error: error
                    }
            }();
        var debug = function() {
                function assert(condition, message) {
                    if (!condition)
                        throw new Error(message);
                }
                function assertParam(parameter, message) {
                    assert(parameter !== null && parameter !== undefined, message)
                }
                return {
                        assert: assert,
                        assertParam: assertParam
                    }
            }();
        $.extend(DX.utils, {
            logger: logger,
            debug: debug
        })
    })(jQuery, DevExpress);
    /*! Module core, file utils.math.js */
    (function($, DX, undefined) {
        var PI = Math.PI,
            LN10 = Math.LN10;
        var cos = Math.cos,
            sin = Math.sin,
            abs = Math.abs,
            log = Math.log,
            floor = Math.floor,
            ceil = Math.ceil,
            max = Math.max,
            min = Math.min,
            isNaN = window.isNaN,
            Number = window.Number,
            NaN = window.NaN;
        var isNumber = DX.utils.isNumber,
            isExponential = DX.utils.isExponential;
        var getPrecision = function(value) {
                var stringFraction,
                    stringValue = value.toString(),
                    pointIndex = stringValue.indexOf('.'),
                    startIndex,
                    precision;
                if (isExponential(value)) {
                    precision = getDecimalOrder(value);
                    if (precision < 0)
                        return Math.abs(precision);
                    else
                        return 0
                }
                if (pointIndex !== -1) {
                    startIndex = pointIndex + 1;
                    stringFraction = stringValue.substring(startIndex, startIndex + 20);
                    return stringFraction.length
                }
                return 0
            };
        var getLog = function(value, base) {
                if (!value)
                    return 0;
                return Math.log(value) / Math.log(base)
            };
        var raiseTo = function(power, base) {
                return Math.pow(base, power)
            };
        var sign = function(value) {
                if (value === 0)
                    return 0;
                return value / abs(value)
            };
        var normalizeAngle = function(angle) {
                return (angle % 360 + 360) % 360
            };
        var convertAngleToRendererSpace = function(angle) {
                return 90 - angle
            };
        var degreesToRadians = function(value) {
                return PI * value / 180
            };
        var getCosAndSin = function(angle) {
                var angleInRadians = degreesToRadians(angle);
                return {
                        cos: cos(angleInRadians),
                        sin: sin(angleInRadians)
                    }
            };
        var DECIMAL_ORDER_THRESHOLD = 1E-14;
        var getDistance = function(x1, y1, x2, y2) {
                var diffX = x2 - x1,
                    diffY = y2 - y1;
                return Math.sqrt(diffY * diffY + diffX * diffX)
            };
        var getDecimalOrder = function(number) {
                var n = abs(number),
                    cn;
                if (!isNaN(n)) {
                    if (n > 0) {
                        n = log(n) / LN10;
                        cn = ceil(n);
                        return cn - n < DECIMAL_ORDER_THRESHOLD ? cn : floor(n)
                    }
                    return 0
                }
                return NaN
            };
        var getAppropriateFormat = function(start, end, count) {
                var order = max(getDecimalOrder(start), getDecimalOrder(end)),
                    precision = -getDecimalOrder(abs(end - start) / count),
                    format;
                if (!isNaN(order) && !isNaN(precision)) {
                    if (abs(order) <= 4) {
                        format = 'fixedPoint';
                        precision < 0 && (precision = 0);
                        precision > 4 && (precision = 4)
                    }
                    else {
                        format = 'exponential';
                        precision += order - 1;
                        precision > 3 && (precision = 3)
                    }
                    return {
                            format: format,
                            precision: precision
                        }
                }
                return null
            };
        var getFraction = function(value) {
                var valueString,
                    dotIndex;
                if (isNumber(value)) {
                    valueString = value.toString();
                    dotIndex = valueString.indexOf('.');
                    if (dotIndex >= 0)
                        if (isExponential(value))
                            return valueString.substr(dotIndex + 1, valueString.indexOf('e') - dotIndex - 1);
                        else {
                            valueString = value.toFixed(20);
                            return valueString.substr(dotIndex + 1, valueString.length - dotIndex + 1)
                        }
                }
                return ''
            };
        var getSignificantDigitPosition = function(value) {
                var fraction = getFraction(value),
                    i;
                if (fraction)
                    for (i = 0; i < fraction.length; i++)
                        if (fraction.charAt(i) !== '0')
                            return i + 1;
                return 0
            };
        var adjustValue = function(value) {
                var fraction = getFraction(value),
                    nextValue,
                    i;
                if (fraction)
                    for (i = 1; i <= fraction.length; i++) {
                        nextValue = roundValue(value, i);
                        if (nextValue !== 0 && fraction[i - 2] && fraction[i - 1] && fraction[i - 2] === fraction[i - 1])
                            return nextValue
                    }
                return value
            };
        var roundValue = function(value, precision) {
                if (precision > 20)
                    precision = 20;
                if (isNumber(value))
                    if (isExponential(value))
                        return Number(value.toExponential(precision));
                    else
                        return Number(value.toFixed(precision))
            };
        var applyPrecisionByMinDelta = function(min, delta, value) {
                var minPrecision = getPrecision(min),
                    deltaPrecision = getPrecision(delta);
                return roundValue(value, minPrecision < deltaPrecision ? deltaPrecision : minPrecision)
            };
        var fitIntoRange = function(value, minValue, maxValue) {
                return Math.min(Math.max(value, minValue), maxValue)
            };
        $.extend(DX.utils, {
            getLog: getLog,
            raiseTo: raiseTo,
            sign: sign,
            normalizeAngle: normalizeAngle,
            convertAngleToRendererSpace: convertAngleToRendererSpace,
            degreesToRadians: degreesToRadians,
            getCosAndSin: getCosAndSin,
            getDecimalOrder: getDecimalOrder,
            getAppropriateFormat: getAppropriateFormat,
            getDistance: getDistance,
            getFraction: getFraction,
            adjustValue: adjustValue,
            roundValue: roundValue,
            applyPrecisionByMinDelta: applyPrecisionByMinDelta,
            getSignificantDigitPosition: getSignificantDigitPosition,
            fitIntoRange: fitIntoRange
        });
        DX.utils.getPrecision = getPrecision
    })(jQuery, DevExpress);
    /*! Module core, file utils.date.js */
    (function($, DX, undefined) {
        var isObject = DX.utils.isObject,
            isString = DX.utils.isString,
            isDate = DX.utils.isDate,
            isDefined = DX.utils.isDefined;
        var dateUnitIntervals = ['millisecond', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'];
        var addSubValues = function(value1, value2, isSub) {
                return value1 + (isSub ? -1 : 1) * value2
            };
        var toMilliseconds = function(value) {
                switch (value) {
                    case'millisecond':
                        return 1;
                    case'second':
                        return toMilliseconds('millisecond') * 1000;
                    case'minute':
                        return toMilliseconds('second') * 60;
                    case'hour':
                        return toMilliseconds('minute') * 60;
                    case'day':
                        return toMilliseconds('hour') * 24;
                    case'week':
                        return toMilliseconds('day') * 7;
                    case'month':
                        return toMilliseconds('day') * 30;
                    case'quarter':
                        return toMilliseconds('month') * 3;
                    case'year':
                        return toMilliseconds('day') * 365;
                    default:
                        return 0
                }
            };
        function parseISO8601(isoString) {
            var result = new Date(0);
            var chunks = isoString.replace("Z", "").split("T"),
                date = String(chunks[0]).split("-"),
                time = String(chunks[1]).split(":");
            var year,
                month,
                day,
                hours,
                minutes,
                seconds,
                milliseconds;
            year = Number(date[0]);
            month = Number(date[1]) - 1;
            day = Number(date[2]);
            result.setDate(day);
            result.setMonth(month);
            result.setFullYear(year);
            if (time.length) {
                hours = Number(time[0]);
                minutes = Number(time[1]);
                seconds = Number(String(time[2]).split(".")[0]);
                milliseconds = Number(String(time[2]).split(".")[1]) || 0;
                result.setHours(hours);
                result.setMinutes(minutes);
                result.setSeconds(seconds);
                result.setMilliseconds(milliseconds)
            }
            return result
        }
        function formatISO8601(date) {
            function pad(n) {
                if (n < 10)
                    return "0".concat(n);
                return String(n)
            }
            return [date.getFullYear(), "-", pad(date.getMonth() + 1), "-", pad(date.getDate()), "T", pad(date.getHours()), ":", pad(date.getMinutes()), ":", pad(date.getSeconds()), "Z"].join("")
        }
        var convertMillisecondsToDateUnits = function(value) {
                var i,
                    dateUnitCount,
                    dateUnitInterval,
                    dateUnitIntervals = ['millisecond', 'second', 'minute', 'hour', 'day', 'month', 'year'],
                    result = {};
                for (i = dateUnitIntervals.length - 1; i >= 0; i--) {
                    dateUnitInterval = dateUnitIntervals[i];
                    dateUnitCount = Math.floor(value / toMilliseconds(dateUnitInterval));
                    if (dateUnitCount > 0) {
                        result[dateUnitInterval + 's'] = dateUnitCount;
                        value -= convertDateUnitToMilliseconds(dateUnitInterval, dateUnitCount)
                    }
                }
                return result
            };
        var convertDateTickIntervalToMilliseconds = function(tickInterval) {
                var milliseconds = 0;
                if (isObject(tickInterval))
                    $.each(tickInterval, function(key, value) {
                        milliseconds += convertDateUnitToMilliseconds(key.substr(0, key.length - 1), value)
                    });
                if (isString(tickInterval))
                    milliseconds = convertDateUnitToMilliseconds(tickInterval, 1);
                return milliseconds
            };
        var convertDateUnitToMilliseconds = function(dateUnit, count) {
                return toMilliseconds(dateUnit) * count
            };
        var getDateUnitInterval = function(tickInterval) {
                var maxInterval = -1,
                    i;
                if (isString(tickInterval))
                    return tickInterval;
                if (isObject(tickInterval)) {
                    $.each(tickInterval, function(key, value) {
                        for (i = 0; i < dateUnitIntervals.length; i++)
                            if (value && (key === dateUnitIntervals[i] + 's' || key === dateUnitIntervals[i]) && maxInterval < i)
                                maxInterval = i
                    });
                    return dateUnitIntervals[maxInterval]
                }
                return ''
            };
        var correctDateWithUnitBeginning = function(date, dateInterval) {
                var dayMonth,
                    firstQuarterMonth,
                    dateUnitInterval = getDateUnitInterval(dateInterval);
                switch (dateUnitInterval) {
                    case'second':
                        date.setMilliseconds(0);
                        break;
                    case'minute':
                        date.setSeconds(0, 0);
                        break;
                    case'hour':
                        date.setMinutes(0, 0, 0);
                        break;
                    case'year':
                        date.setMonth(0);
                    case'month':
                        date.setDate(1);
                    case'day':
                        date.setHours(0, 0, 0, 0);
                        break;
                    case'week':
                        dayMonth = date.getDate();
                        if (date.getDay() !== 0)
                            dayMonth += 7 - date.getDay();
                        date.setDate(dayMonth);
                        date.setHours(0, 0, 0, 0);
                        break;
                    case'quarter':
                        firstQuarterMonth = DX.formatHelper.getFirstQuarterMonth(date.getMonth());
                        if (date.getMonth() !== firstQuarterMonth)
                            date.setMonth(firstQuarterMonth);
                        date.setDate(1);
                        date.setHours(0, 0, 0, 0);
                        break
                }
            };
        var getDatesDifferences = function(date1, date2) {
                var differences,
                    counter = 0;
                differences = {
                    year: date1.getFullYear() !== date2.getFullYear(),
                    month: date1.getMonth() !== date2.getMonth(),
                    day: date1.getDate() !== date2.getDate(),
                    hour: date1.getHours() !== date2.getHours(),
                    minute: date1.getMinutes() !== date2.getMinutes(),
                    second: date1.getSeconds() !== date2.getSeconds()
                };
                $.each(differences, function(key, value) {
                    if (value)
                        counter++
                });
                differences.count = counter;
                return differences
            };
        var addInterval = function(value, interval, isNegative) {
                var result = null,
                    intervalObject;
                if (isDate(value)) {
                    intervalObject = isString(interval) ? getDateIntervalByString(interval.toLowerCase()) : interval;
                    result = new Date(value.getTime());
                    if (intervalObject.years)
                        result.setFullYear(addSubValues(result.getFullYear(), intervalObject.years, isNegative));
                    if (intervalObject.quarters)
                        result.setMonth(addSubValues(result.getMonth(), 3 * intervalObject.quarters, isNegative));
                    if (intervalObject.months)
                        result.setMonth(addSubValues(result.getMonth(), intervalObject.months, isNegative));
                    if (intervalObject.weeks)
                        result.setDate(addSubValues(result.getDate(), 7 * intervalObject.weeks, isNegative));
                    if (intervalObject.days)
                        result.setDate(addSubValues(result.getDate(), intervalObject.days, isNegative));
                    if (intervalObject.hours)
                        result.setHours(addSubValues(result.getHours(), intervalObject.hours, isNegative));
                    if (intervalObject.minutes)
                        result.setMinutes(addSubValues(result.getMinutes(), intervalObject.minutes, isNegative));
                    if (intervalObject.seconds)
                        result.setSeconds(addSubValues(result.getSeconds(), intervalObject.seconds, isNegative));
                    if (intervalObject.milliseconds)
                        result.setMilliseconds(addSubValues(value.getMilliseconds(), intervalObject.milliseconds, isNegative))
                }
                else
                    result = addSubValues(value, interval, isNegative);
                return result
            };
        var getDateIntervalByString = function(intervalString) {
                var result = {};
                switch (intervalString) {
                    case'year':
                        result.years = 1;
                        break;
                    case'month':
                        result.months = 1;
                        break;
                    case'quarter':
                        result.months = 3;
                        break;
                    case'week':
                        result.days = 7;
                        break;
                    case'day':
                        result.days = 1;
                        break;
                    case'hour':
                        result.hours = 1;
                        break;
                    case'minute':
                        result.minutes = 1;
                        break;
                    case'second':
                        result.seconds = 1;
                        break;
                    case'millisecond':
                        result.milliseconds = 1;
                        break
                }
                return result
            };
        var sameMonthAndYear = function(date1, date2) {
                return date1 && date2 && date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth()
            };
        var getFirstMonthDate = function(date) {
                return new Date(date.getFullYear(), date.getMonth(), 1)
            };
        var dateInRange = function(date, min, max) {
                return normalizeDate(date, min, max) === date
            };
        var normalizeDate = function(date, min, max) {
                var normalizedDate = date;
                if (isDefined(min) && date < min)
                    normalizedDate = min;
                if (isDefined(max) && date > max)
                    normalizedDate = max;
                return normalizedDate
            };
        var getPower = function(value) {
                return value.toExponential().split("e")[1]
            };
        $.extend(DX.utils, {
            dateUnitIntervals: dateUnitIntervals,
            parseIso8601Date: parseISO8601,
            formatIso8601Date: formatISO8601,
            convertMillisecondsToDateUnits: convertMillisecondsToDateUnits,
            convertDateTickIntervalToMilliseconds: convertDateTickIntervalToMilliseconds,
            convertDateUnitToMilliseconds: convertDateUnitToMilliseconds,
            getDateUnitInterval: getDateUnitInterval,
            getDatesDifferences: getDatesDifferences,
            correctDateWithUnitBeginning: correctDateWithUnitBeginning,
            addInterval: addInterval,
            getDateIntervalByString: getDateIntervalByString,
            sameMonthAndYear: sameMonthAndYear,
            getFirstMonthDate: getFirstMonthDate,
            dateInRange: dateInRange,
            normalizeDate: normalizeDate,
            getPower: getPower
        })
    })(jQuery, DevExpress);
    /*! Module core, file utils.dom.js */
    (function($, DX, undefined) {
        var IOS_APP_BAR_HEIGHT = "20px";
        var timeRedrawOnResize = 100;
        var createResizeHandler = function(callback) {
                var $window = $(window),
                    timeout;
                var debug_callback = arguments[1];
                var handler = function() {
                        var width = $window.width(),
                            height = $window.height();
                        clearTimeout(timeout);
                        timeout = setTimeout(function() {
                            $window.width() === width && $window.height() === height && callback();
                            debug_callback && debug_callback()
                        }, timeRedrawOnResize)
                    };
                handler.stop = function() {
                    clearTimeout(timeout);
                    return this
                };
                return handler
            };
        var windowResizeCallbacks = function() {
                var prevSize,
                    callbacks = $.Callbacks(),
                    jqWindow = $(window),
                    resizeEventHandlerAttached = false,
                    originalCallbacksAdd = callbacks.add,
                    originalCallbacksRemove = callbacks.remove;
                var formatSize = function() {
                        return [jqWindow.width(), jqWindow.height()].join()
                    };
                var handleResize = function() {
                        var now = formatSize();
                        if (now === prevSize)
                            return;
                        prevSize = now;
                        setTimeout(callbacks.fire)
                    };
                prevSize = formatSize();
                callbacks.add = function() {
                    var result = originalCallbacksAdd.apply(callbacks, arguments);
                    if (!resizeEventHandlerAttached && callbacks.has()) {
                        jqWindow.on("resize", handleResize);
                        resizeEventHandlerAttached = true
                    }
                    return result
                };
                callbacks.remove = function() {
                    var result = originalCallbacksRemove.apply(callbacks, arguments);
                    if (!callbacks.has() && resizeEventHandlerAttached) {
                        jqWindow.off("resize", handleResize);
                        resizeEventHandlerAttached = false
                    }
                    return result
                };
                return callbacks
            }();
        var resetActiveElement = function() {
                var activeElement = document.activeElement;
                if (activeElement && activeElement !== document.body && activeElement.blur)
                    activeElement.blur()
            };
        var createMarkupFromString = function(str) {
                var tempElement = $("<div />");
                if (window.WinJS)
                    WinJS.Utilities.setInnerHTMLUnsafe(tempElement.get(0), str);
                else
                    tempElement.append(str);
                return tempElement.contents()
            };
        var initMobileViewport = function(options) {
                options = $.extend({}, options);
                var device = DX.devices.current();
                var realDevice = DX.devices.real();
                var allowZoom = options.allowZoom,
                    allowPan = options.allowPan,
                    allowSelection = "allowSelection" in options ? options.allowSelection : device.platform == "desktop";
                var metaSelector = "meta[name=viewport]";
                if (!$(metaSelector).length)
                    $("<meta />").attr("name", "viewport").appendTo("head");
                var metaVerbs = ["width=device-width"],
                    msTouchVerbs = [];
                if (allowZoom)
                    msTouchVerbs.push("pinch-zoom");
                else
                    metaVerbs.push("initial-scale=1.0", "maximum-scale=1.0, user-scalable=no");
                if (allowPan)
                    msTouchVerbs.push("pan-x", "pan-y");
                if (!allowPan && !allowZoom)
                    $("html, body").css({
                        "-ms-content-zooming": "none",
                        "-ms-user-select": "none",
                        overflow: "hidden"
                    });
                else
                    $("html").css("-ms-overflow-style", "-ms-autohiding-scrollbar");
                if (!allowSelection) {
                    if (realDevice.ios)
                        $(document).on("selectstart", function() {
                            return false
                        });
                    $(".dx-viewport").css("user-select", "none")
                }
                $(metaSelector).attr("content", metaVerbs.join());
                $("html").css("-ms-touch-action", msTouchVerbs.join(" ") || "none");
                if (DX.support.touch)
                    $(document).off(".dxInitMobileViewport").on("dxpointermove.dxInitMobileViewport", function(e) {
                        var count = e.pointers.length,
                            isTouchEvent = e.pointerType === "touch",
                            zoomDisabled = !allowZoom && count > 1,
                            panDisabled = !allowPan && count === 1 && !e.isScrollingEvent;
                        if (isTouchEvent && (zoomDisabled || panDisabled))
                            e.preventDefault()
                    });
                realDevice = DX.devices.real();
                if (realDevice.ios) {
                    var isPhoneGap = document.location.protocol === "file:";
                    if (!isPhoneGap)
                        windowResizeCallbacks.add(function() {
                            var windowWidth = $(window).width();
                            $("body").width(windowWidth)
                        })
                }
            };
        var triggerVisibilityChangeEvent = function(eventName) {
                var VISIBILITY_CHANGE_SELECTOR = ".dx-visibility-change-handler";
                return function(element) {
                        var $element = $(element || "body");
                        var $changeHandlers = $element.find(VISIBILITY_CHANGE_SELECTOR).add($element.filter(VISIBILITY_CHANGE_SELECTOR));
                        $changeHandlers.each(function() {
                            $(this).triggerHandler(eventName)
                        })
                    }
            };
        DX.dataOptionsAttributeName = "data-options";
        var getElementOptions = function(element) {
                var optionsString = $(element).attr(DX.dataOptionsAttributeName),
                    result;
                if ($.trim(optionsString).charAt(0) !== "{")
                    optionsString = "{" + optionsString + "}";
                try {
                    result = new Function("return " + optionsString)()
                }
                catch(ex) {
                    throw DX.Error("E3018", ex, optionsString);
                }
                return result
            };
        var createComponents = function(elements, componentTypes) {
                var that = this,
                    result = [],
                    selector = "[" + DX.dataOptionsAttributeName + "]";
                elements.find(selector).addBack(selector).each(function(index, element) {
                    var $element = $(element),
                        options = getElementOptions(element);
                    for (var componentName in options)
                        if (!componentTypes || $.inArray(componentName, componentTypes) > -1)
                            if ($element[componentName]) {
                                $element[componentName](options[componentName]);
                                result.push($element[componentName]("instance"))
                            }
                });
                return result
            };
        var htmlToJQuery = function(htmlString) {
                htmlString = $.trim(htmlString);
                if (!htmlString.length)
                    return;
                if (htmlString[0] !== '<' || htmlString[htmlString.length - 1] !== '>')
                    htmlString = "<div>" + htmlString + "</div>";
                return $(htmlString)
            };
        var normalizeTemplateElement = function(element) {
                element = $(element);
                if (element.length && element[0].nodeName.toLowerCase() === "script")
                    element = htmlToJQuery(element.html());
                return element
            };
        var stringToJquery = function(string) {
                if (string == null)
                    string = "";
                if (string.nodeType || string.jquery)
                    return string;
                if (string[0] == "<")
                    return $(string);
                return $("<span>" + string + "</span>")
            };
        var clearSelection = function() {
                if (window.getSelection) {
                    if (window.getSelection().empty)
                        window.getSelection().empty();
                    else if (window.getSelection().removeAllRanges)
                        window.getSelection().removeAllRanges()
                }
                else if (document.selection)
                    document.selection.empty()
            };
        $.extend(DX.utils, {
            createResizeHandler: createResizeHandler,
            windowResizeCallbacks: windowResizeCallbacks,
            resetActiveElement: resetActiveElement,
            createMarkupFromString: createMarkupFromString,
            triggerShownEvent: triggerVisibilityChangeEvent("dxshown"),
            triggerHidingEvent: triggerVisibilityChangeEvent("dxhiding"),
            initMobileViewport: initMobileViewport,
            getElementOptions: getElementOptions,
            createComponents: createComponents,
            htmlToJQuery: htmlToJQuery,
            normalizeTemplateElement: normalizeTemplateElement,
            stringToJquery: stringToJquery,
            clearSelection: clearSelection
        });
        DX.utils.__timeRedrawOnResize = timeRedrawOnResize
    })(jQuery, DevExpress);
    /*! Module core, file utils.graphics.js */
    (function($, DX, undefined) {
        var isFunction = DX.utils.isFunction,
            _inArray = $.inArray,
            iDevice = /iphone|ipad/.test(navigator.userAgent.toLowerCase());
        var processSeriesTemplate = function(seriesTemplate, items) {
                var customizeSeries = isFunction(seriesTemplate.customizeSeries) ? seriesTemplate.customizeSeries : $.noop,
                    nameField = seriesTemplate.nameField || 'series',
                    generatedSeries = {},
                    seriesOrder = [],
                    series;
                for (var i = 0, length = items.length; i < length; i++) {
                    var data = items[i];
                    if (nameField in data) {
                        series = generatedSeries[data[nameField]];
                        if (!series) {
                            series = generatedSeries[data[nameField]] = {
                                name: data[nameField],
                                data: []
                            };
                            seriesOrder.push(series.name)
                        }
                        series.data.push(data)
                    }
                }
                return $.map(seriesOrder, function(orderedName) {
                        var group = generatedSeries[orderedName],
                            seriesOptions = customizeSeries.call(null, group.name);
                        return $.extend(group, seriesOptions)
                    })
            };
        var getNextDefsSvgId = function() {
                var numDefsSvgElements = 1;
                return function() {
                        return 'DevExpress_' + numDefsSvgElements++
                    }
            }();
        var getRootOffset = function(renderer) {
                var node,
                    result = {
                        left: 0,
                        top: 0
                    },
                    pointTransform,
                    root = renderer.root;
                if (root) {
                    node = root.element;
                    if (node.getScreenCTM && !iDevice) {
                        var ctm = node.getScreenCTM();
                        if (ctm) {
                            pointTransform = node.createSVGPoint().matrixTransform(ctm);
                            result.left = pointTransform.x + (document.body.scrollLeft || document.documentElement.scrollLeft);
                            result.top = pointTransform.y + (document.body.scrollTop || document.documentElement.scrollTop)
                        }
                        else {
                            result.left = document.body.scrollLeft || document.documentElement.scrollLeft;
                            result.top = document.body.scrollTop || document.documentElement.scrollTop
                        }
                    }
                    else
                        result = $(node).offset()
                }
                return result
            };
        var checkOverlapping = function(firstRect, secondRect) {
                return (firstRect.x <= secondRect.x && secondRect.x <= firstRect.x + firstRect.width || firstRect.x >= secondRect.x && firstRect.x <= secondRect.x + secondRect.width) && (firstRect.y <= secondRect.y && secondRect.y <= firstRect.y + firstRect.height || firstRect.y >= secondRect.y && firstRect.y <= secondRect.y + secondRect.height)
            };
        var getCategoriesInfo = function(categories, startValue, endValue) {
                if (!(categories && categories.length > 0 && startValue && endValue))
                    return {};
                var visibleCategories = [],
                    indexStartValue = _inArray(startValue, categories),
                    indexEndValue = _inArray(endValue, categories),
                    swapBuf,
                    i,
                    hasVisibleCategories,
                    inverted = false,
                    visibleCategoriesLen;
                indexStartValue < 0 && (indexStartValue = 0);
                indexEndValue < 0 && (indexEndValue = categories.length - 1);
                if (indexEndValue < indexStartValue) {
                    swapBuf = indexEndValue;
                    indexEndValue = indexStartValue;
                    indexStartValue = swapBuf;
                    inverted = true
                }
                visibleCategories = categories.slice(indexStartValue, indexEndValue + 1);
                visibleCategoriesLen = visibleCategories.length;
                hasVisibleCategories = visibleCategoriesLen > 0;
                return {
                        categories: hasVisibleCategories ? visibleCategories : null,
                        start: hasVisibleCategories ? visibleCategories[inverted ? visibleCategoriesLen - 1 : 0] : null,
                        end: hasVisibleCategories ? visibleCategories[inverted ? 0 : visibleCategoriesLen - 1] : null,
                        inverted: inverted
                    }
            };
        $.extend(DX.utils, {
            processSeriesTemplate: processSeriesTemplate,
            getNextDefsSvgId: getNextDefsSvgId,
            getRootOffset: getRootOffset,
            getCategoriesInfo: getCategoriesInfo,
            checkOverlapping: checkOverlapping
        })
    })(jQuery, DevExpress);
    /*! Module core, file utils.arrays.js */
    (function($, DX, undefined) {
        var wrapToArray = function(entity) {
                return $.isArray(entity) ? entity : [entity]
            };
        var removeDublicates = function(from, what) {
                if (!$.isArray(from) || from.length === 0)
                    return [];
                if (!$.isArray(what) || what.length === 0)
                    return from.slice();
                var result = [];
                $.each(from, function(_, value) {
                    var bIndex = $.inArray(value, what);
                    if (bIndex === -1)
                        result.push(value)
                });
                return result
            };
        $.extend(DX.utils, {
            wrapToArray: wrapToArray,
            removeDublicates: removeDublicates
        })
    })(jQuery, DevExpress);
    /*! Module core, file devices.js */
    (function($, DX, undefined) {
        var KNOWN_UA_TABLE = {
                iPhone: "iPhone",
                iPhone5: "iPhone",
                iPhone6: "iPhone",
                iPhone6plus: "iPhone",
                iPad: "iPad",
                iPadMini: "iPad Mini",
                androidPhone: "Android Mobile",
                androidTablet: "Android",
                win8: "MSAppHost",
                win8Phone: "Windows Phone 8",
                msSurface: "MSIE ARM Tablet PC",
                desktop: "desktop",
                tizen: "Tizen Mobile"
            };
        var DEFAULT_DEVICE = {
                deviceType: "",
                platform: "",
                version: [],
                phone: false,
                tablet: false,
                android: false,
                ios: false,
                win8: false,
                tizen: false,
                generic: false,
                mac: false
            };
        var GENERIC_DEVICE = $.extend(DEFAULT_DEVICE, {
                platform: "generic",
                deviceType: "desktop",
                generic: true
            });
        var uaParsers = {
                win8: function(userAgent) {
                    var isPhone = /windows phone/i.test(userAgent),
                        isTablet = !isPhone && /arm(.*)trident/i.test(userAgent),
                        isDesktop = !isPhone && !isTablet && /msapphost/i.test(userAgent);
                    if (!(isPhone || isTablet || isDesktop))
                        return;
                    var matches = userAgent.match(/windows phone (\d+).(\d+)/i) || userAgent.match(/windows nt (\d+).(\d+)/i),
                        version = matches ? [parseInt(matches[1], 10), parseInt(matches[2], 10)] : [];
                    return {
                            deviceType: isPhone ? "phone" : isTablet ? "tablet" : "desktop",
                            platform: "win8",
                            version: version
                        }
                },
                ios: function(userAgent) {
                    if (!/ip(hone|od|ad)/i.test(userAgent))
                        return;
                    var isPhone = /ip(hone|od)/i.test(userAgent);
                    var matches = userAgent.match(/os (\d+)_(\d+)_?(\d+)?/i);
                    var version = matches ? [parseInt(matches[1], 10), parseInt(matches[2], 10), parseInt(matches[3] || 0, 10)] : [];
                    return {
                            deviceType: isPhone ? "phone" : "tablet",
                            platform: "ios",
                            version: version
                        }
                },
                android: function(userAgent) {
                    if (!/android|htc_|silk/i.test(userAgent))
                        return;
                    var isPhone = /mobile/i.test(userAgent);
                    var matches = userAgent.match(/android (\d+)\.(\d+)\.?(\d+)?/i);
                    var version = matches ? [parseInt(matches[1], 10), parseInt(matches[2], 10), parseInt(matches[3] || 0, 10)] : [];
                    return {
                            deviceType: isPhone ? "phone" : "tablet",
                            platform: "android",
                            version: version
                        }
                },
                tizen: function(userAgent) {
                    if (!/tizen/i.test(userAgent))
                        return;
                    var isPhone = /mobile/i.test(userAgent);
                    var matches = userAgent.match(/tizen (\d+)\.(\d+)/i);
                    var version = matches ? [parseInt(matches[1], 10), parseInt(matches[2], 10)] : [];
                    return {
                            deviceType: isPhone ? "phone" : "tablet",
                            platform: "tizen",
                            version: version
                        }
                }
            };
        DX.Devices = DX.Class.inherit({
            ctor: function(options) {
                this._window = options && options.window || window;
                this._realDevice = this._getDevice();
                this._currentDevice = undefined;
                this._currentOrientation = undefined;
                this.orientationChanged = $.Callbacks();
                this._callbacksToEvents("Devices", ["orientationChanged"]);
                this._recalculateOrientation();
                DX.utils.windowResizeCallbacks.add($.proxy(this._recalculateOrientation, this))
            },
            current: function(deviceOrName) {
                if (deviceOrName) {
                    this._currentDevice = this._getDevice(deviceOrName);
                    DX.ui.themes.init({_autoInit: true})
                }
                else {
                    if (!this._currentDevice) {
                        deviceOrName = undefined;
                        try {
                            deviceOrName = this._getDeviceOrNameFromWindowScope()
                        }
                        catch(e) {
                            deviceOrName = this._getDeviceNameFromSessionStorage()
                        }
                        finally {
                            if (!deviceOrName)
                                deviceOrName = this._getDeviceNameFromSessionStorage()
                        }
                        this._currentDevice = this._getDevice(deviceOrName)
                    }
                    return this._currentDevice
                }
            },
            real: function() {
                var forceDevice = arguments[0];
                if ($.isPlainObject(forceDevice)) {
                    $.extend(this._realDevice, forceDevice);
                    return
                }
                return $.extend({}, this._realDevice)
            },
            orientation: function() {
                return this._currentOrientation
            },
            isRippleEmulator: function() {
                return !!this._window.tinyHippos
            },
            _getCssClasses: function(device) {
                var result = [];
                var realDevice = this._realDevice;
                device = device || this.current();
                if (device.deviceType)
                    result.push("dx-device-" + device.deviceType);
                result.push("dx-device-" + realDevice.platform);
                if (realDevice.version && realDevice.version.length)
                    result.push("dx-device-" + realDevice.platform + "-" + realDevice.version[0]);
                if (DX.devices.isSimulator())
                    result.push("dx-simulator");
                if (DX.rtlEnabled)
                    result.push("dx-rtl");
                return result
            },
            attachCssClasses: function(element, device) {
                $(element).addClass(this._getCssClasses(device).join(" "))
            },
            detachCssClasses: function(element, device) {
                $(element).removeClass(this._getCssClasses(device).join(" "))
            },
            isSimulator: function() {
                try {
                    return this._isSimulator || this._window.top !== this._window.self && this._window.top["dx-force-device"] || this.isRippleEmulator()
                }
                catch(e) {
                    return false
                }
            },
            forceSimulator: function() {
                this._isSimulator = true
            },
            _getDevice: function(deviceName) {
                if (deviceName === "genericPhone")
                    deviceName = {
                        deviceType: "phone",
                        platform: "generic",
                        generic: true
                    };
                if ($.isPlainObject(deviceName))
                    return this._fromConfig(deviceName);
                else {
                    var ua;
                    if (deviceName) {
                        ua = KNOWN_UA_TABLE[deviceName];
                        if (!ua)
                            throw DX.Error("E0005");
                    }
                    else
                        ua = navigator.userAgent;
                    return this._fromUA(ua)
                }
            },
            _getDeviceOrNameFromWindowScope: function() {
                var result;
                if (this._window.top["dx-force-device-object"] || this._window.top["dx-force-device"])
                    result = this._window.top["dx-force-device-object"] || this._window.top["dx-force-device"];
                return result
            },
            _getDeviceNameFromSessionStorage: function() {
                var sessionStorage = this._window.sessionStorage;
                if (!sessionStorage)
                    return;
                var deviceOrName = sessionStorage.getItem("dx-force-device");
                try {
                    var deviceObject = $.parseJSON(deviceOrName)
                }
                catch(ex) {
                    return deviceOrName
                }
                return deviceObject
            },
            _fromConfig: function(config) {
                var shortcuts = {
                        phone: config.deviceType === "phone",
                        tablet: config.deviceType === "tablet",
                        android: config.platform === "android",
                        ios: config.platform === "ios",
                        win8: config.platform === "win8",
                        tizen: config.platform === "tizen",
                        generic: config.platform === "generic"
                    };
                return $.extend({}, DEFAULT_DEVICE, this._currentDevice, shortcuts, config)
            },
            _fromUA: function(ua) {
                var config;
                $.each(uaParsers, function(platform, parser) {
                    config = parser(ua);
                    return !config
                });
                if (config)
                    return this._fromConfig(config);
                var isMac = /(mac os)/.test(ua.toLowerCase()),
                    deviceWithOS = DEFAULT_DEVICE;
                deviceWithOS.mac = isMac;
                return deviceWithOS
            },
            _changeOrientation: function() {
                var $window = $(this._window),
                    orientation = $window.height() > $window.width() ? "portrait" : "landscape";
                if (this._currentOrientation === orientation)
                    return;
                this._currentOrientation = orientation;
                this.orientationChanged.fire({orientation: orientation})
            },
            _recalculateOrientation: function() {
                var windowWidth = $(this._window).width();
                if (this._currentWidth === windowWidth)
                    return;
                this._currentWidth = windowWidth;
                this._changeOrientation()
            }
        }).include(DX.EventsMixin);
        DX.devices = new DX.Devices;
        DX.viewPortChanged.add(function(viewPort, prevViewport) {
            DX.devices.detachCssClasses(prevViewport);
            DX.devices.attachCssClasses(viewPort)
        })
    })(jQuery, DevExpress);
    /*! Module core, file browser.js */
    (function($, DX, global, undefined) {
        var webkitRegExp = /(webkit)[ \/]([\w.]+)/,
            operaRegExp = /(opera)(?:.*version)?[ \/]([\w.]+)/,
            ieRegExp = /(msie) (\d{1,2}\.\d)/,
            ie11RegExp = /(trident).*rv:(\d{1,2}\.\d)/,
            mozillaRegExp = /(mozilla)(?:.*? rv:([\w.]+))?/;
        var ua = navigator.userAgent.toLowerCase();
        var browser = function() {
                var result = {},
                    matches = webkitRegExp.exec(ua) || operaRegExp.exec(ua) || ieRegExp.exec(ua) || ie11RegExp.exec(ua) || ua.indexOf("compatible") < 0 && mozillaRegExp.exec(ua) || [],
                    browserName = matches[1],
                    browserVersion = matches[2];
                if (browserName === "trident")
                    browserName = "msie";
                if (browserName) {
                    result[browserName] = true;
                    result.version = browserVersion
                }
                return result
            }();
        DX.browser = browser
    })(jQuery, DevExpress, this);
    /*! Module core, file support.js */
    (function($, DX, window) {
        var jsPrefixes = ["", "Webkit", "Moz", "O", "ms"],
            cssPrefixes = {
                Webkit: "-webkit-",
                Moz: "-moz-",
                O: "-o-",
                ms: "-ms-"
            },
            styles = document.createElement("dx").style;
        var transitionEndEventNames = {
                WebkitTransition: 'webkitTransitionEnd',
                MozTransition: 'transitionend',
                OTransition: 'oTransitionEnd',
                msTransition: 'MsTransitionEnd',
                transition: 'transitionend'
            };
        var forEachPrefixes = function(prop, callBack) {
                prop = DX.inflector.camelize(prop, true);
                var result;
                for (var i = 0, cssPrefixesCount = jsPrefixes.length; i < cssPrefixesCount; i++) {
                    result = callBack(jsPrefixes[i] + prop, jsPrefixes[i]);
                    if (result)
                        return result
                }
            };
        var styleProp = function(prop) {
                return forEachPrefixes(prop, function(specific) {
                        if (specific in styles)
                            return specific
                    })
            };
        var stylePropPrefix = function(prop) {
                return forEachPrefixes(prop, function(specific, jsPrefix) {
                        if (specific in styles)
                            return cssPrefixes[jsPrefix]
                    }) || ""
            };
        var supportProp = function(prop) {
                return !!styleProp(prop)
            };
        var isNativeScrollingSupported = function(device) {
                var realDevice = DX.devices.real(),
                    realPlatform = realDevice.platform,
                    realVersion = realDevice.version,
                    isObsoleteAndroid = realVersion && realVersion[0] < 4 && realPlatform === "android",
                    isNativeScrollDevice = !isObsoleteAndroid && $.inArray(realPlatform, ["ios", "android", "win8"]) > -1 || realDevice.mac;
                return isNativeScrollDevice
            };
        DX.support = {
            touchEvents: "ontouchstart" in window,
            touch: "ontouchstart" in window || !!window.navigator.msMaxTouchPoints,
            pointer: window.navigator.pointerEnabled || window.navigator.msPointerEnabled,
            transform: supportProp("transform"),
            transition: supportProp("transition"),
            transitionEndEventName: transitionEndEventNames[styleProp("transition")],
            animation: supportProp("animation"),
            nativeScrolling: isNativeScrollingSupported(),
            winJS: "WinJS" in window,
            styleProp: styleProp,
            stylePropPrefix: stylePropPrefix,
            supportProp: supportProp,
            hasKo: !!window.ko,
            hasNg: !window.ko && !!window.angular,
            inputType: function(type) {
                if (type === "text")
                    return true;
                var input = document.createElement("input");
                try {
                    input.setAttribute("type", type);
                    input.value = "wrongValue";
                    return !input.value
                }
                catch(e) {
                    return false
                }
            }
        }
    })(jQuery, DevExpress, this);
    /*! Module core, file position.js */
    (function($, DX, undefined) {
        var horzRe = /left|right/,
            vertRe = /top|bottom/,
            collisionRe = /fit|flip|none/;
        var normalizeAlign = function(raw) {
                var result = {
                        h: "center",
                        v: "center"
                    };
                var pair = DX.utils.splitPair(raw);
                if (pair)
                    $.each(pair, function() {
                        var w = String(this).toLowerCase();
                        if (horzRe.test(w))
                            result.h = w;
                        else if (vertRe.test(w))
                            result.v = w
                    });
                return result
            };
        var normalizeOffset = function(raw) {
                return DX.utils.stringPairToObject(raw)
            };
        var normalizeCollision = function(raw) {
                var pair = DX.utils.splitPair(raw),
                    h = String(pair && pair[0]).toLowerCase(),
                    v = String(pair && pair[1]).toLowerCase();
                if (!collisionRe.test(h))
                    h = "none";
                if (!collisionRe.test(v))
                    v = h;
                return {
                        h: h,
                        v: v
                    }
            };
        var getAlignFactor = function(align) {
                switch (align) {
                    case"center":
                        return 0.5;
                    case"right":
                    case"bottom":
                        return 1;
                    default:
                        return 0
                }
            };
        var inverseAlign = function(align) {
                switch (align) {
                    case"left":
                        return "right";
                    case"right":
                        return "left";
                    case"top":
                        return "bottom";
                    case"bottom":
                        return "top";
                    default:
                        return align
                }
            };
        var calculateOversize = function(data, bounds) {
                var oversize = 0;
                if (data.myLocation < bounds.min)
                    oversize += bounds.min - data.myLocation;
                if (data.myLocation > bounds.max)
                    oversize += data.myLocation - bounds.max;
                return oversize
            };
        var initMyLocation = function(data) {
                data.myLocation = data.atLocation + getAlignFactor(data.atAlign) * data.atSize - getAlignFactor(data.myAlign) * data.mySize + data.offset
            };
        var decolliders = {
                fit: function(data, bounds) {
                    var result = false;
                    if (data.myLocation > bounds.max) {
                        data.myLocation = bounds.max;
                        result = true
                    }
                    if (data.myLocation < bounds.min) {
                        data.myLocation = bounds.min;
                        result = true
                    }
                    return result
                },
                flip: function(data, bounds) {
                    if (data.myAlign === "center" && data.atAlign === "center")
                        return false;
                    if (data.myLocation < bounds.min || data.myLocation > bounds.max) {
                        var inverseData = $.extend({}, data, {
                                myAlign: inverseAlign(data.myAlign),
                                atAlign: inverseAlign(data.atAlign),
                                offset: -data.offset
                            });
                        initMyLocation(inverseData);
                        inverseData.oversize = calculateOversize(inverseData, bounds);
                        if (inverseData.myLocation >= bounds.min && inverseData.myLocation <= bounds.max || inverseData.myLocation > data.myLocation || inverseData.oversize < data.oversize) {
                            data.myLocation = inverseData.myLocation;
                            data.oversize = inverseData.oversize;
                            return true
                        }
                    }
                    return false
                }
            };
        var scrollbarWidth;
        var defaultPositionResult = {
                h: {
                    location: 0,
                    flip: false,
                    fit: false,
                    oversize: 0
                },
                v: {
                    location: 0,
                    flip: false,
                    fit: false,
                    oversize: 0
                }
            };
        var calculatePosition = function(what, options) {
                var $what = $(what),
                    currentOffset = $what.offset(),
                    result = $.extend(true, {}, defaultPositionResult, {
                        h: {location: currentOffset.left},
                        v: {location: currentOffset.top}
                    });
                if (!options)
                    return result;
                var my = normalizeAlign(options.my),
                    at = normalizeAlign(options.at),
                    of = options.of || window,
                    offset = normalizeOffset(options.offset),
                    collision = normalizeCollision(options.collision),
                    boundary = options.boundary,
                    boundaryOffset = normalizeOffset(options.boundaryOffset);
                var h = {
                        mySize: $what.outerWidth(),
                        myAlign: my.h,
                        atAlign: at.h,
                        offset: offset.h,
                        collision: collision.h,
                        boundaryOffset: boundaryOffset.h
                    };
                var v = {
                        mySize: $what.outerHeight(),
                        myAlign: my.v,
                        atAlign: at.v,
                        offset: offset.v,
                        collision: collision.v,
                        boundaryOffset: boundaryOffset.v
                    };
                if (of.preventDefault) {
                    h.atLocation = of.pageX;
                    v.atLocation = of.pageY;
                    h.atSize = 0;
                    v.atSize = 0
                }
                else {
                    of = $(of);
                    if ($.isWindow(of[0])) {
                        h.atLocation = of.scrollLeft();
                        v.atLocation = of.scrollTop();
                        h.atSize = of.width();
                        v.atSize = of.height()
                    }
                    else if (of[0].nodeType === 9) {
                        h.atLocation = 0;
                        v.atLocation = 0;
                        h.atSize = of.width();
                        v.atSize = of.height()
                    }
                    else {
                        var o = of.offset();
                        h.atLocation = o.left;
                        v.atLocation = o.top;
                        h.atSize = of.outerWidth();
                        v.atSize = of.outerHeight()
                    }
                }
                initMyLocation(h);
                initMyLocation(v);
                var bounds = function() {
                        var win = $(window),
                            windowWidth = win.width(),
                            windowHeight = win.height(),
                            left = win.scrollLeft(),
                            top = win.scrollTop(),
                            hScrollbar = document.width > document.documentElement.clientWidth,
                            vScrollbar = document.height > document.documentElement.clientHeight,
                            hZoomLevel = DX.support.touch ? document.documentElement.clientWidth / (vScrollbar ? windowWidth - scrollbarWidth : windowWidth) : 1,
                            vZoomLevel = DX.support.touch ? document.documentElement.clientHeight / (hScrollbar ? windowHeight - scrollbarWidth : windowHeight) : 1;
                        if (scrollbarWidth === undefined)
                            scrollbarWidth = calculateScrollbarWidth();
                        var boundaryWidth = windowWidth,
                            boundaryHeight = windowHeight;
                        if (boundary) {
                            var $boundary = $(boundary),
                                boundaryPosition = $boundary.offset();
                            left += boundaryPosition.left;
                            top += boundaryPosition.top;
                            boundaryWidth = $boundary.width();
                            boundaryHeight = $boundary.height()
                        }
                        return {
                                h: {
                                    min: left + h.boundaryOffset,
                                    max: left + boundaryWidth / hZoomLevel - h.mySize - h.boundaryOffset
                                },
                                v: {
                                    min: top + v.boundaryOffset,
                                    max: top + boundaryHeight / vZoomLevel - v.mySize - v.boundaryOffset
                                }
                            }
                    }();
                h.oversize = calculateOversize(h, bounds.h);
                v.oversize = calculateOversize(v, bounds.v);
                if (decolliders[h.collision])
                    result.h[h.collision] = decolliders[h.collision](h, bounds.h);
                if (decolliders[v.collision])
                    result.v[v.collision] = decolliders[v.collision](v, bounds.v);
                $.extend(true, result, {
                    h: {
                        location: Math.round(h.myLocation),
                        oversize: Math.round(h.oversize)
                    },
                    v: {
                        location: Math.round(v.myLocation),
                        oversize: Math.round(v.oversize)
                    }
                });
                return result
            };
        var position = function(what, options) {
                var $what = $(what);
                if (!options)
                    return $what.offset();
                DX.translator.resetPosition($what);
                var offset = $what.offset(),
                    targetPosition = options.h && options.v ? options : calculatePosition($what, options);
                DX.translator.move($what, {
                    left: Math.round(targetPosition.h.location - offset.left),
                    top: Math.round(targetPosition.v.location - offset.top)
                });
                return targetPosition
            };
        $.extend(DX, {
            calculatePosition: calculatePosition,
            position: position,
            inverseAlign: inverseAlign
        });
        var calculateScrollbarWidth = function() {
                var $scrollDiv = $("<div>").css({
                        width: 100,
                        height: 100,
                        overflow: "scroll",
                        position: "absolute",
                        top: -9999
                    }).appendTo($("body")),
                    result = $scrollDiv.get(0).offsetWidth - $scrollDiv.get(0).clientWidth;
                $scrollDiv.remove();
                return result
            }
    })(jQuery, DevExpress);
    /*! Module core, file action.js */
    (function($, DX, undefined) {
        var actionExecutors = {};
        var registerExecutor = function(name, executor) {
                if ($.isPlainObject(name)) {
                    $.each(name, registerExecutor);
                    return
                }
                actionExecutors[name] = executor
            };
        var unregisterExecutor = function(name) {
                var args = $.makeArray(arguments);
                $.each(args, function() {
                    delete actionExecutors[this]
                })
            };
        registerExecutor({
            func: {execute: function(e) {
                    if ($.isFunction(e.action)) {
                        e.result = e.action.apply(e.context, e.args);
                        e.handled = true
                    }
                }},
            url: {execute: function(e) {
                    if (typeof e.action === "string" && e.action.charAt(0) !== "#")
                        document.location = e.action
                }},
            hash: {execute: function(e) {
                    if (typeof e.action === "string" && e.action.charAt(0) === "#")
                        document.location.hash = e.action
                }}
        });
        var Action = DX.Class.inherit({
                ctor: function(action, config) {
                    config = config || {};
                    this._action = action || $.noop;
                    this._context = config.context || window;
                    this._beforeExecute = config.beforeExecute || $.noop;
                    this._afterExecute = config.afterExecute || $.noop;
                    this._component = config.component;
                    this._excludeValidators = config.excludeValidators;
                    this._validatingTargetName = config.validatingTargetName
                },
                execute: function() {
                    var e = {
                            action: this._action,
                            args: Array.prototype.slice.call(arguments),
                            context: this._context,
                            component: this._component,
                            validatingTargetName: this._validatingTargetName,
                            cancel: false,
                            handled: false
                        };
                    if (!this._validateAction(e))
                        return;
                    this._beforeExecute.call(this._context, e);
                    if (e.cancel)
                        return;
                    var result = this._executeAction(e);
                    this._afterExecute.call(this._context, e);
                    return result
                },
                _validateAction: function(e) {
                    var excludeValidators = this._excludeValidators;
                    $.each(actionExecutors, function(name, executor) {
                        if (excludeValidators && $.inArray(name, excludeValidators) > -1)
                            return;
                        if (executor.validate)
                            executor.validate(e);
                        if (e.cancel)
                            return false
                    });
                    return !e.cancel
                },
                _executeAction: function(e) {
                    var result;
                    $.each(actionExecutors, function(index, executor) {
                        if (executor.execute)
                            executor.execute(e);
                        if (e.handled) {
                            result = e.result;
                            return false
                        }
                    });
                    return result
                }
            });
        $.extend(DX, {
            registerActionExecutor: registerExecutor,
            unregisterActionExecutor: unregisterExecutor,
            Action: Action
        });
        DX.__internals = {actionExecutors: actionExecutors}
    })(jQuery, DevExpress);
    /*! Module core, file translator.js */
    (function($, DX, undefined) {
        var support = DX.support,
            TRANSLATOR_DATA_KEY = "dxTranslator",
            TRANSFORM_MATRIX_REGEX = /matrix(3d)?\((.+?)\)/,
            TRANSLATE_REGEX = /translate(?:3d)?\((.+?)\)/;
        var locate = function($element) {
                var translate = support.transform ? getTranslate($element) : getTranslateFallback($element);
                return {
                        left: translate.x,
                        top: translate.y
                    }
            };
        var move = function($element, position) {
                if (!support.transform) {
                    $element.css(position);
                    return
                }
                var translate = getTranslate($element),
                    left = position.left,
                    top = position.top;
                if (left !== undefined)
                    translate.x = left || 0;
                if (top !== undefined)
                    translate.y = top || 0;
                $element.css({transform: getTranslateCss(translate)});
                if (isPersentValue(left) || isPersentValue(top))
                    clearCache($element)
            };
        var isPersentValue = function(value) {
                return $.type(value) === "string" && value[value.length - 1] === "%"
            };
        var getTranslateFallback = function($element) {
                var result;
                try {
                    var originalTop = $element.css("top"),
                        originalLeft = $element.css("left");
                    var position = $element.position();
                    $element.css({
                        transform: "none",
                        top: 0,
                        left: 0
                    });
                    clearCache($element);
                    var finalPosition = $element.position();
                    result = {
                        x: position.left - finalPosition.left || parseInt(originalLeft) || 0,
                        y: position.top - finalPosition.top || parseInt(originalTop) || 0
                    };
                    $element.css({
                        top: originalTop,
                        left: originalLeft
                    })
                }
                catch(e) {
                    result = {
                        x: 0,
                        y: 0
                    }
                }
                return result
            };
        var getTranslate = function($element) {
                var result = $element.data(TRANSLATOR_DATA_KEY);
                if (!result) {
                    var transformValue = $element.css("transform") || getTranslateCss({
                            x: 0,
                            y: 0
                        }),
                        matrix = transformValue.match(TRANSFORM_MATRIX_REGEX),
                        is3D = matrix && matrix[1];
                    if (matrix) {
                        matrix = matrix[2].split(",");
                        if (is3D === "3d")
                            matrix = matrix.slice(12, 15);
                        else {
                            matrix.push(0);
                            matrix = matrix.slice(4, 7)
                        }
                    }
                    else
                        matrix = [0, 0, 0];
                    result = {
                        x: parseFloat(matrix[0]),
                        y: parseFloat(matrix[1]),
                        z: parseFloat(matrix[2])
                    };
                    cacheTranslate($element, result)
                }
                return result
            };
        var cacheTranslate = function($element, translate) {
                $element.data(TRANSLATOR_DATA_KEY, translate)
            };
        var clearCache = function($element) {
                $element.removeData(TRANSLATOR_DATA_KEY)
            };
        var resetPosition = function($element) {
                $element.css({
                    left: 0,
                    top: 0,
                    transform: "none"
                });
                clearCache($element)
            };
        var parseTranslate = function(translateString) {
                var result = translateString.match(TRANSLATE_REGEX);
                if (!result || !result[1])
                    return;
                result = result[1].split(",");
                result = {
                    x: parseFloat(result[0]),
                    y: parseFloat(result[1]),
                    z: parseFloat(result[2])
                };
                return result
            };
        var getTranslateCss = function(translate) {
                translate.x = translate.x || 0;
                translate.y = translate.y || 0;
                var xValueString = isPersentValue(translate.x) ? translate.x : translate.x + "px";
                var yValueString = isPersentValue(translate.y) ? translate.y : translate.y + "px";
                return "translate(" + xValueString + ", " + yValueString + ")"
            };
        DX.translator = {
            move: move,
            locate: locate,
            clearCache: clearCache,
            parseTranslate: parseTranslate,
            getTranslate: getTranslate,
            getTranslateCss: getTranslateCss,
            resetPosition: resetPosition
        }
    })(jQuery, DevExpress);
    /*! Module core, file animationFrame.js */
    (function($, DX, undefined) {
        var FRAME_ANIMATION_STEP_TIME = 1000 / 60,
            requestAnimationFrame = function(callback) {
                return this.setTimeout(callback, FRAME_ANIMATION_STEP_TIME)
            },
            cancelAnimationFrame = function(requestID) {
                this.clearTimeout(requestID)
            },
            nativeRequestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame,
            nativeCancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame;
        if (nativeRequestAnimationFrame && nativeCancelAnimationFrame) {
            requestAnimationFrame = nativeRequestAnimationFrame;
            cancelAnimationFrame = nativeCancelAnimationFrame
        }
        if (nativeRequestAnimationFrame && !nativeCancelAnimationFrame) {
            var cancelledRequests = {};
            requestAnimationFrame = function(callback) {
                var requestId = nativeRequestAnimationFrame.call(window, function() {
                        try {
                            if (requestId in cancelledRequests)
                                return;
                            callback.apply(this, arguments)
                        }
                        finally {
                            delete cancelledRequests[requestId]
                        }
                    });
                return requestId
            };
            cancelAnimationFrame = function(requestId) {
                cancelledRequests[requestId] = true
            }
        }
        requestAnimationFrame = $.proxy(requestAnimationFrame, window);
        cancelAnimationFrame = $.proxy(cancelAnimationFrame, window);
        $.extend(DX, {
            requestAnimationFrame: requestAnimationFrame,
            cancelAnimationFrame: cancelAnimationFrame
        })
    })(jQuery, DevExpress);
    /*! Module core, file animator.js */
    (function($, DX, undefined) {
        DX.Animator = DX.Class.inherit({
            ctor: function() {
                this._finished = true;
                this._stopped = false
            },
            start: function() {
                this._stopped = false;
                this._finished = false;
                this._stepCore()
            },
            stop: function() {
                this._stopped = true
            },
            _stepCore: function() {
                if (this._isStopped()) {
                    this._stop();
                    return
                }
                if (this._isFinished()) {
                    this._finished = true;
                    this._complete();
                    return
                }
                this._step();
                DX.requestAnimationFrame.call(window, $.proxy(this._stepCore, this))
            },
            _step: DX.abstract,
            _isFinished: $.noop,
            _stop: $.noop,
            _complete: $.noop,
            _isStopped: function() {
                return this._stopped
            },
            inProgress: function() {
                return !(this._stopped || this._finished)
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file fx.js */
    (function($, DX, undefined) {
        var translator = DX.translator,
            support = DX.support,
            transitionEndEventName = support.transitionEndEventName + ".dxFX";
        var CSS_TRANSITION_EASING_REGEX = /cubic-bezier\((\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\)/,
            RELATIVE_VALUE_REGEX = /^([+-])=(.*)/i,
            ANIM_DATA_KEY = "dxAnimData",
            ANIM_QUEUE_KEY = "dxAnimQueue",
            TRANSFORM_PROP = "transform";
        var TransitionAnimationStrategy = {
                animate: function($element, config) {
                    var that = this,
                        deferred = $.Deferred();
                    config.transitionAnimation = {finish: function() {
                            that._cleanup($element, config);
                            deferred.resolveWith($element, [config, $element])
                        }};
                    this._startAnimation($element, config);
                    this._completeAnimationCallback($element, config).done(function() {
                        config.transitionAnimation.finish()
                    });
                    if (!config.duration)
                        config.transitionAnimation.finish();
                    return deferred.promise()
                },
                _completeAnimationCallback: function($element, config) {
                    var startTime = $.now() + config.delay,
                        deferred = $.Deferred(),
                        transitionEndFired = $.Deferred(),
                        simulatedTransitionEndFired = $.Deferred();
                    $element.one(transitionEndEventName, function(e) {
                        if ($.now() - startTime >= config.duration)
                            transitionEndFired.reject()
                    });
                    config.transitionAnimation.simulatedEndEventTimer = setTimeout(function() {
                        simulatedTransitionEndFired.reject()
                    }, config.duration + config.delay);
                    $.when(transitionEndFired, simulatedTransitionEndFired).fail($.proxy(function() {
                        deferred.resolve()
                    }, this));
                    return deferred.promise()
                },
                _startAnimation: function($element, config) {
                    $element.css("transform");
                    $element.css({
                        transitionProperty: "all",
                        transitionDelay: config.delay + "ms",
                        transitionDuration: config.duration + "ms",
                        transitionTimingFunction: config.easing
                    });
                    setProps($element, config.to)
                },
                _cleanup: function($element, config) {
                    $element.css("transition", "none").off(transitionEndEventName);
                    clearTimeout(config.transitionAnimation.simulatedEndEventTimer)
                },
                stop: function($element, config, jumpToEnd) {
                    if (!config)
                        return;
                    if (jumpToEnd)
                        config.transitionAnimation.finish();
                    else {
                        $.each(config.to, function(key) {
                            $element.css(key, $element.css(key))
                        });
                        this._cleanup($element, config)
                    }
                }
            };
        var FrameAnimationStrategy = {
                animate: function($element, config) {
                    var deferred = $.Deferred(),
                        that = this;
                    if (!config)
                        return deferred.reject().promise();
                    $.each(config.to, function(prop) {
                        if (config.from[prop] === undefined)
                            config.from[prop] = that._normalizeValue($element.css(prop))
                    });
                    if (config.to[TRANSFORM_PROP]) {
                        config.from[TRANSFORM_PROP] = that._parseTransform(config.from[TRANSFORM_PROP]);
                        config.to[TRANSFORM_PROP] = that._parseTransform(config.to[TRANSFORM_PROP])
                    }
                    config.frameAnimation = {
                        to: config.to,
                        from: config.from,
                        currentValue: config.from,
                        easing: convertTransitionTimingFuncToJQueryEasing(config.easing),
                        duration: config.duration,
                        startTime: (new Date).valueOf(),
                        finish: function() {
                            this.currentValue = this.to;
                            this.draw();
                            deferred.resolve()
                        },
                        draw: function() {
                            var currentValue = $.extend({}, this.currentValue);
                            if (currentValue[TRANSFORM_PROP])
                                currentValue[TRANSFORM_PROP] = $.map(currentValue[TRANSFORM_PROP], function(value, prop) {
                                    if (prop === "translate")
                                        return translator.getTranslateCss(value);
                                    else if (prop === "scale")
                                        return "scale(" + value + ")";
                                    else if (prop.substr(0, prop.length - 1) === "rotate")
                                        return prop + "(" + value + "deg)"
                                }).join(" ");
                            $element.css(currentValue)
                        }
                    };
                    if (config.delay) {
                        config.frameAnimation.startTime += config.delay;
                        config.frameAnimation.delayTimeout = setTimeout(function() {
                            that._animationStep($element, config)
                        }, config.delay)
                    }
                    else
                        that._animationStep($element, config);
                    return deferred.promise()
                },
                _parseTransform: function(transformString) {
                    var result = {};
                    $.each(transformString.match(/(\w|\d)+\([^\)]*\)\s*/g), function(i, part) {
                        var translateData = translator.parseTranslate(part),
                            scaleData = part.match(/scale\((.+?)\)/),
                            rotateData = part.match(/(rotate.)\((.+)deg\)/);
                        if (translateData)
                            result.translate = translateData;
                        if (scaleData && scaleData[1])
                            result.scale = parseFloat(scaleData[1]);
                        if (rotateData && rotateData[1])
                            result[rotateData[1]] = parseFloat(rotateData[2])
                    });
                    return result
                },
                stop: function($element, config, jumpToEnd) {
                    var frameAnimation = config && config.frameAnimation;
                    if (!frameAnimation)
                        return;
                    clearTimeout(frameAnimation.delayTimeout);
                    if (jumpToEnd)
                        frameAnimation.finish();
                    delete config.frameAnimation
                },
                _animationStep: function($element, config) {
                    var frameAnimation = config && config.frameAnimation;
                    if (!frameAnimation)
                        return;
                    var now = (new Date).valueOf();
                    if (now >= frameAnimation.startTime + frameAnimation.duration) {
                        frameAnimation.finish();
                        return
                    }
                    frameAnimation.currentValue = this._calcStepValue(frameAnimation, now - frameAnimation.startTime);
                    frameAnimation.draw();
                    DX.requestAnimationFrame($.proxy(function() {
                        this._animationStep($element, config)
                    }, this))
                },
                _calcStepValue: function(frameAnimation, currentDuration) {
                    var calcValueRecursively = function(from, to) {
                            var result = $.isArray(to) ? [] : {};
                            var calcEasedValue = function(propName) {
                                    var x = currentDuration / frameAnimation.duration,
                                        t = currentDuration,
                                        b = 1 * from[propName],
                                        c = to[propName] - from[propName],
                                        d = frameAnimation.duration;
                                    return $.easing[frameAnimation.easing](x, t, b, c, d)
                                };
                            $.each(to, function(propName, endPropValue) {
                                if (typeof endPropValue === "string" && parseFloat(endPropValue, 10) === false)
                                    return true;
                                result[propName] = typeof endPropValue === "object" ? calcValueRecursively(from[propName], endPropValue) : calcEasedValue(propName)
                            });
                            return result
                        };
                    return calcValueRecursively(frameAnimation.from, frameAnimation.to)
                },
                _normalizeValue: function(value) {
                    var numericValue = parseFloat(value, 10);
                    if (numericValue === false)
                        return value;
                    return numericValue
                }
            };
        var animationStrategies = {
                transition: support.transition ? TransitionAnimationStrategy : FrameAnimationStrategy,
                frame: FrameAnimationStrategy
            };
        var getAnimationStrategy = function(config) {
                return animationStrategies[config && config.strategy || "transition"]
            };
        var TransitionTimingFuncMap = {
                linear: "cubic-bezier(0, 0, 1, 1)",
                ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
                "ease-in": "cubic-bezier(0.42, 0, 1, 1)",
                "ease-out": "cubic-bezier(0, 0, 0.58, 1)",
                "ease-in-out": "cubic-bezier(0.42, 0, 0.58, 1)"
            };
        var convertTransitionTimingFuncToJQueryEasing = function(cssTransitionEasing) {
                cssTransitionEasing = TransitionTimingFuncMap[cssTransitionEasing] || cssTransitionEasing;
                var bezCoeffs = cssTransitionEasing.match(CSS_TRANSITION_EASING_REGEX);
                if (!bezCoeffs)
                    return "linear";
                bezCoeffs = bezCoeffs.slice(1, 5);
                $.each(bezCoeffs, function(index, value) {
                    bezCoeffs[index] = parseFloat(value)
                });
                var easingName = "cubicbezier_" + bezCoeffs.join("_").replace(/\./g, "p");
                if (!$.isFunction($.easing[easingName])) {
                    var polynomBezier = function(x1, y1, x2, y2) {
                            var Cx = 3 * x1,
                                Bx = 3 * (x2 - x1) - Cx,
                                Ax = 1 - Cx - Bx,
                                Cy = 3 * y1,
                                By = 3 * (y2 - y1) - Cy,
                                Ay = 1 - Cy - By;
                            var bezierX = function(t) {
                                    return t * (Cx + t * (Bx + t * Ax))
                                };
                            var bezierY = function(t) {
                                    return t * (Cy + t * (By + t * Ay))
                                };
                            var findXfor = function(t) {
                                    var x = t,
                                        i = 0,
                                        z;
                                    while (i < 14) {
                                        z = bezierX(x) - t;
                                        if (Math.abs(z) < 1e-3)
                                            break;
                                        x = x - z / derivativeX(x);
                                        i++
                                    }
                                    return x
                                };
                            var derivativeX = function(t) {
                                    return Cx + t * (2 * Bx + t * 3 * Ax)
                                };
                            return function(t) {
                                    return bezierY(findXfor(t))
                                }
                        };
                    $.easing[easingName] = function(x, t, b, c, d) {
                        return c * polynomBezier(bezCoeffs[0], bezCoeffs[1], bezCoeffs[2], bezCoeffs[3])(t / d) + b
                    }
                }
                return easingName
            };
        var baseConfigValidator = function(config, animationType) {
                $.each(["from", "to"], function() {
                    if (!$.isPlainObject(config[this]))
                        throw DX.Error("E0010", animationType, this);
                })
            };
        var CustomAnimationConfigurator = {setup: function($element, config){}};
        var positionAliases = {
                top: {
                    my: "bottom center",
                    at: "top center"
                },
                bottom: {
                    my: "top center",
                    at: "bottom center"
                },
                right: {
                    my: "left center",
                    at: "right center"
                },
                left: {
                    my: "right center",
                    at: "left center"
                }
            };
        var SlideAnimationConfigurator = {
                validateConfig: function(config) {
                    baseConfigValidator(config, "slide")
                },
                setup: function($element, config) {
                    var location = translator.locate($element);
                    if (config.type !== "slide") {
                        var positioningConfig = config.type === "slideIn" ? config.from : config.to;
                        positioningConfig.position = $.extend({of: window}, positionAliases[config.direction]);
                        setupPosition($element, positioningConfig)
                    }
                    this._setUpConfig(location, config.from);
                    this._setUpConfig(location, config.to);
                    translator.clearCache($element);
                    if (!support.transform && $element.css("position") === "static")
                        $element.css("position", "relative")
                },
                _setUpConfig: function(location, config) {
                    config.left = "left" in config ? config.left : "+=0";
                    config.top = "top" in config ? config.top : "+=0";
                    this._initNewPosition(location, config)
                },
                _initNewPosition: function(location, config) {
                    var position = {
                            left: config.left,
                            top: config.top
                        };
                    delete config.left;
                    delete config.top;
                    var relativeValue = this._getRelativeValue(position.left);
                    if (relativeValue !== undefined)
                        position.left = relativeValue + location.left;
                    else
                        config.left = 0;
                    relativeValue = this._getRelativeValue(position.top);
                    if (relativeValue !== undefined)
                        position.top = relativeValue + location.top;
                    else
                        config.top = 0;
                    var translate = {
                            x: 0,
                            y: 0
                        };
                    if (support.transform)
                        translate = {
                            x: position.left,
                            y: position.top
                        };
                    else {
                        config.left = position.left;
                        config.top = position.top
                    }
                    config[TRANSFORM_PROP] = translator.getTranslateCss(translate)
                },
                _getRelativeValue: function(value) {
                    var relativeValue;
                    if (typeof value === "string" && (relativeValue = RELATIVE_VALUE_REGEX.exec(value)))
                        return parseInt(relativeValue[1] + "1") * relativeValue[2]
                }
            };
        var FadeAnimationConfigurator = {setup: function($element, config) {
                    var from = config.from,
                        fromOpacity = $.isPlainObject(from) ? $element.css("opacity") : String(from),
                        toOpacity;
                    switch (config.type) {
                        case"fadeIn":
                            toOpacity = 1;
                            break;
                        case"fadeOut":
                            toOpacity = 0;
                            break;
                        default:
                            toOpacity = String(config.to)
                    }
                    config.from = {
                        visibility: "visible",
                        opacity: fromOpacity
                    };
                    config.to = {opacity: toOpacity}
                }};
        var PopAnimationConfigurator = {
                validateConfig: function(config) {
                    baseConfigValidator(config, "pop")
                },
                setup: function($element, config) {
                    var from = config.from,
                        to = config.to,
                        fromOpacity = "opacity" in from ? from.opacity : $element.css("opacity"),
                        toOpacity = "opacity" in to ? to.opacity : 1,
                        fromScale = "scale" in from ? from.scale : 0,
                        toScale = "scale" in to ? to.scale : 1;
                    config.from = {opacity: fromOpacity};
                    var translate = translator.getTranslate($element);
                    config.from[TRANSFORM_PROP] = this._getCssTransform(translate, fromScale);
                    config.to = {opacity: toOpacity};
                    config.to[TRANSFORM_PROP] = this._getCssTransform(translate, toScale)
                },
                _getCssTransform: function(translate, scale) {
                    return translator.getTranslateCss(translate) + "scale(" + scale + ")"
                }
            };
        var animationConfigurators = {
                custom: CustomAnimationConfigurator,
                slide: SlideAnimationConfigurator,
                slideIn: SlideAnimationConfigurator,
                slideOut: SlideAnimationConfigurator,
                fade: FadeAnimationConfigurator,
                fadeIn: FadeAnimationConfigurator,
                fadeOut: FadeAnimationConfigurator,
                pop: PopAnimationConfigurator
            };
        var getAnimationConfigurator = function(type) {
                var result = animationConfigurators[type];
                if (!result)
                    throw DX.Error("E0011", type);
                return result
            };
        var defaultConfig = {
                type: "custom",
                from: {},
                to: {},
                duration: 400,
                start: $.noop,
                complete: $.noop,
                easing: "ease",
                delay: 0
            };
        var animate = function(element, config) {
                var $element = $(element);
                config = $.extend(true, {}, defaultConfig, config);
                if (!$element.length)
                    return $.Deferred().resolve().promise();
                var configurator = getAnimationConfigurator(config.type);
                if ($.isFunction(configurator.validateConfig))
                    configurator.validateConfig(config);
                return pushInAnimationQueue($element, config)
            };
        var pushInAnimationQueue = function($element, config) {
                config.deferred = config.deferred || $.Deferred();
                var queueData = getAnimQueueData($element);
                writeAnimQueueData($element, queueData);
                queueData.push(config);
                if (!isAnimating($element))
                    shiftFromAnimationQueue($element, queueData);
                return config.deferred.promise()
            };
        var getAnimQueueData = function($element) {
                return $element.data(ANIM_QUEUE_KEY) || []
            };
        var writeAnimQueueData = function($element, queueData) {
                $element.data(ANIM_QUEUE_KEY, queueData)
            };
        var destroyAnimQueueData = function($element) {
                $element.removeData(ANIM_QUEUE_KEY)
            };
        var isAnimating = function($element) {
                return !!$element.data(ANIM_DATA_KEY)
            };
        var shiftFromAnimationQueue = function($element, queueData) {
                var queueData = getAnimQueueData($element);
                if (!queueData.length)
                    return;
                var config = queueData.shift();
                if (queueData.length === 0)
                    destroyAnimQueueData($element);
                executeAnimation($element, config).done(function() {
                    shiftFromAnimationQueue($element)
                })
            };
        var executeAnimation = function($element, config) {
                setupPosition($element, config.from);
                setupPosition($element, config.to);
                var configurator = getAnimationConfigurator(config.type);
                configurator.setup($element, config);
                $element.data(ANIM_DATA_KEY, config);
                if (DX.fx.off)
                    config.duration = 0;
                setProps($element, config.from);
                config.start.apply(this, [$element, config]);
                return getAnimationStrategy(config).animate($element, config).done(function() {
                        $element.removeData(ANIM_DATA_KEY);
                        config.complete.apply(this, [$element, config]);
                        config.deferred.resolveWith(this, [$element, config])
                    })
            };
        var setupPosition = function($element, config) {
                if (!config.position)
                    return;
                var position = DX.calculatePosition($element, config.position),
                    offset = $element.offset(),
                    currentPosition = $element.position();
                $.extend(config, {
                    left: position.h.location - offset.left + currentPosition.left,
                    top: position.v.location - offset.top + currentPosition.top
                });
                delete config.position
            };
        var setProps = function($element, props) {
                $.each(props, function(key, value) {
                    $element.css(key, value)
                })
            };
        var stop = function(element, jumpToEnd) {
                var $element = $(element),
                    queueData = getAnimQueueData($element);
                $.each(queueData, function(_, config) {
                    config.duration = 0
                });
                if (!isAnimating($element))
                    shiftFromAnimationQueue($element, queueData);
                var config = $element.data(ANIM_DATA_KEY);
                getAnimationStrategy(config).stop($element, config, jumpToEnd);
                $element.removeData(ANIM_DATA_KEY);
                destroyAnimQueueData($element)
            };
        DX.fx = {
            off: false,
            animationTypes: animationConfigurators,
            animate: animate,
            isAnimating: isAnimating,
            stop: stop
        };
        DX.fx.__internals = {convertTransitionTimingFuncToJQueryEasing: convertTransitionTimingFuncToJQueryEasing}
    })(jQuery, DevExpress);
    /*! Module core, file endpointSelector.js */
    (function($, DX, undefined) {
        var location = window.location,
            DXPROXY_HOST = "dxproxy.devexpress.com:8000",
            IS_WINJS_ORIGIN = location.protocol === "ms-appx:",
            IS_DXPROXY_ORIGIN = location.host === DXPROXY_HOST,
            IS_LOCAL_ORIGIN = isLocalHostName(location.hostname);
        function isLocalHostName(url) {
            return /^(localhost$|127\.)/i.test(url)
        }
        var extractProxyAppId = function() {
                return location.pathname.split("/")[1]
            };
        var formatProxyUrl = function(localUrl) {
                var urlData = DX.parseUrl(localUrl);
                if (!isLocalHostName(urlData.hostname))
                    return localUrl;
                return "http://" + DXPROXY_HOST + "/" + extractProxyAppId() + "_" + urlData.port + urlData.pathname + urlData.search
            };
        var EndpointSelector = DX.EndpointSelector = function(config) {
                this.config = config
            };
        EndpointSelector.prototype = {urlFor: function(key) {
                var bag = this.config[key];
                if (!bag)
                    throw DX.Error("E0006");
                if (IS_DXPROXY_ORIGIN)
                    return formatProxyUrl(bag.local);
                if (bag.production)
                    if (IS_WINJS_ORIGIN && !Debug.debuggerEnabled || !IS_WINJS_ORIGIN && !IS_LOCAL_ORIGIN)
                        return bag.production;
                return bag.local
            }}
    })(jQuery, DevExpress);
    /*! Module core, file formatHelper.js */
    (function($, DX, undefined) {
        var utils = DX.utils;
        DX.NumericFormat = {
            currency: 'C',
            fixedpoint: 'N',
            exponential: '',
            percent: 'P',
            decimal: 'D'
        };
        DX.LargeNumberFormatPostfixes = {
            1: 'K',
            2: 'M',
            3: 'B',
            4: 'T'
        };
        var MAX_LARGE_NUMBER_POWER = 4,
            DECIMAL_BASE = 10;
        DX.LargeNumberFormatPowers = {
            largenumber: 'auto',
            thousands: 1,
            millions: 2,
            billions: 3,
            trillions: 4
        };
        DX.DateTimeFormat = {
            longdate: 'D',
            longtime: 'T',
            monthandday: 'M',
            monthandyear: 'Y',
            quarterandyear: 'qq',
            shortdate: 'd',
            shorttime: 't',
            millisecond: 'fff',
            second: 'T',
            minute: 't',
            hour: 't',
            day: 'dd',
            week: 'dd',
            month: 'MMMM',
            quarter: 'qq',
            year: 'yyyy',
            longdatelongtime: 'D',
            shortdateshorttime: 'd',
            shortyear: 'yy'
        };
        DX.formatHelper = {
            defaultQuarterFormat: 'Q{0}',
            romanDigits: ['I', 'II', 'III', 'IV'],
            _addFormatSeparator: function(format1, format2) {
                var separator = ' ';
                if (format2)
                    return format1 + separator + format2;
                return format1
            },
            _getDateTimeFormatPattern: function(dateTimeFormat) {
                return Globalize.findClosestCulture().calendar.patterns[DX.DateTimeFormat[dateTimeFormat.toLowerCase()]]
            },
            _isDateFormatContains: function(format) {
                var result = false;
                $.each(DX.DateTimeFormat, function(key, value) {
                    result = key === format.toLowerCase();
                    return !result
                });
                return result
            },
            getQuarter: function(month) {
                return Math.floor(month / 3)
            },
            getFirstQuarterMonth: function(month) {
                return this.getQuarter(month) * 3
            },
            _getQuarterString: function(date, format) {
                var quarter = this.getQuarter(date.getMonth());
                switch (format) {
                    case'q':
                        return this.romanDigits[quarter];
                    case'qq':
                        return utils.stringFormat(this.defaultQuarterFormat, this.romanDigits[quarter]);
                    case'Q':
                        return (quarter + 1).toString();
                    case'QQ':
                        return utils.stringFormat(this.defaultQuarterFormat, (quarter + 1).toString())
                }
                return ''
            },
            _formatCustomString: function(value, format) {
                var regExp = /qq|q|QQ|Q/g,
                    quarterFormat,
                    result = '',
                    index = 0;
                regExp.lastIndex = 0;
                while (index < format.length) {
                    quarterFormat = regExp.exec(format);
                    if (!quarterFormat || quarterFormat.index > index)
                        result += Globalize.format(value, format.substring(index, quarterFormat ? quarterFormat.index : format.length));
                    if (quarterFormat) {
                        result += this._getQuarterString(value, quarterFormat[0]);
                        index = quarterFormat.index + quarterFormat[0].length
                    }
                    else
                        index = format.length
                }
                return result
            },
            _parseNumberFormatString: function(format) {
                var formatList,
                    formatObject = {};
                if (!format || typeof format !== 'string')
                    return;
                formatList = format.toLowerCase().split(' ');
                $.each(formatList, function(index, value) {
                    if (value in DX.NumericFormat)
                        formatObject.formatType = value;
                    else if (value in DX.LargeNumberFormatPowers)
                        formatObject.power = DX.LargeNumberFormatPowers[value]
                });
                if (formatObject.power && !formatObject.formatType)
                    formatObject.formatType = 'fixedpoint';
                if (formatObject.formatType)
                    return formatObject
            },
            _calculateNumberPower: function(value, base, minPower, maxPower) {
                var number = Math.abs(value);
                var power = 0;
                if (number > 1)
                    while (number && number >= base && (maxPower === undefined || power < maxPower)) {
                        power++;
                        number = number / base
                    }
                else if (number > 0 && number < 1)
                    while (number < 1 && (minPower === undefined || power > minPower)) {
                        power--;
                        number = number * base
                    }
                return power
            },
            _getNumberByPower: function(number, power, base) {
                var result = number;
                while (power > 0) {
                    result = result / base;
                    power--
                }
                while (power < 0) {
                    result = result * base;
                    power++
                }
                return result
            },
            _formatNumber: function(value, formatObject, precision) {
                var powerPostfix;
                if (formatObject.power === 'auto')
                    formatObject.power = this._calculateNumberPower(value, 1000, 0, MAX_LARGE_NUMBER_POWER);
                if (formatObject.power)
                    value = this._getNumberByPower(value, formatObject.power, 1000);
                powerPostfix = DX.LargeNumberFormatPostfixes[formatObject.power] || '';
                return this._formatNumberCore(value, formatObject.formatType, precision) + powerPostfix
            },
            _formatNumberExponential: function(value, precision) {
                var power = this._calculateNumberPower(value, DECIMAL_BASE),
                    number = this._getNumberByPower(value, power, DECIMAL_BASE),
                    powString;
                precision = precision === undefined ? 1 : precision;
                if (number.toFixed(precision || 0) >= DECIMAL_BASE) {
                    power++;
                    number = number / DECIMAL_BASE
                }
                powString = (power >= 0 ? '+' : '') + power.toString();
                return this._formatNumberCore(number, 'fixedpoint', precision) + 'E' + powString
            },
            _formatNumberCore: function(value, format, precision) {
                if (format === 'exponential')
                    return this._formatNumberExponential(value, precision);
                else
                    return Globalize.format(value, DX.NumericFormat[format] + (utils.isNumber(precision) ? precision : 0))
            },
            _formatDate: function(date, format, formatString) {
                var resultFormat = DX.DateTimeFormat[format.toLowerCase()];
                format = format.toLowerCase();
                if (format === 'quarterandyear')
                    resultFormat = this._getQuarterString(date, resultFormat) + ' yyyy';
                if (format === 'quarter')
                    return this._getQuarterString(date, resultFormat);
                if (format === 'longdatelongtime')
                    return this._formatDate(date, 'longdate') + ' ' + this._formatDate(date, 'longtime');
                if (format === 'shortdateshorttime')
                    return this._formatDate(date, 'shortDate') + ' ' + this._formatDate(date, 'shortTime');
                return Globalize.format(date, resultFormat)
            },
            format: function(value, format, precision) {
                if (format && format.format)
                    if (format.dateType)
                        return this._formatDateEx(value, format);
                    else if (utils.isNumber(value) && isFinite(value))
                        return this._formatNumberEx(value, format);
                return this._format(value, format, precision)
            },
            _format: function(value, format, precision) {
                var numberFormatObject;
                if (!utils.isString(format) || format === '' || !utils.isNumber(value) && !utils.isDate(value))
                    return utils.isDefined(value) ? value.toString() : '';
                numberFormatObject = this._parseNumberFormatString(format);
                if (utils.isNumber(value) && numberFormatObject)
                    return this._formatNumber(value, numberFormatObject, precision);
                if (utils.isDate(value) && this._isDateFormatContains(format))
                    return this._formatDate(value, format);
                if (!numberFormatObject && !this._isDateFormatContains(format))
                    return this._formatCustomString(value, format)
            },
            _formatNumberEx: function(value, formatInfo) {
                var that = this,
                    numericFormatType = DX.NumericFormat[formatInfo.format.toLowerCase()],
                    numberFormat = Globalize.culture().numberFormat,
                    currencyFormat = formatInfo.currencyCulture && Globalize.cultures[formatInfo.currencyCulture] ? Globalize.cultures[formatInfo.currencyCulture].numberFormat.currency : numberFormat.currency,
                    percentFormat = numberFormat.percent,
                    formatSettings = that._getUnitFormatSettings(value, formatInfo),
                    unit = formatSettings.unit,
                    precision = formatSettings.precision,
                    showTrailingZeros = formatSettings.showTrailingZeros,
                    includeGroupSeparator = formatSettings.includeGroupSeparator,
                    groupSymbol = numberFormat[","],
                    floatingSymbol = numberFormat["."],
                    number,
                    isNegative,
                    pattern,
                    currentFormat,
                    regexParts = /n|\$|-|%/g,
                    result = "";
                if (!utils.isDefined(value))
                    return '';
                value = that._applyUnitToValue(value, unit);
                number = Math.abs(value);
                isNegative = value < 0;
                switch (numericFormatType) {
                    case DX.NumericFormat.decimal:
                        pattern = "n";
                        number = Math[isNegative ? "ceil" : "floor"](number);
                        if (precision > 0) {
                            var str = "" + number;
                            for (var i = str.length; i < precision; i += 1)
                                str = "0" + str;
                            number = str
                        }
                        if (isNegative)
                            number = "-" + number;
                        break;
                    case DX.NumericFormat.fixedpoint:
                        currentFormat = numberFormat;
                    case DX.NumericFormat.currency:
                        currentFormat = currentFormat || currencyFormat;
                    case DX.NumericFormat.percent:
                        currentFormat = currentFormat || percentFormat;
                        pattern = isNegative ? currentFormat.pattern[0] : currentFormat.pattern[1] || "n";
                        number = Globalize.format(number * (numericFormatType === DX.NumericFormat.percent ? 100 : 1), "N" + precision);
                        if (!showTrailingZeros)
                            number = that._excludeTrailingZeros(number, floatingSymbol);
                        if (!includeGroupSeparator)
                            number = number.replace(new RegExp('\\' + groupSymbol, 'g'), '');
                        break;
                    case DX.NumericFormat.exponential:
                        return that._formatNumberExponential(value, precision);
                    default:
                        throw"Illegal numeric format: '" + numericFormatType + "'";
                }
                for (; ; ) {
                    var lastIndex = regexParts.lastIndex,
                        matches = regexParts.exec(pattern);
                    result += pattern.slice(lastIndex, matches ? matches.index : pattern.length);
                    if (matches)
                        switch (matches[0]) {
                            case"-":
                                if (/[1-9]/.test(number))
                                    result += numberFormat["-"];
                                break;
                            case"$":
                                result += currencyFormat.symbol;
                                break;
                            case"%":
                                result += percentFormat.symbol;
                                break;
                            case"n":
                                result += number + unit;
                                break
                        }
                    else
                        break
                }
                return (formatInfo.plus && value > 0 ? "+" : '') + result
            },
            _excludeTrailingZeros: function(strValue, floatingSymbol) {
                var floatingIndex = strValue.indexOf(floatingSymbol),
                    stopIndex,
                    i;
                if (floatingIndex < 0)
                    return strValue;
                stopIndex = strValue.length;
                for (i = stopIndex - 1; i >= floatingIndex && (strValue[i] === '0' || i === floatingIndex); i--)
                    stopIndex--;
                return strValue.substring(0, stopIndex)
            },
            _getUnitFormatSettings: function(value, formatInfo) {
                var unit = formatInfo.unit || '',
                    precision = formatInfo.precision || 0,
                    includeGroupSeparator = formatInfo.includeGroupSeparator || false,
                    showTrailingZeros = formatInfo.showTrailingZeros === undefined ? true : formatInfo.showTrailingZeros,
                    significantDigits = formatInfo.significantDigits || 1,
                    absValue;
                if (unit.toLowerCase() === 'auto') {
                    showTrailingZeros = false;
                    absValue = Math.abs(value);
                    if (significantDigits < 1)
                        significantDigits = 1;
                    if (absValue >= 1000000000) {
                        unit = 'B';
                        absValue /= 1000000000
                    }
                    else if (absValue >= 1000000) {
                        unit = 'M';
                        absValue /= 1000000
                    }
                    else if (absValue >= 1000) {
                        unit = 'K';
                        absValue /= 1000
                    }
                    else
                        unit = '';
                    if (absValue == 0)
                        precision = 0;
                    else if (absValue < 1) {
                        precision = significantDigits;
                        var smallValue = Math.pow(10, -significantDigits);
                        while (absValue < smallValue) {
                            smallValue /= 10;
                            precision++
                        }
                    }
                    else if (absValue >= 100)
                        precision = significantDigits - 3;
                    else if (absValue >= 10)
                        precision = significantDigits - 2;
                    else
                        precision = significantDigits - 1
                }
                if (precision < 0)
                    precision = 0;
                return {
                        unit: unit,
                        precision: precision,
                        showTrailingZeros: showTrailingZeros,
                        includeGroupSeparator: includeGroupSeparator
                    }
            },
            _applyUnitToValue: function(value, unit) {
                if (unit == 'B')
                    return value.toFixed(1) / 1000000000;
                if (unit == 'M')
                    return value / 1000000;
                if (unit == 'K')
                    return value / 1000;
                return value
            },
            _formatDateEx: function(value, formatInfo) {
                var that = this,
                    format = formatInfo.format,
                    dateType = formatInfo.dateType,
                    calendar = Globalize.culture().calendars.standard,
                    time = undefined,
                    index,
                    dateStr;
                format = format.toLowerCase();
                if (!utils.isDefined(value))
                    return '';
                if (dateType !== 'num' || format === 'dayofweek')
                    switch (format) {
                        case'monthyear':
                            return that._formatDate(value, 'monthandyear');
                        case'quarteryear':
                            return that._getQuarterString(value, 'QQ') + ' ' + value.getFullYear();
                        case'daymonthyear':
                            return that._formatDate(value, dateType + 'Date');
                        case'datehour':
                            time = new Date(value.getTime());
                            time.setMinutes(0);
                            dateStr = dateType === 'timeOnly' ? '' : that._formatDate(value, dateType + 'Date');
                            return dateType === 'timeOnly' ? that._formatDate(time, 'shorttime') : dateStr + ' ' + that._formatDate(time, 'shorttime');
                        case'datehourminute':
                            dateStr = dateType === 'timeOnly' ? '' : that._formatDate(value, dateType + 'Date');
                            return dateType === 'timeOnly' ? that._formatDate(value, 'shorttime') : dateStr + ' ' + that._formatDate(value, 'shorttime');
                        case'datehourminutesecond':
                            dateStr = dateType === 'timeOnly' ? '' : that._formatDate(value, dateType + 'Date');
                            return dateType === 'timeOnly' ? that._formatDate(value, 'longtime') : dateStr + ' ' + that._formatDate(value, 'longtime');
                        case'year':
                            dateStr = value.toString();
                            return dateType === 'abbr' ? dateStr.slice(2, 4) : dateStr;
                        case'dateyear':
                            return dateType === 'abbr' ? that._formatDate(value, 'shortyear') : that._formatDate(value, 'year');
                        case'quarter':
                            return utils.stringFormat(that.defaultQuarterFormat, value.toString());
                        case'month':
                            index = value - 1;
                            return dateType === 'abbr' ? calendar.months.namesAbbr[index] : calendar.months.names[index];
                        case'hour':
                            if (dateType === 'long') {
                                time = new Date;
                                time.setHours(value);
                                time.setMinutes(0);
                                return that._formatDate(time, 'shorttime')
                            }
                            else
                                return value.toString();
                        case'dayofweek':
                            index = utils.isString(value) ? $.inArray(value, ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']) : value;
                            if (dateType !== 'num')
                                return dateType === 'abbr' ? calendar.days.namesAbbr[index] : calendar.days.names[index];
                            else
                                return ((index - calendar.firstDay + 1 + 7) % 8).toString();
                        default:
                            return value.toString()
                    }
                else
                    return value.toString()
            },
            getTimeFormat: function(showSecond) {
                if (showSecond)
                    return this._getDateTimeFormatPattern('longtime');
                return this._getDateTimeFormatPattern('shorttime')
            },
            getDateFormatByDifferences: function(dateDifferences) {
                var resultFormat = '';
                if (dateDifferences.millisecond)
                    resultFormat = DX.DateTimeFormat.millisecond;
                if (dateDifferences.hour || dateDifferences.minute || dateDifferences.second)
                    resultFormat = this._addFormatSeparator(this.getTimeFormat(dateDifferences.second), resultFormat);
                if (dateDifferences.year && dateDifferences.month && dateDifferences.day)
                    return this._addFormatSeparator(this._getDateTimeFormatPattern('shortdate'), resultFormat);
                if (dateDifferences.year && dateDifferences.month)
                    return DX.DateTimeFormat['monthandyear'];
                if (dateDifferences.year)
                    return DX.DateTimeFormat['year'];
                if (dateDifferences.month && dateDifferences.day)
                    return this._addFormatSeparator(this._getDateTimeFormatPattern('monthandday'), resultFormat);
                if (dateDifferences.month)
                    return DX.DateTimeFormat['month'];
                if (dateDifferences.day)
                    return this._addFormatSeparator('dddd, dd', resultFormat);
                return resultFormat
            },
            getDateFormatByTicks: function(ticks) {
                var resultFormat,
                    maxDif,
                    currentDif,
                    i,
                    dateUnitInterval;
                if (ticks.length > 1) {
                    maxDif = utils.getDatesDifferences(ticks[0], ticks[1]);
                    for (i = 1; i < ticks.length - 1; i++) {
                        currentDif = utils.getDatesDifferences(ticks[i], ticks[i + 1]);
                        if (maxDif.count < currentDif.count)
                            maxDif = currentDif
                    }
                }
                else
                    maxDif = {
                        year: true,
                        month: true,
                        day: true,
                        hour: ticks[0].getHours() > 0,
                        minute: ticks[0].getMinutes() > 0,
                        second: ticks[0].getSeconds() > 0
                    };
                resultFormat = this.getDateFormatByDifferences(maxDif);
                return resultFormat
            },
            getDateFormatByTickInterval: function(startValue, endValue, tickInterval) {
                var resultFormat,
                    dateDifferences,
                    dateUnitInterval,
                    dateDifferencesConverter = {
                        quarter: 'month',
                        week: 'day'
                    },
                    correctDateDifferences = function(dateDifferences, tickInterval, value) {
                        switch (tickInterval) {
                            case'year':
                                dateDifferences.month = value;
                            case'quarter':
                            case'month':
                                dateDifferences.day = value;
                            case'week':
                            case'day':
                                dateDifferences.hour = value;
                            case'hour':
                                dateDifferences.minute = value;
                            case'minute':
                                dateDifferences.second = value;
                            case'second':
                                dateDifferences.millisecond = value
                        }
                    },
                    correctDifferencesByMaxDate = function(differences, minDate, maxDate) {
                        if (!maxDate.getMilliseconds() && maxDate.getSeconds()) {
                            if (maxDate.getSeconds() - minDate.getSeconds() === 1) {
                                differences.millisecond = true;
                                differences.second = false
                            }
                        }
                        else if (!maxDate.getSeconds() && maxDate.getMinutes()) {
                            if (maxDate.getMinutes() - minDate.getMinutes() === 1) {
                                differences.second = true;
                                differences.minute = false
                            }
                        }
                        else if (!maxDate.getMinutes() && maxDate.getHours()) {
                            if (maxDate.getHours() - minDate.getHours() === 1) {
                                differences.minute = true;
                                differences.hour = false
                            }
                        }
                        else if (!maxDate.getHours() && maxDate.getDate() > 1) {
                            if (maxDate.getDate() - minDate.getDate() === 1) {
                                differences.hour = true;
                                differences.day = false
                            }
                        }
                        else if (maxDate.getDate() === 1 && maxDate.getMonth()) {
                            if (maxDate.getMonth() - minDate.getMonth() === 1) {
                                differences.day = true;
                                differences.month = false
                            }
                        }
                        else if (!maxDate.getMonth() && maxDate.getFullYear())
                            if (maxDate.getFullYear() - minDate.getFullYear() === 1) {
                                differences.month = true;
                                differences.year = false
                            }
                    };
                tickInterval = utils.isString(tickInterval) ? tickInterval.toLowerCase() : tickInterval;
                dateDifferences = utils.getDatesDifferences(startValue, endValue);
                if (startValue !== endValue)
                    correctDifferencesByMaxDate(dateDifferences, startValue > endValue ? endValue : startValue, startValue > endValue ? startValue : endValue);
                dateUnitInterval = utils.getDateUnitInterval(dateDifferences);
                correctDateDifferences(dateDifferences, dateUnitInterval, true);
                dateUnitInterval = utils.getDateUnitInterval(tickInterval || 'second');
                correctDateDifferences(dateDifferences, dateUnitInterval, false);
                dateDifferences[dateDifferencesConverter[dateUnitInterval] || dateUnitInterval] = true;
                resultFormat = this.getDateFormatByDifferences(dateDifferences);
                return resultFormat
            }
        }
    })(jQuery, DevExpress);
    /*! Module core, file color.js */
    (function(DX, undefined) {
        var standardColorNames = {
                aliceblue: 'f0f8ff',
                antiquewhite: 'faebd7',
                aqua: '00ffff',
                aquamarine: '7fffd4',
                azure: 'f0ffff',
                beige: 'f5f5dc',
                bisque: 'ffe4c4',
                black: '000000',
                blanchedalmond: 'ffebcd',
                blue: '0000ff',
                blueviolet: '8a2be2',
                brown: 'a52a2a',
                burlywood: 'deb887',
                cadetblue: '5f9ea0',
                chartreuse: '7fff00',
                chocolate: 'd2691e',
                coral: 'ff7f50',
                cornflowerblue: '6495ed',
                cornsilk: 'fff8dc',
                crimson: 'dc143c',
                cyan: '00ffff',
                darkblue: '00008b',
                darkcyan: '008b8b',
                darkgoldenrod: 'b8860b',
                darkgray: 'a9a9a9',
                darkgreen: '006400',
                darkkhaki: 'bdb76b',
                darkmagenta: '8b008b',
                darkolivegreen: '556b2f',
                darkorange: 'ff8c00',
                darkorchid: '9932cc',
                darkred: '8b0000',
                darksalmon: 'e9967a',
                darkseagreen: '8fbc8f',
                darkslateblue: '483d8b',
                darkslategray: '2f4f4f',
                darkturquoise: '00ced1',
                darkviolet: '9400d3',
                deeppink: 'ff1493',
                deepskyblue: '00bfff',
                dimgray: '696969',
                dodgerblue: '1e90ff',
                feldspar: 'd19275',
                firebrick: 'b22222',
                floralwhite: 'fffaf0',
                forestgreen: '228b22',
                fuchsia: 'ff00ff',
                gainsboro: 'dcdcdc',
                ghostwhite: 'f8f8ff',
                gold: 'ffd700',
                goldenrod: 'daa520',
                gray: '808080',
                green: '008000',
                greenyellow: 'adff2f',
                honeydew: 'f0fff0',
                hotpink: 'ff69b4',
                indianred: 'cd5c5c',
                indigo: '4b0082',
                ivory: 'fffff0',
                khaki: 'f0e68c',
                lavender: 'e6e6fa',
                lavenderblush: 'fff0f5',
                lawngreen: '7cfc00',
                lemonchiffon: 'fffacd',
                lightblue: 'add8e6',
                lightcoral: 'f08080',
                lightcyan: 'e0ffff',
                lightgoldenrodyellow: 'fafad2',
                lightgrey: 'd3d3d3',
                lightgreen: '90ee90',
                lightpink: 'ffb6c1',
                lightsalmon: 'ffa07a',
                lightseagreen: '20b2aa',
                lightskyblue: '87cefa',
                lightslateblue: '8470ff',
                lightslategray: '778899',
                lightsteelblue: 'b0c4de',
                lightyellow: 'ffffe0',
                lime: '00ff00',
                limegreen: '32cd32',
                linen: 'faf0e6',
                magenta: 'ff00ff',
                maroon: '800000',
                mediumaquamarine: '66cdaa',
                mediumblue: '0000cd',
                mediumorchid: 'ba55d3',
                mediumpurple: '9370d8',
                mediumseagreen: '3cb371',
                mediumslateblue: '7b68ee',
                mediumspringgreen: '00fa9a',
                mediumturquoise: '48d1cc',
                mediumvioletred: 'c71585',
                midnightblue: '191970',
                mintcream: 'f5fffa',
                mistyrose: 'ffe4e1',
                moccasin: 'ffe4b5',
                navajowhite: 'ffdead',
                navy: '000080',
                oldlace: 'fdf5e6',
                olive: '808000',
                olivedrab: '6b8e23',
                orange: 'ffa500',
                orangered: 'ff4500',
                orchid: 'da70d6',
                palegoldenrod: 'eee8aa',
                palegreen: '98fb98',
                paleturquoise: 'afeeee',
                palevioletred: 'd87093',
                papayawhip: 'ffefd5',
                peachpuff: 'ffdab9',
                peru: 'cd853f',
                pink: 'ffc0cb',
                plum: 'dda0dd',
                powderblue: 'b0e0e6',
                purple: '800080',
                red: 'ff0000',
                rosybrown: 'bc8f8f',
                royalblue: '4169e1',
                saddlebrown: '8b4513',
                salmon: 'fa8072',
                sandybrown: 'f4a460',
                seagreen: '2e8b57',
                seashell: 'fff5ee',
                sienna: 'a0522d',
                silver: 'c0c0c0',
                skyblue: '87ceeb',
                slateblue: '6a5acd',
                slategray: '708090',
                snow: 'fffafa',
                springgreen: '00ff7f',
                steelblue: '4682b4',
                tan: 'd2b48c',
                teal: '008080',
                thistle: 'd8bfd8',
                tomato: 'ff6347',
                turquoise: '40e0d0',
                violet: 'ee82ee',
                violetred: 'd02090',
                wheat: 'f5deb3',
                white: 'ffffff',
                whitesmoke: 'f5f5f5',
                yellow: 'ffff00',
                yellowgreen: '9acd32'
            };
        var standardColorTypes = [{
                    re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
                    process: function(colorString) {
                        return [parseInt(colorString[1], 10), parseInt(colorString[2], 10), parseInt(colorString[3], 10)]
                    }
                }, {
                    re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*\.*\d+)\)$/,
                    process: function(colorString) {
                        return [parseInt(colorString[1], 10), parseInt(colorString[2], 10), parseInt(colorString[3], 10), parseFloat(colorString[4])]
                    }
                }, {
                    re: /^#(\w{2})(\w{2})(\w{2})$/,
                    process: function(colorString) {
                        return [parseInt(colorString[1], 16), parseInt(colorString[2], 16), parseInt(colorString[3], 16)]
                    }
                }, {
                    re: /^#(\w{1})(\w{1})(\w{1})$/,
                    process: function(colorString) {
                        return [parseInt(colorString[1] + colorString[1], 16), parseInt(colorString[2] + colorString[2], 16), parseInt(colorString[3] + colorString[3], 16)]
                    }
                }, {
                    re: /^hsv\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
                    process: function(colorString) {
                        var h = parseInt(colorString[1], 10),
                            s = parseInt(colorString[2], 10),
                            v = parseInt(colorString[3], 10),
                            rgb = hsvToRgb(h, s, v);
                        return [rgb[0], rgb[1], rgb[2], 1, [h, s, v]]
                    }
                }, {
                    re: /^hsl\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
                    process: function(colorString) {
                        var h = parseInt(colorString[1], 10),
                            s = parseInt(colorString[2], 10),
                            l = parseInt(colorString[3], 10),
                            rgb = hslToRgb(h, s, l);
                        return [rgb[0], rgb[1], rgb[2], 1, null, [h, s, l]]
                    }
                }];
        function Color(value) {
            this.baseColor = value;
            var color;
            if (value) {
                color = String(value).toLowerCase().replace(/ /g, '');
                color = standardColorNames[color] ? '#' + standardColorNames[color] : color;
                color = parseColor(color)
            }
            if (!color)
                this.colorIsInvalid = true;
            color = color || {};
            this.r = normalize(color[0]);
            this.g = normalize(color[1]);
            this.b = normalize(color[2]);
            this.a = normalize(color[3], 1, 1);
            if (color[4])
                this.hsv = {
                    h: color[4][0],
                    s: color[4][1],
                    v: color[4][2]
                };
            else
                this.hsv = toHsvFromRgb(this.r, this.g, this.b);
            if (color[5])
                this.hsl = {
                    h: color[5][0],
                    s: color[5][1],
                    l: color[5][2]
                };
            else
                this.hsl = toHslFromRgb(this.r, this.g, this.b)
        }
        function parseColor(color) {
            if (color === "transparent")
                return [0, 0, 0, 0];
            var result,
                i = 0,
                ii = standardColorTypes.length,
                str;
            for (; i < ii; ++i) {
                str = standardColorTypes[i].re.exec(color);
                if (str)
                    return standardColorTypes[i].process(str)
            }
            return null
        }
        function normalize(colorComponent, def, max) {
            def = def || 0;
            max = max || 255;
            return colorComponent < 0 || isNaN(colorComponent) ? def : colorComponent > max ? max : colorComponent
        }
        function toHexFromRgb(r, g, b) {
            return '#' + (0X01000000 | r << 16 | g << 8 | b).toString(16).slice(1)
        }
        function toHsvFromRgb(r, g, b) {
            var max = Math.max(r, g, b),
                min = Math.min(r, g, b),
                delta = max - min,
                H,
                S,
                V;
            V = max;
            S = max === 0 ? 0 : 1 - min / max;
            if (max === min)
                H = 0;
            else
                switch (max) {
                    case r:
                        H = 60 * ((g - b) / delta);
                        if (g < b)
                            H = H + 360;
                        break;
                    case g:
                        H = 60 * ((b - r) / delta) + 120;
                        break;
                    case b:
                        H = 60 * ((r - g) / delta) + 240;
                        break
                }
            S *= 100;
            V *= 100 / 255;
            return {
                    h: Math.round(H),
                    s: Math.round(S),
                    v: Math.round(V)
                }
        }
        function hsvToRgb(h, s, v) {
            var Vdec,
                Vinc,
                Vmin,
                Hi,
                a,
                r,
                g,
                b;
            Hi = Math.floor(h / 60);
            Vmin = (100 - s) * v / 100;
            a = (v - Vmin) * (h % 60 / 60);
            Vinc = Vmin + a;
            Vdec = v - a;
            switch (Hi) {
                case 0:
                    r = v;
                    g = Vinc;
                    b = Vmin;
                    break;
                case 1:
                    r = Vdec;
                    g = v;
                    b = Vmin;
                    break;
                case 2:
                    r = Vmin;
                    g = v;
                    b = Vinc;
                    break;
                case 3:
                    r = Vmin;
                    g = Vdec;
                    b = v;
                    break;
                case 4:
                    r = Vinc;
                    g = Vmin;
                    b = v;
                    break;
                case 5:
                    r = v;
                    g = Vmin;
                    b = Vdec;
                    break
            }
            return [Math.round(r * 2.55), Math.round(g * 2.55), Math.round(b * 2.55)]
        }
        function calculateHue(r, g, b, delta) {
            var max = Math.max(r, g, b);
            switch (max) {
                case r:
                    return (g - b) / delta + (g < b ? 6 : 0);
                case g:
                    return (b - r) / delta + 2;
                case b:
                    return (r - g) / delta + 4
            }
        }
        function toHslFromRgb(r, g, b) {
            r = convertTo01Bounds(r, 255);
            g = convertTo01Bounds(g, 255);
            b = convertTo01Bounds(b, 255);
            var max = Math.max(r, g, b),
                min = Math.min(r, g, b),
                maxMinSumm = max + min,
                h,
                s,
                l = maxMinSumm / 2;
            if (max === min)
                h = s = 0;
            else {
                var delta = max - min;
                if (l > 0.5)
                    s = delta / (2 - maxMinSumm);
                else
                    s = delta / maxMinSumm;
                h = calculateHue(r, g, b, delta);
                h /= 6
            }
            return {
                    h: _round(h * 360),
                    s: _round(s * 100),
                    l: _round(l * 100)
                }
        }
        function makeTc(colorPart, h) {
            var Tc = h;
            if (colorPart === "r")
                Tc = h + 1 / 3;
            if (colorPart === "b")
                Tc = h - 1 / 3;
            return Tc
        }
        function modifyTc(Tc) {
            if (Tc < 0)
                Tc += 1;
            if (Tc > 1)
                Tc -= 1;
            return Tc
        }
        function hueToRgb(p, q, Tc) {
            Tc = modifyTc(Tc);
            if (Tc < 1 / 6)
                return p + (q - p) * 6 * Tc;
            if (Tc < 1 / 2)
                return q;
            if (Tc < 2 / 3)
                return p + (q - p) * (2 / 3 - Tc) * 6;
            return p
        }
        function hslToRgb(h, s, l) {
            var r,
                g,
                b,
                h = convertTo01Bounds(h, 360),
                s = convertTo01Bounds(s, 100),
                l = convertTo01Bounds(l, 100);
            if (s === 0)
                r = g = b = l;
            else {
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s,
                    p = 2 * l - q;
                r = hueToRgb(p, q, makeTc("r", h));
                g = hueToRgb(p, q, makeTc("g", h));
                b = hueToRgb(p, q, makeTc("b", h))
            }
            return [_round(r * 255), _round(g * 255), _round(b * 255)]
        }
        function convertTo01Bounds(n, max) {
            n = Math.min(max, Math.max(0, parseFloat(n)));
            if (Math.abs(n - max) < 0.000001)
                return 1;
            return n % max / parseFloat(max)
        }
        function isIntegerBtwMinAndMax(number, min, max) {
            min = min || 0;
            max = max || 255;
            if (number % 1 !== 0 || number < min || number > max || typeof number !== 'number' || isNaN(number))
                return false;
            return true
        }
        var _round = Math.round;
        Color.prototype = {
            constructor: Color,
            highlight: function(step) {
                step = step || 10;
                return this.alter(step).toHex()
            },
            darken: function(step) {
                step = step || 10;
                return this.alter(-step).toHex()
            },
            alter: function(step) {
                var result = new Color;
                result.r = normalize(this.r + step);
                result.g = normalize(this.g + step);
                result.b = normalize(this.b + step);
                return result
            },
            blend: function(blendColor, opacity) {
                var other = blendColor instanceof Color ? blendColor : new Color(blendColor),
                    result = new Color;
                result.r = normalize(_round(this.r * (1 - opacity) + other.r * opacity));
                result.g = normalize(_round(this.g * (1 - opacity) + other.g * opacity));
                result.b = normalize(_round(this.b * (1 - opacity) + other.b * opacity));
                return result
            },
            toHex: function() {
                return toHexFromRgb(this.r, this.g, this.b)
            },
            getPureColor: function() {
                var rgb = hsvToRgb(this.hsv.h, 100, 100);
                return new Color("rgb(" + rgb.join(",") + ")")
            },
            isValidHex: function(hex) {
                return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex)
            },
            isValidRGB: function(r, g, b) {
                if (!isIntegerBtwMinAndMax(r) || !isIntegerBtwMinAndMax(g) || !isIntegerBtwMinAndMax(b))
                    return false;
                return true
            },
            isValidAlpha: function(a) {
                if (isNaN(a) || a < 0 || a > 1 || typeof a !== 'number')
                    return false;
                return true
            },
            colorIsInvalid: false
        };
        DX.Color = Color
    })(DevExpress);
    /*! Module core, file localization.js */
    (function($, DX, undefined) {
        Globalize.localize = function(key, cultureSelector) {
            var neutral = (cultureSelector || this.cultureSelector || "").substring(0, 2);
            return this.findClosestCulture(cultureSelector).messages[key] || this.findClosestCulture(neutral).messages[key] || this.cultures["default"].messages[key]
        };
        var localization = function() {
                var newMessages = {};
                return {
                        setup: function(localizablePrefix) {
                            this.localizeString = function(text) {
                                var regex = new RegExp("(^|[^a-zA-Z_0-9" + localizablePrefix + "-]+)(" + localizablePrefix + "{1,2})([a-zA-Z_0-9-]+)", "g"),
                                    escapeString = localizablePrefix + localizablePrefix;
                                return text.replace(regex, function(str, prefix, escape, localizationKey) {
                                        var result = prefix + localizablePrefix + localizationKey;
                                        if (escape !== escapeString)
                                            if (Globalize.cultures["default"].messages[localizationKey])
                                                result = prefix + Globalize.localize(localizationKey);
                                            else
                                                newMessages[localizationKey] = DX.inflector.humanize(localizationKey);
                                        return result
                                    })
                            }
                        },
                        localizeNode: function(node) {
                            var that = this;
                            $(node).each(function(index, nodeItem) {
                                if (!nodeItem.nodeType)
                                    return;
                                if (nodeItem.nodeType === 3)
                                    nodeItem.nodeValue = that.localizeString(nodeItem.nodeValue);
                                else {
                                    $.each(nodeItem.attributes || [], function(index, attr) {
                                        if (typeof attr.value === "string") {
                                            var localizedValue = that.localizeString(attr.value);
                                            if (attr.value !== localizedValue)
                                                attr.value = localizedValue
                                        }
                                    });
                                    $(nodeItem).contents().each(function(index, node) {
                                        that.localizeNode(node)
                                    })
                                }
                            })
                        },
                        getDictionary: function(onlyNew) {
                            if (onlyNew)
                                return newMessages;
                            return $.extend({}, newMessages, Globalize.cultures["default"].messages)
                        }
                    }
            }();
        localization.setup("@");
        DX.localization = localization
    })(jQuery, DevExpress);
    /*! Module core, file core.en.js */
    Globalize.addCultureInfo("default", {messages: {
            Yes: "Yes",
            No: "No",
            Cancel: "Cancel",
            Clear: "Clear",
            Done: "Done",
            Loading: "Loading...",
            Select: "Select...",
            Search: "Search",
            Back: "Back",
            OK: "OK",
            "dxCollectionWidget-noDataText": "No data to display",
            "validation-required": "Required",
            "validation-required-formatted": "{0} is required",
            "validation-numeric": "Value should be a number",
            "validation-numeric-formatted": "{0} should be a number",
            "validation-range": "Value is out of range",
            "validation-range-formatted": "{0} is out of range",
            "validation-stringLength": "The length of the value is not correct",
            "validation-stringLength-formatted": "The length of {0} is not correct",
            "validation-custom": "Value is invalid",
            "validation-custom-formatted": "{0} is invalid",
            "validation-compare": "Values do not match",
            "validation-compare-formatted": "{0} does not match",
            "validation-pattern": "Value does not match pattern",
            "validation-pattern-formatted": "{0} does not match pattern",
            "validation-email": "Email is invalid",
            "validation-email-formatted": "{0} is invalid"
        }});
    /*! Module core, file widgets-base.en.js */
    Globalize.addCultureInfo("default", {messages: {
            "dxLookup-searchPlaceholder": "Minimum character number: {0}",
            "dxList-pullingDownText": "Pull down to refresh...",
            "dxList-pulledDownText": "Release to refresh...",
            "dxList-refreshingText": "Refreshing...",
            "dxList-pageLoadingText": "Loading...",
            "dxList-nextButtonText": "More",
            "dxList-selectAll": "Select All",
            "dxListEditDecorator-delete": "Delete",
            "dxListEditDecorator-more": "More",
            "dxScrollView-pullingDownText": "Pull down to refresh...",
            "dxScrollView-pulledDownText": "Release to refresh...",
            "dxScrollView-refreshingText": "Refreshing...",
            "dxScrollView-reachBottomText": "Loading...",
            "dxDateBox-simulatedDataPickerTitleTime": "Select time",
            "dxDateBox-simulatedDataPickerTitleDate": "Select date",
            "dxDateBox-simulatedDataPickerTitleDateTime": "Select date and time",
            "dxFileUploader-selectFile": "Select file",
            "dxFileUploader-dropFile": "or Drop file here",
            "dxFileUploader-bytes": "bytes",
            "dxFileUploader-kb": "kb",
            "dxFileUploader-Mb": "Mb",
            "dxFileUploader-Gb": "Gb"
        }});
    /*! Module core, file widgets-mobile.en.js */
    Globalize.addCultureInfo("default", {messages: {
            "dxSwitch-onText": "ON",
            "dxSwitch-offText": "OFF"
        }});
    /*! Module core, file widgets-web.en.js */
    Globalize.addCultureInfo("default", {messages: {
            "dxDataGrid-columnChooserTitle": "Column Chooser",
            "dxDataGrid-columnChooserEmptyText": "Drag a column here to hide it",
            "dxDataGrid-groupContinuesMessage": "Continues on the next page",
            "dxDataGrid-groupContinuedMessage": "Continued from the previous page",
            "dxDataGrid-editingEditRow": "Edit",
            "dxDataGrid-editingSaveRowChanges": "Save",
            "dxDataGrid-editingCancelRowChanges": "Cancel",
            "dxDataGrid-editingDeleteRow": "Delete",
            "dxDataGrid-editingUndeleteRow": "Undelete",
            "dxDataGrid-editingConfirmDeleteMessage": "Are you sure you want to delete this record?",
            "dxDataGrid-editingConfirmDeleteTitle": "",
            "dxDataGrid-groupPanelEmptyText": "Drag a column header here to group by that column",
            "dxDataGrid-noDataText": "No data",
            "dxDataGrid-searchPanelPlaceholder": "Search...",
            "dxDataGrid-filterRowShowAllText": "(All)",
            "dxDataGrid-filterRowResetOperationText": "Reset",
            "dxDataGrid-filterRowOperationEquals": "Equals",
            "dxDataGrid-filterRowOperationNotEquals": "Does not equal",
            "dxDataGrid-filterRowOperationLess": "Less than",
            "dxDataGrid-filterRowOperationLessOrEquals": "Less than or equal to",
            "dxDataGrid-filterRowOperationGreater": "Greater than",
            "dxDataGrid-filterRowOperationGreaterOrEquals": "Greater than or equal to",
            "dxDataGrid-filterRowOperationStartsWith": "Starts with",
            "dxDataGrid-filterRowOperationContains": "Contains",
            "dxDataGrid-filterRowOperationNotContains": "Does not contain",
            "dxDataGrid-filterRowOperationEndsWith": "Ends with",
            "dxDataGrid-applyFilterText": "Apply filter",
            "dxDataGrid-trueText": "true",
            "dxDataGrid-falseText": "false",
            "dxDataGrid-sortingAscendingText": "Sort Ascending",
            "dxDataGrid-sortingDescendingText": "Sort Descending",
            "dxDataGrid-sortingClearText": "Clear Sorting",
            "dxDataGrid-editingSaveAllChanges": "Save changes",
            "dxDataGrid-editingCancelAllChanges": "Discard changes",
            "dxDataGrid-editingAddRow": "Add a row",
            "dxDataGrid-summaryMin": "Min: {0}",
            "dxDataGrid-summaryMinOtherColumn": "Min of {1} is {0}",
            "dxDataGrid-summaryMax": "Max: {0}",
            "dxDataGrid-summaryMaxOtherColumn": "Max of {1} is {0}",
            "dxDataGrid-summaryAvg": "Avg: {0}",
            "dxDataGrid-summaryAvgOtherColumn": "Avg of {1} is {0}",
            "dxDataGrid-summarySum": "Sum: {0}",
            "dxDataGrid-summarySumOtherColumn": "Sum of {1} is {0}",
            "dxDataGrid-summaryCount": "Count: {0}",
            "dxPager-infoText": "Page {0} of {1}"
        }});
    /*! Module core, file validationEngine.js */
    (function($, DX, undefined) {
        var utils = DX.utils;
        var rulesValidators = {
                required: {
                    validate: function(value, rule) {
                        if (!utils.isDefined(value))
                            return false;
                        if (value === false)
                            return false;
                        value = String(value);
                        if (rule.trim || !utils.isDefined(rule.trim))
                            value = $.trim(value);
                        return value !== ""
                    },
                    defaultMessage: Globalize.localize("validation-required"),
                    defaultFormattedMessage: Globalize.localize("validation-required-formatted")
                },
                numeric: {
                    validate: function(value, rule) {
                        return $.isNumeric(value)
                    },
                    defaultMessage: Globalize.localize("validation-numeric"),
                    defaultFormattedMessage: Globalize.localize("validation-numeric-formatted")
                },
                range: {
                    validate: function(value, rule) {
                        var validNumber = rulesValidators["numeric"].validate(value, rule),
                            validValue = utils.isDefined(value),
                            number = validNumber ? parseFloat(value) : validValue && value.valueOf(),
                            min = rule.min,
                            max = rule.max;
                        if (!(validNumber || utils.isDate(value)) && !validValue)
                            return false;
                        if (utils.isDefined(min)) {
                            if (utils.isDefined(max))
                                return number >= min && number <= max;
                            return number >= min
                        }
                        else if (utils.isDefined(max))
                            return number <= max;
                        else
                            throw DX.Error("E0101");
                        return false
                    },
                    defaultMessage: Globalize.localize("validation-range"),
                    defaultFormattedMessage: Globalize.localize("validation-range-formatted")
                },
                stringLength: {
                    validate: function(value, rule) {
                        value = String(value);
                        if (rule.trim || !utils.isDefined(rule.trim))
                            value = $.trim(value);
                        return rulesValidators.range.validate(value.length, $.extend({}, rule))
                    },
                    defaultMessage: Globalize.localize("validation-stringLength"),
                    defaultFormattedMessage: Globalize.localize("validation-stringLength-formatted")
                },
                custom: {
                    validate: function(value, rule) {
                        return rule.validationCallback({
                                value: value,
                                validator: rule.validator,
                                rule: rule
                            })
                    },
                    defaultMessage: Globalize.localize("validation-custom"),
                    defaultFormattedMessage: Globalize.localize("validation-custom-formatted")
                },
                compare: {
                    validate: function(value, rule) {
                        if (!rule.comparisonTarget)
                            throw DX.Error("E0102");
                        var otherValue = rule.comparisonTarget(),
                            type = rule.comparisonType || "==";
                        switch (type) {
                            case"==":
                                return value == otherValue;
                                break;
                            case"===":
                                return value === otherValue;
                                break;
                            case">":
                                return value > otherValue;
                                break;
                            case">=":
                                return value >= otherValue;
                                break;
                            case"<":
                                return value < otherValue;
                                break;
                            case"<=":
                                return value <= otherValue;
                                break
                        }
                    },
                    defaultMessage: Globalize.localize("validation-compare"),
                    defaultFormattedMessage: Globalize.localize("validation-compare-formatted")
                },
                pattern: {
                    validate: function(value, rule) {
                        var pattern = rule.pattern;
                        if (utils.isString(pattern))
                            pattern = new RegExp(pattern);
                        return pattern.test(value)
                    },
                    defaultMessage: Globalize.localize("validation-pattern"),
                    defaultFormattedMessage: Globalize.localize("validation-pattern-formatted")
                },
                email: {
                    validate: function(value, rule) {
                        return rulesValidators.pattern.validate(value, $.extend({}, rule, {pattern: /^[\d\w\._\-]+@([\d\w\._\-]+\.)+[\w]+$/i}))
                    },
                    defaultMessage: Globalize.localize("validation-email"),
                    defaultFormattedMessage: Globalize.localize("validation-email-formatted")
                }
            };
        var GroupConfig = DX.Class.inherit({
                ctor: function(group) {
                    this.group = group;
                    this.validators = []
                },
                validate: function() {
                    var result = {
                            isValid: true,
                            brokenRules: [],
                            validators: []
                        };
                    $.each(this.validators, function(_, validator) {
                        var validatorResult = validator.validate();
                        result.isValid = result.isValid && validatorResult.isValid;
                        if (validatorResult.brokenRule)
                            result.brokenRules.push(validatorResult.brokenRule);
                        result.validators.push(validator)
                    });
                    this.fireEvent("validated", [{
                            validators: result.validators,
                            brokenRules: result.brokenRules,
                            isValid: result.isValid
                        }]);
                    return result
                }
            }).include(DX.EventsMixin);
        DX.validationEngine = {
            groups: [],
            getGroupConfig: function(group) {
                var result = $.grep(this.groups, function(config) {
                        return config.group === group
                    });
                if (result.length)
                    return result[0]
            },
            initGroups: function() {
                this.groups = [];
                this.addGroup()
            },
            addGroup: function(group) {
                var config = this.getGroupConfig(group);
                if (!config) {
                    config = new GroupConfig(group);
                    this.groups.push(config)
                }
                return config
            },
            removeGroup: function(group) {
                var config = this.getGroupConfig(group),
                    index = $.inArray(config, this.groups);
                if (index > -1)
                    this.groups.splice(index, 1);
                return config
            },
            _setDefaultMessage: function(rule, validator, name) {
                if (!utils.isDefined(rule.message))
                    if (validator.defaultFormattedMessage && utils.isDefined(name))
                        rule.message = validator.defaultFormattedMessage.replace(/\{0\}/, name);
                    else
                        rule.message = validator.defaultMessage
            },
            validate: function validate(value, rules, name) {
                var result = {
                        name: name,
                        value: value,
                        brokenRule: undefined,
                        isValid: true,
                        validationRules: rules
                    },
                    that = this;
                $.each(rules || [], function(_, rule) {
                    var ruleValidator = rulesValidators[rule.type],
                        ruleValidationResult;
                    if (ruleValidator) {
                        if (utils.isDefined(rule.isValid) && rule.value === value) {
                            if (!rule.isValid) {
                                result.isValid = false;
                                result.brokenRule = rule;
                                return false
                            }
                            return true
                        }
                        rule.value = value;
                        ruleValidationResult = ruleValidator.validate(value, rule);
                        rule.isValid = ruleValidationResult;
                        if (!ruleValidationResult) {
                            result.isValid = false;
                            that._setDefaultMessage(rule, ruleValidator, name);
                            result.brokenRule = rule
                        }
                        if (!rule.isValid)
                            return false
                    }
                    else
                        throw DX.Error("E0100");
                });
                return result
            },
            registerValidatorInGroup: function(group, validator) {
                var groupConfig = DX.validationEngine.addGroup(group);
                if ($.inArray(validator, groupConfig.validators) < 0)
                    groupConfig.validators.push(validator)
            },
            removeRegistredValidator: function(group, validator) {
                var config = DX.validationEngine.getGroupConfig(group),
                    validatorsInGroup = config && config.validators;
                var index = $.inArray(validator, validatorsInGroup);
                if (index > -1)
                    validatorsInGroup.splice(index, 1)
            },
            validateGroup: function(group) {
                var groupConfig = DX.validationEngine.getGroupConfig(group);
                if (!groupConfig)
                    throw DX.Error("E0110");
                return groupConfig.validate()
            }
        };
        DX.validationEngine.initGroups()
    })(jQuery, DevExpress);
    /*! Module core, file data.errors.js */
    (function($, DX) {
        $.extend(DX.ERROR_MESSAGES, {
            E4000: "[DevExpress.data]: {0}",
            E4001: "Unknown aggregating function is detected: '{0}'",
            E4002: "Unsupported OData protocol version is used",
            E4003: "Unknown filter operation is used: {0}",
            E4004: "The thenby() method is called before the sortby() method",
            E4005: "Store requires a key expression for this operation",
            E4006: "ArrayStore 'data' option must be an array",
            E4007: "Compound keys cannot be auto-generated",
            E4008: "Attempt to insert an item with the a duplicated key",
            E4009: "Data item cannot be found by the parameters passed to the update(key,values) function",
            E4010: "CustomStore does not support creating queries",
            E4011: "Custom Store method is not implemented or is not a function: {0}",
            E4012: "Custom Store method returns an invalid value: {0}",
            E4013: "Local Store requires the 'name' configuration option is specified",
            E4014: "Unknown key type is detected: {0}",
            E4015: "Unknown entity name or alias is used: {0}",
            E4016: "The compileSetter(expr) method is called with 'self' passed as a parameter"
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.js */
    (function($, DX, undefined) {
        var bracketsToDots = function(expr) {
                return expr.replace(/\[/g, ".").replace(/\]/g, "")
            };
        var unwrapObservable = DX.utils.unwrapObservable;
        var isObservable = function(value) {
                return DX.support.hasKo && ko.isObservable(value)
            };
        var readPropValue = function(obj, propName) {
                if (propName === "this")
                    return obj;
                return obj[propName]
            };
        var assignPropValue = function(obj, propName, value, options) {
                if (propName === "this")
                    throw new DX.Error("E4016");
                var propValue = obj[propName];
                if (options.unwrapObservables && isObservable(propValue))
                    propValue(value);
                else
                    obj[propName] = value
            };
        var prepareOptions = function(options) {
                options = options || {};
                options.unwrapObservables = options.unwrapObservables !== undefined ? options.unwrapObservables : true;
                return options
            };
        var unwrap = function(value, options) {
                return options.unwrapObservables ? unwrapObservable(value) : value
            };
        var compileGetter = function(expr) {
                if (arguments.length > 1)
                    expr = $.makeArray(arguments);
                if (!expr || expr === "this")
                    return function(obj) {
                            return obj
                        };
                if ($.isFunction(expr))
                    return expr;
                if ($.isArray(expr))
                    return combineGetters(expr);
                expr = bracketsToDots(expr);
                var path = expr.split(".");
                return function(obj, options) {
                        options = prepareOptions(options);
                        var current = unwrap(obj, options);
                        $.each(path, function() {
                            if (!current)
                                return false;
                            var next = unwrap(current[this], options);
                            if ($.isFunction(next) && !options.functionsAsIs)
                                next = next.call(current);
                            current = next
                        });
                        return current
                    }
            };
        var combineGetters = function(getters) {
                var compiledGetters = {};
                $.each(getters, function() {
                    compiledGetters[this] = compileGetter(this)
                });
                return function(obj, options) {
                        var result = {};
                        $.each(compiledGetters, function(name) {
                            var value = this(obj, options),
                                current,
                                path,
                                last,
                                i;
                            if (value === undefined)
                                return;
                            current = result;
                            path = name.split(".");
                            last = path.length - 1;
                            for (i = 0; i < last; i++)
                                current = current[path[i]] = {};
                            current[path[i]] = value
                        });
                        return result
                    }
            };
        var compileSetter = function(expr) {
                expr = expr || "this";
                expr = bracketsToDots(expr);
                var pos = expr.lastIndexOf("."),
                    targetGetter = compileGetter(expr.substr(0, pos)),
                    targetPropName = expr.substr(1 + pos);
                return function(obj, value, options) {
                        options = prepareOptions(options);
                        var target = targetGetter(obj, {
                                functionsAsIs: options.functionsAsIs,
                                unwrapObservables: options.unwrapObservables
                            }),
                            prevTargetValue = readPropValue(target, targetPropName);
                        if (!options.functionsAsIs && $.isFunction(prevTargetValue) && !isObservable(prevTargetValue))
                            target[targetPropName](value);
                        else {
                            prevTargetValue = unwrap(prevTargetValue, options);
                            if (options.merge && $.isPlainObject(value) && (prevTargetValue === undefined || $.isPlainObject(prevTargetValue)) && !(value instanceof $.Event)) {
                                if (!prevTargetValue)
                                    assignPropValue(target, targetPropName, {}, options);
                                DX.utils.deepExtendArraySafe(unwrap(readPropValue(target, targetPropName), options), value)
                            }
                            else
                                assignPropValue(target, targetPropName, value, options)
                        }
                    }
            };
        var normalizeBinaryCriterion = function(crit) {
                return [crit[0], crit.length < 3 ? "=" : String(crit[1]).toLowerCase(), crit.length < 2 ? true : crit[crit.length - 1]]
            };
        var normalizeSortingInfo = function(info) {
                if (!$.isArray(info))
                    info = [info];
                return $.map(info, function(i) {
                        return {
                                selector: $.isFunction(i) || typeof i === "string" ? i : i.getter || i.field || i.selector,
                                desc: !!(i.desc || String(i.dir).charAt(0).toLowerCase() === "d")
                            }
                    })
            };
        var Guid = DX.Class.inherit({
                ctor: function(value) {
                    if (value)
                        value = String(value);
                    this._value = this._normalize(value || this._generate())
                },
                _normalize: function(value) {
                    value = value.replace(/[^a-f0-9]/ig, "").toLowerCase();
                    while (value.length < 32)
                        value += "0";
                    return [value.substr(0, 8), value.substr(8, 4), value.substr(12, 4), value.substr(16, 4), value.substr(20, 12)].join("-")
                },
                _generate: function() {
                    var value = "";
                    for (var i = 0; i < 32; i++)
                        value += Math.round(Math.random() * 15).toString(16);
                    return value
                },
                toString: function() {
                    return this._value
                },
                valueOf: function() {
                    return this._value
                },
                toJSON: function() {
                    return this._value
                }
            });
        var toComparable = function(value, caseSensitive) {
                if (value instanceof Date)
                    return value.getTime();
                if (value instanceof Guid)
                    return value.valueOf();
                if (!caseSensitive && typeof value === "string")
                    return value.toLowerCase();
                return value
            };
        var keysEqual = function(keyExpr, key1, key2) {
                if ($.isArray(keyExpr)) {
                    var names = $.map(key1, function(v, k) {
                            return k
                        }),
                        name;
                    for (var i = 0; i < names.length; i++) {
                        name = names[i];
                        if (toComparable(key1[name], true) != toComparable(key2[name], true))
                            return false
                    }
                    return true
                }
                return toComparable(key1, true) == toComparable(key2, true)
            };
        var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var base64_encode = function(input) {
                if (!$.isArray(input))
                    input = stringToByteArray(String(input));
                var result = "";
                for (var i = 0; i < input.length; i += 3) {
                    var octet1 = input[i],
                        octet2 = input[i + 1],
                        octet3 = input[i + 2];
                    result += $.map([octet1 >> 2, (octet1 & 3) << 4 | octet2 >> 4, isNaN(octet2) ? 64 : (octet2 & 15) << 2 | octet3 >> 6, isNaN(octet3) ? 64 : octet3 & 63], function(item) {
                        return BASE64_CHARS.charAt(item)
                    }).join("")
                }
                return result
            };
        var stringToByteArray = function(str) {
                var bytes = [],
                    code,
                    i;
                for (i = 0; i < str.length; i++) {
                    code = str.charCodeAt(i);
                    if (code < 128)
                        bytes.push(code);
                    else if (code < 2048)
                        bytes.push(192 + (code >> 6), 128 + (code & 63));
                    else if (code < 65536)
                        bytes.push(224 + (code >> 12), 128 + (code >> 6 & 63), 128 + (code & 63));
                    else if (code < 2097152)
                        bytes.push(240 + (code >> 18), 128 + (code >> 12 & 63), 128 + (code >> 6 & 63), 128 + (code & 63))
                }
                return bytes
            };
        var errorMessageFromXhr = function() {
                var textStatusMessages = {
                        timeout: "Network connection timeout",
                        error: "Unspecified network error",
                        parsererror: "Unexpected server response"
                    };
                var textStatusDetails = {
                        timeout: "possible causes: the remote host is not accessible, overloaded or is not included into the domain white-list when being run in the native container",
                        error: "if the remote host is located on another domain, make sure it properly supports cross-origin resource sharing (CORS), or use the JSONP approach instead",
                        parsererror: "the remote host did not respond with valid JSON data"
                    };
                var explainTextStatus = function(textStatus) {
                        var result = textStatusMessages[textStatus];
                        if (!result)
                            return textStatus;
                        result += " (" + textStatusDetails[textStatus] + ")";
                        return result
                    };
                return function(xhr, textStatus) {
                        if (xhr.status < 400)
                            return explainTextStatus(textStatus);
                        return xhr.statusText
                    }
            }();
        var aggregators = {
                count: {
                    seed: 0,
                    step: function(count) {
                        return 1 + count
                    }
                },
                sum: {
                    seed: 0,
                    step: function(sum, item) {
                        return sum + item
                    }
                },
                min: {step: function(min, item) {
                        return item < min ? item : min
                    }},
                max: {step: function(max, item) {
                        return item > max ? item : max
                    }},
                avg: {
                    seed: [0, 0],
                    step: function(pair, value) {
                        return [pair[0] + value, pair[1] + 1]
                    },
                    finalize: function(pair) {
                        return pair[1] ? pair[0] / pair[1] : NaN
                    }
                }
            };
        var data = DX.data = {
                utils: {
                    compileGetter: compileGetter,
                    compileSetter: compileSetter,
                    normalizeBinaryCriterion: normalizeBinaryCriterion,
                    normalizeSortingInfo: normalizeSortingInfo,
                    toComparable: toComparable,
                    keysEqual: keysEqual,
                    errorMessageFromXhr: errorMessageFromXhr,
                    aggregators: aggregators
                },
                Guid: Guid,
                base64_encode: base64_encode,
                queryImpl: {},
                queryAdapters: {},
                query: function() {
                    var impl = $.isArray(arguments[0]) ? "array" : "remote";
                    return data.queryImpl[impl].apply(this, arguments)
                },
                errorHandler: null,
                _errorHandler: function(error) {
                    DX.log("E4000", error);
                    if (data.errorHandler)
                        data.errorHandler(error)
                }
            }
    })(jQuery, DevExpress);
    /*! Module core, file data.aggregateCalculator.js */
    (function($, DX, undefined) {
        var data = DX.data,
            utils = data.utils;
        function isCount(aggregator) {
            return aggregator === utils.aggregators.count
        }
        function normalizeAggregate(aggregate) {
            var selector = utils.compileGetter(aggregate.selector),
                aggregator = aggregate.aggregator;
            if (typeof aggregator === "string") {
                aggregator = data.utils.aggregators[aggregator];
                if (!aggregator)
                    throw DX.Error("E4001", aggregate.aggregator);
            }
            return {
                    selector: selector,
                    aggregator: aggregator
                }
        }
        data.AggregateCalculator = DX.Class.inherit({
            ctor: function(options) {
                this._data = options.data;
                this._groupLevel = options.groupLevel || 0;
                this._totalAggregates = $.map(options.totalAggregates || [], normalizeAggregate);
                this._groupAggregates = $.map(options.groupAggregates || [], normalizeAggregate);
                this._totals = []
            },
            calculate: function() {
                if (this._totalAggregates.length)
                    this._calculateTotals(0, {items: this._data});
                if (this._groupAggregates.length && this._groupLevel > 0)
                    this._calculateGroups(0, {items: this._data})
            },
            _aggregate: function(data, aggregates, container) {
                var i,
                    j;
                for (i = 0; i < aggregates.length; i++) {
                    if (isCount(aggregates[i].aggregator)) {
                        container[i] = (container[i] || 0) + data.items.length;
                        continue
                    }
                    for (j = 0; j < data.items.length; j++)
                        this._accumulate(i, aggregates[i], container, data.items[j])
                }
            },
            _calculateTotals: function(level, data) {
                var i,
                    j;
                if (level === 0)
                    this._totals = this._seed(this._totalAggregates);
                if (level === this._groupLevel)
                    this._aggregate(data, this._totalAggregates, this._totals);
                else
                    for (i = 0; i < data.items.length; i++)
                        this._calculateTotals(level + 1, data.items[i]);
                if (level === 0)
                    this._totals = this._finalize(this._totalAggregates, this._totals)
            },
            _calculateGroups: function(level, data, outerAggregates) {
                var i,
                    j,
                    innerAggregates;
                if (level === this._groupLevel)
                    this._aggregate(data, this._groupAggregates, outerAggregates);
                else
                    for (i = 0; i < data.items.length; i++) {
                        innerAggregates = this._seed(this._groupAggregates);
                        this._calculateGroups(level + 1, data.items[i], innerAggregates);
                        data.items[i].aggregates = this._finalize(this._groupAggregates, innerAggregates);
                        if (level > 0) {
                            outerAggregates = outerAggregates || this._seed(this._groupAggregates);
                            this._calculateGroups(level + 1, data.items[i], outerAggregates)
                        }
                    }
            },
            totalAggregates: function() {
                return this._totals
            },
            _seed: function(aggregates) {
                return $.map(aggregates, function(aggregate, index) {
                        var aggregator = aggregate.aggregator,
                            seed = "seed" in aggregator ? aggregator.seed : NaN;
                        return $.isArray(seed) ? [seed] : seed
                    })
            },
            _accumulate: function(aggregateIndex, aggregate, results, item) {
                var value = aggregate.selector(item),
                    aggregator = aggregate.aggregator;
                results[aggregateIndex] = results[aggregateIndex] !== results[aggregateIndex] ? value : aggregator.step(results[aggregateIndex], value)
            },
            _finalize: function(aggregates, results) {
                return $.map(aggregates, function(aggregate, index) {
                        var fin = aggregate.aggregator.finalize;
                        return fin ? fin(results[index]) : results[index]
                    })
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.query.array.js */
    (function($, DX, undefined) {
        var Class = DX.Class,
            data = DX.data,
            queryImpl = data.queryImpl,
            compileGetter = data.utils.compileGetter,
            toComparable = data.utils.toComparable;
        var Iterator = Class.inherit({
                toArray: function() {
                    var result = [];
                    this.reset();
                    while (this.next())
                        result.push(this.current());
                    return result
                },
                countable: function() {
                    return false
                }
            });
        var ArrayIterator = Iterator.inherit({
                ctor: function(array) {
                    this.array = array;
                    this.index = -1
                },
                next: function() {
                    if (this.index + 1 < this.array.length) {
                        this.index++;
                        return true
                    }
                    return false
                },
                current: function() {
                    return this.array[this.index]
                },
                reset: function() {
                    this.index = -1
                },
                toArray: function() {
                    return this.array.slice(0)
                },
                countable: function() {
                    return true
                },
                count: function() {
                    return this.array.length
                }
            });
        var WrappedIterator = Iterator.inherit({
                ctor: function(iter) {
                    this.iter = iter
                },
                next: function() {
                    return this.iter.next()
                },
                current: function() {
                    return this.iter.current()
                },
                reset: function() {
                    return this.iter.reset()
                }
            });
        var MapIterator = WrappedIterator.inherit({
                ctor: function(iter, mapper) {
                    this.callBase(iter);
                    this.index = -1;
                    this.mapper = mapper
                },
                current: function() {
                    return this.mapper(this.callBase(), this.index)
                },
                next: function() {
                    var hasNext = this.callBase();
                    if (hasNext)
                        this.index++;
                    return hasNext
                }
            });
        var SortIterator = Iterator.inherit({
                ctor: function(iter, getter, desc) {
                    if (!(iter instanceof MapIterator))
                        iter = new MapIterator(iter, this._wrap);
                    this.iter = iter;
                    this.rules = [{
                            getter: getter,
                            desc: desc
                        }]
                },
                thenBy: function(getter, desc) {
                    var result = new SortIterator(this.sortedIter || this.iter, getter, desc);
                    if (!this.sortedIter)
                        result.rules = this.rules.concat(result.rules);
                    return result
                },
                next: function() {
                    this._ensureSorted();
                    return this.sortedIter.next()
                },
                current: function() {
                    this._ensureSorted();
                    return this.sortedIter.current()
                },
                reset: function() {
                    delete this.sortedIter
                },
                countable: function() {
                    return this.sortedIter || this.iter.countable()
                },
                count: function() {
                    if (this.sortedIter)
                        return this.sortedIter.count();
                    return this.iter.count()
                },
                _ensureSorted: function() {
                    if (this.sortedIter)
                        return;
                    $.each(this.rules, function() {
                        this.getter = compileGetter(this.getter)
                    });
                    this.sortedIter = new MapIterator(new ArrayIterator(this.iter.toArray().sort($.proxy(this._compare, this))), this._unwrap)
                },
                _wrap: function(record, index) {
                    return {
                            index: index,
                            value: record
                        }
                },
                _unwrap: function(wrappedItem) {
                    return wrappedItem.value
                },
                _compare: function(x, y) {
                    var xIndex = x.index,
                        yIndex = y.index;
                    x = x.value;
                    y = y.value;
                    if (x === y)
                        return xIndex - yIndex;
                    for (var i = 0, rulesCount = this.rules.length; i < rulesCount; i++) {
                        var rule = this.rules[i],
                            xValue = toComparable(rule.getter(x)),
                            yValue = toComparable(rule.getter(y)),
                            factor = rule.desc ? -1 : 1;
                        if (xValue < yValue)
                            return -factor;
                        if (xValue > yValue)
                            return factor;
                        if (xValue !== yValue)
                            return !xValue ? -factor : factor
                    }
                    return xIndex - yIndex
                }
            });
        var compileCriteria = function() {
                var compileGroup = function(crit) {
                        var operands = [],
                            bag = ["return function(d) { return "],
                            index = 0,
                            pushAnd = false;
                        $.each(crit, function() {
                            if ($.isArray(this) || $.isFunction(this)) {
                                if (pushAnd)
                                    bag.push(" && ");
                                operands.push(compileCriteria(this));
                                bag.push("op[", index, "](d)");
                                index++;
                                pushAnd = true
                            }
                            else {
                                bag.push(/and|&/i.test(this) ? " && " : " || ");
                                pushAnd = false
                            }
                        });
                        bag.push(" }");
                        return new Function("op", bag.join(""))(operands)
                    };
                var toString = function(value) {
                        return DX.utils.isDefined(value) ? value.toString() : ''
                    };
                var compileBinary = function(crit) {
                        crit = data.utils.normalizeBinaryCriterion(crit);
                        var getter = compileGetter(crit[0]),
                            op = crit[1],
                            value = crit[2];
                        value = toComparable(value);
                        switch (op.toLowerCase()) {
                            case"=":
                                return compileEquals(getter, value);
                            case"<>":
                                return compileEquals(getter, value, true);
                            case">":
                                return function(obj) {
                                        return toComparable(getter(obj)) > value
                                    };
                            case"<":
                                return function(obj) {
                                        return toComparable(getter(obj)) < value
                                    };
                            case">=":
                                return function(obj) {
                                        return toComparable(getter(obj)) >= value
                                    };
                            case"<=":
                                return function(obj) {
                                        return toComparable(getter(obj)) <= value
                                    };
                            case"startswith":
                                return function(obj) {
                                        return toComparable(toString(getter(obj))).indexOf(value) === 0
                                    };
                            case"endswith":
                                return function(obj) {
                                        var getterValue = toComparable(toString(getter(obj)));
                                        return getterValue.lastIndexOf(value) === getterValue.length - toString(value).length
                                    };
                            case"contains":
                                return function(obj) {
                                        return toComparable(toString(getter(obj))).indexOf(value) > -1
                                    };
                            case"notcontains":
                                return function(obj) {
                                        return toComparable(toString(getter(obj))).indexOf(value) === -1
                                    }
                        }
                        throw DX.Error("E4003", op);
                    };
                function compileEquals(getter, value, negate) {
                    return function(obj) {
                            obj = toComparable(getter(obj));
                            var result = useStrictComparison(value) ? obj === value : obj == value;
                            if (negate)
                                result = !result;
                            return result
                        }
                }
                function useStrictComparison(value) {
                    return value === "" || value === 0 || value === null || value === false || value === undefined
                }
                return function(crit) {
                        if ($.isFunction(crit))
                            return crit;
                        if ($.isArray(crit[0]))
                            return compileGroup(crit);
                        return compileBinary(crit)
                    }
            }();
        var FilterIterator = WrappedIterator.inherit({
                ctor: function(iter, criteria) {
                    this.callBase(iter);
                    this.criteria = compileCriteria(criteria)
                },
                next: function() {
                    while (this.iter.next())
                        if (this.criteria(this.current()))
                            return true;
                    return false
                }
            });
        var GroupIterator = Iterator.inherit({
                ctor: function(iter, getter) {
                    this.iter = iter;
                    this.getter = getter
                },
                next: function() {
                    this._ensureGrouped();
                    return this.groupedIter.next()
                },
                current: function() {
                    this._ensureGrouped();
                    return this.groupedIter.current()
                },
                reset: function() {
                    delete this.groupedIter
                },
                countable: function() {
                    return !!this.groupedIter
                },
                count: function() {
                    return this.groupedIter.count()
                },
                _ensureGrouped: function() {
                    if (this.groupedIter)
                        return;
                    var hash = {},
                        keys = [],
                        iter = this.iter,
                        getter = compileGetter(this.getter);
                    iter.reset();
                    while (iter.next()) {
                        var current = iter.current(),
                            key = getter(current);
                        if (key in hash)
                            hash[key].push(current);
                        else {
                            hash[key] = [current];
                            keys.push(key)
                        }
                    }
                    this.groupedIter = new ArrayIterator($.map(keys, function(key) {
                        return {
                                key: key,
                                items: hash[key]
                            }
                    }))
                }
            });
        var SelectIterator = WrappedIterator.inherit({
                ctor: function(iter, getter) {
                    this.callBase(iter);
                    this.getter = compileGetter(getter)
                },
                current: function() {
                    return this.getter(this.callBase())
                },
                countable: function() {
                    return this.iter.countable()
                },
                count: function() {
                    return this.iter.count()
                }
            });
        var SliceIterator = WrappedIterator.inherit({
                ctor: function(iter, skip, take) {
                    this.callBase(iter);
                    this.skip = Math.max(0, skip);
                    this.take = Math.max(0, take);
                    this.pos = 0
                },
                next: function() {
                    if (this.pos >= this.skip + this.take)
                        return false;
                    while (this.pos < this.skip && this.iter.next())
                        this.pos++;
                    this.pos++;
                    return this.iter.next()
                },
                reset: function() {
                    this.callBase();
                    this.pos = 0
                },
                countable: function() {
                    return this.iter.countable()
                },
                count: function() {
                    return Math.min(this.iter.count() - this.skip, this.take)
                }
            });
        queryImpl.array = function(iter, queryOptions) {
            queryOptions = queryOptions || {};
            if (!(iter instanceof Iterator))
                iter = new ArrayIterator(iter);
            var handleError = function(error) {
                    var handler = queryOptions.errorHandler;
                    if (handler)
                        handler(error);
                    data._errorHandler(error)
                };
            var aggregateCore = function(aggregator) {
                    var d = $.Deferred().fail(handleError),
                        seed,
                        step = aggregator.step,
                        finalize = aggregator.finalize;
                    try {
                        iter.reset();
                        if ("seed" in aggregator)
                            seed = aggregator.seed;
                        else
                            seed = iter.next() ? iter.current() : NaN;
                        var accumulator = seed;
                        while (iter.next())
                            accumulator = step(accumulator, iter.current());
                        d.resolve(finalize ? finalize(accumulator) : accumulator)
                    }
                    catch(x) {
                        d.reject(x)
                    }
                    return d.promise()
                };
            var aggregate = function(seed, step, finalize) {
                    if (arguments.length < 2)
                        return aggregateCore({step: arguments[0]});
                    return aggregateCore({
                            seed: seed,
                            step: step,
                            finalize: finalize
                        })
                };
            var standardAggregate = function(name) {
                    return aggregateCore(data.utils.aggregators[name])
                };
            var select = function(getter) {
                    if (!$.isFunction(getter) && !$.isArray(getter))
                        getter = $.makeArray(arguments);
                    return chainQuery(new SelectIterator(iter, getter))
                };
            var selectProp = function(name) {
                    return select(compileGetter(name))
                };
            var chainQuery = function(iter) {
                    return queryImpl.array(iter, queryOptions)
                };
            return {
                    toArray: function() {
                        return iter.toArray()
                    },
                    enumerate: function() {
                        var d = $.Deferred().fail(handleError);
                        try {
                            d.resolve(iter.toArray())
                        }
                        catch(x) {
                            d.reject(x)
                        }
                        return d.promise()
                    },
                    sortBy: function(getter, desc) {
                        return chainQuery(new SortIterator(iter, getter, desc))
                    },
                    thenBy: function(getter, desc) {
                        if (iter instanceof SortIterator)
                            return chainQuery(iter.thenBy(getter, desc));
                        throw DX.Error("E4004");
                    },
                    filter: function(criteria) {
                        if (!$.isArray(criteria))
                            criteria = $.makeArray(arguments);
                        return chainQuery(new FilterIterator(iter, criteria))
                    },
                    slice: function(skip, take) {
                        if (take === undefined)
                            take = Number.MAX_VALUE;
                        return chainQuery(new SliceIterator(iter, skip, take))
                    },
                    select: select,
                    groupBy: function(getter) {
                        return chainQuery(new GroupIterator(iter, getter))
                    },
                    aggregate: aggregate,
                    count: function() {
                        if (iter.countable()) {
                            var d = $.Deferred().fail(handleError);
                            try {
                                d.resolve(iter.count())
                            }
                            catch(x) {
                                d.reject(x)
                            }
                            return d.promise()
                        }
                        return standardAggregate("count")
                    },
                    sum: function(getter) {
                        if (getter)
                            return selectProp(getter).sum();
                        return standardAggregate("sum")
                    },
                    min: function(getter) {
                        if (getter)
                            return selectProp(getter).min();
                        return standardAggregate("min")
                    },
                    max: function(getter) {
                        if (getter)
                            return selectProp(getter).max();
                        return standardAggregate("max")
                    },
                    avg: function(getter) {
                        if (getter)
                            return selectProp(getter).avg();
                        return standardAggregate("avg")
                    }
                }
        }
    })(jQuery, DevExpress);
    /*! Module core, file data.query.remote.js */
    (function($, DX, undefined) {
        var data = DX.data,
            queryImpl = data.queryImpl;
        queryImpl.remote = function(url, queryOptions, tasks) {
            tasks = tasks || [];
            queryOptions = queryOptions || {};
            var createTask = function(name, args) {
                    return {
                            name: name,
                            args: args
                        }
                };
            var exec = function(executorTask) {
                    var d = $.Deferred(),
                        _adapterFactory,
                        _adapter,
                        _taskQueue,
                        _currentTask,
                        _mergedSortArgs;
                    var rejectWithNotify = function(error) {
                            var handler = queryOptions.errorHandler;
                            if (handler)
                                handler(error);
                            data._errorHandler(error);
                            d.reject(error)
                        };
                    function mergeSortTask(task) {
                        switch (task.name) {
                            case"sortBy":
                                _mergedSortArgs = [task.args];
                                return true;
                            case"thenBy":
                                if (!_mergedSortArgs)
                                    throw DX.Error("E4004");
                                _mergedSortArgs.push(task.args);
                                return true
                        }
                        return false
                    }
                    function unmergeSortTasks() {
                        var head = _taskQueue[0],
                            unmergedTasks = [];
                        if (head && head.name === "multiSort") {
                            _taskQueue.shift();
                            $.each(head.args[0], function() {
                                unmergedTasks.push(createTask(unmergedTasks.length ? "thenBy" : "sortBy", this))
                            })
                        }
                        _taskQueue = unmergedTasks.concat(_taskQueue)
                    }
                    try {
                        _adapterFactory = queryOptions.adapter || "odata";
                        if (!$.isFunction(_adapterFactory))
                            _adapterFactory = data.queryAdapters[_adapterFactory];
                        _adapter = _adapterFactory(queryOptions);
                        _taskQueue = [].concat(tasks).concat(executorTask);
                        while (_taskQueue.length) {
                            _currentTask = _taskQueue[0];
                            if (!mergeSortTask(_currentTask)) {
                                if (_mergedSortArgs) {
                                    _taskQueue.unshift(createTask("multiSort", [_mergedSortArgs]));
                                    _mergedSortArgs = null;
                                    continue
                                }
                                if (String(_currentTask.name) !== "enumerate")
                                    if (!_adapter[_currentTask.name] || _adapter[_currentTask.name].apply(_adapter, _currentTask.args) === false)
                                        break
                            }
                            _taskQueue.shift()
                        }
                        unmergeSortTasks();
                        _adapter.exec(url).done(function(result, extra) {
                            if (!_taskQueue.length)
                                d.resolve(result, extra);
                            else {
                                var clientChain = queryImpl.array(result, {errorHandler: queryOptions.errorHandler});
                                $.each(_taskQueue, function() {
                                    clientChain = clientChain[this.name].apply(clientChain, this.args)
                                });
                                clientChain.done(d.resolve).fail(d.reject)
                            }
                        }).fail(rejectWithNotify)
                    }
                    catch(x) {
                        rejectWithNotify(x)
                    }
                    return d.promise()
                };
            var query = {};
            $.each(["sortBy", "thenBy", "filter", "slice", "select", "groupBy"], function() {
                var name = String(this);
                query[name] = function() {
                    return queryImpl.remote(url, queryOptions, tasks.concat(createTask(name, arguments)))
                }
            });
            $.each(["count", "min", "max", "sum", "avg", "aggregate", "enumerate"], function() {
                var name = String(this);
                query[name] = function() {
                    return exec.call(this, createTask(name, arguments))
                }
            });
            return query
        }
    })(jQuery, DevExpress);
    /*! Module core, file data.odata.js */
    (function($, DX, undefined) {
        var data = DX.data,
            utils = DX.utils,
            Guid = data.Guid;
        var GUID_REGEX = /^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$/;
        var VERBOSE_DATE_REGEX = /^\/Date\((-?\d+)((\+|-)?(\d+)?)\)\/$/;
        var ISO8601_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/;
        var JSON_VERBOSE_MIME_TYPE = "application/json;odata=verbose";
        function stringify(object) {
            return JSON.stringify(object, replacer);
            function replacer(key, value) {
                if (this[key] instanceof Date)
                    return utils.formatIso8601Date(this[key]);
                return value
            }
        }
        function isAbsoluteUrl(url) {
            return /^(?:[a-z]+:)?\/\//i.test(url)
        }
        function toAbsoluteUrl(basePath, relativePath) {
            var part,
                baseParts = basePath.split("/"),
                relativeParts = relativePath.split("/");
            baseParts.pop();
            while (relativeParts.length) {
                part = relativeParts.shift();
                if (part === "..")
                    baseParts.pop();
                else
                    baseParts.push(part)
            }
            return baseParts.join("/")
        }
        var ajaxOptionsForRequest = function(request, requestOptions) {
                request = $.extend({
                    method: "get",
                    url: "",
                    params: {},
                    payload: null,
                    headers: {}
                }, request);
                requestOptions = requestOptions || {};
                var beforeSend = requestOptions.beforeSend;
                if (beforeSend)
                    beforeSend(request);
                var method = (request.method || "get").toLowerCase(),
                    isGet = method === "get",
                    useJsonp = isGet && requestOptions.jsonp,
                    params = $.extend({}, request.params),
                    ajaxData = isGet ? params : stringify(request.payload),
                    qs = !isGet && $.param(params),
                    url = request.url,
                    contentType = !isGet && JSON_VERBOSE_MIME_TYPE;
                if (qs)
                    url += (url.indexOf("?") > -1 ? "&" : "?") + qs;
                if (useJsonp)
                    ajaxData["$format"] = "json";
                return {
                        url: url,
                        data: ajaxData,
                        dataType: useJsonp ? "jsonp" : "json",
                        jsonp: useJsonp && "$callback",
                        type: method,
                        timeout: 30000,
                        headers: request.headers,
                        contentType: contentType,
                        accepts: {json: [JSON_VERBOSE_MIME_TYPE, "text/plain"].join()},
                        xhrFields: {withCredentials: requestOptions.withCredentials}
                    }
            };
        var sendRequest = function(request, requestOptions) {
                var d = $.Deferred();
                var options = ajaxOptionsForRequest(request, requestOptions);
                $.ajax(options).always(function(obj, textStatus) {
                    var tuplet = interpretJsonFormat(obj, textStatus),
                        error = tuplet.error,
                        data = tuplet.data,
                        nextUrl = tuplet.nextUrl,
                        extra;
                    if (error)
                        d.reject(error);
                    else if (requestOptions.countOnly)
                        d.resolve(tuplet.count);
                    else if (nextUrl) {
                        if (!isAbsoluteUrl(nextUrl))
                            nextUrl = toAbsoluteUrl(options.url, nextUrl);
                        sendRequest({url: nextUrl}, requestOptions).fail(d.reject).done(function(nextData) {
                            d.resolve(data.concat(nextData))
                        })
                    }
                    else {
                        if (isFinite(tuplet.count))
                            extra = {totalCount: tuplet.count};
                        d.resolve(data, extra)
                    }
                });
                return d.promise()
            };
        var formatDotNetError = function(errorObj) {
                var message,
                    currentError = errorObj;
                if ("message" in errorObj)
                    if (errorObj.message.value)
                        message = errorObj.message.value;
                    else
                        message = errorObj.message;
                while (currentError = currentError.innererror || currentError.internalexception) {
                    message = currentError.message;
                    if (currentError.internalexception && message.indexOf("inner exception") === -1)
                        break
                }
                return message
            };
        var errorFromResponse = function(obj, textStatus) {
                if (textStatus === "nocontent")
                    return null;
                var httpStatus = 200,
                    message = "Unknown error",
                    response = obj;
                if (textStatus !== "success") {
                    httpStatus = obj.status;
                    message = data.utils.errorMessageFromXhr(obj, textStatus);
                    try {
                        response = $.parseJSON(obj.responseText)
                    }
                    catch(x) {}
                }
                var errorObj = response && (response.error || response["@odata.error"]);
                if (errorObj) {
                    message = formatDotNetError(errorObj) || message;
                    if (httpStatus === 200)
                        httpStatus = 500;
                    if (errorObj.code)
                        httpStatus = Number(errorObj.code);
                    return $.extend(Error(message), {
                            httpStatus: httpStatus,
                            errorDetails: errorObj
                        })
                }
                else if (httpStatus !== 200)
                    return $.extend(Error(message), {httpStatus: httpStatus})
            };
        var interpretJsonFormat = function(obj, textStatus) {
                var error = errorFromResponse(obj, textStatus),
                    value;
                if (error)
                    return {error: error};
                if (!$.isPlainObject(obj))
                    return {data: obj};
                if ("d" in obj && (utils.isArray(obj.d) || utils.isObject(obj.d)))
                    value = interpretVerboseJsonFormat(obj, textStatus);
                else
                    value = interpretLightJsonFormat(obj, textStatus);
                transformTypes(value);
                return value
            };
        var interpretVerboseJsonFormat = function(obj, textStatus) {
                var data = obj.d;
                if (!data)
                    return {error: Error("Malformed or unsupported JSON response received")};
                data = data.results || data;
                return {
                        data: data,
                        nextUrl: obj.d.__next,
                        count: parseInt(obj.d.__count, 10)
                    }
            };
        var interpretLightJsonFormat = function(obj, textStatus) {
                var data = obj.value || obj;
                if (!data)
                    return {error: Error("Malformed or unsupported JSON response received")};
                return {
                        data: data,
                        nextUrl: obj["@odata.nextLink"],
                        count: parseInt(obj["@odata.count"], 10)
                    }
            };
        var EdmLiteral = DX.Class.inherit({
                ctor: function(value) {
                    this._value = value
                },
                valueOf: function() {
                    return this._value
                }
            });
        var transformTypes = function(obj) {
                $.each(obj, function(key, value) {
                    if (value !== null && typeof value === "object")
                        transformTypes(value);
                    else if (typeof value === "string")
                        if (GUID_REGEX.test(value))
                            obj[key] = new Guid(value);
                        else if (value.match(VERBOSE_DATE_REGEX)) {
                            var date = new Date(Number(RegExp.$1) + RegExp.$2 * 60 * 1000);
                            obj[key] = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000)
                        }
                        else if (ISO8601_DATE_REGEX.test(value))
                            obj[key] = new Date(utils.parseIso8601Date(obj[key]).valueOf())
                })
            };
        var serializeDate = function() {
                var pad = function(part) {
                        part = String(part);
                        if (part.length < 2)
                            part = "0" + part;
                        return part
                    };
                return function(date) {
                        var result = ["datetime'", date.getFullYear(), "-", pad(date.getMonth() + 1), "-", pad(date.getDate())];
                        if (date.getHours() || date.getMinutes() || date.getSeconds() || date.getMilliseconds()) {
                            result.push("T", pad(date.getHours()), ":", pad(date.getMinutes()), ":", pad(date.getSeconds()));
                            if (date.getMilliseconds())
                                result.push(".", date.getMilliseconds())
                        }
                        result.push("'");
                        return result.join("")
                    }
            }();
        var serializeString = function(value) {
                return "'" + value.replace(/</g, "%26lt").replace(/'/g, "''") + "'"
            };
        var serializePropName = function(propName) {
                if (propName instanceof EdmLiteral)
                    return propName.valueOf();
                return propName.replace(/\./g, "/")
            };
        var serializeValueV4 = function(value) {
                if (value instanceof Date)
                    return utils.formatIso8601Date(value);
                return serializeValueV2(value)
            };
        var serializeValueV2 = function(value) {
                if (value instanceof Date)
                    return serializeDate(value);
                if (value instanceof Guid)
                    return "guid'" + value + "'";
                if (value instanceof EdmLiteral)
                    return value.valueOf();
                if (typeof value === "string")
                    return serializeString(value);
                return String(value)
            };
        var DEFAULT_PROTOCOL_VERSION = 2;
        var serializeValue = function(value, protocolVersion) {
                protocolVersion = protocolVersion || DEFAULT_PROTOCOL_VERSION;
                switch (protocolVersion) {
                    case 2:
                    case 3:
                        return serializeValueV2(value);
                    case 4:
                        return serializeValueV4(value);
                    default:
                        throw DX.Error("E4002");
                }
            };
        var serializeKey = function(key, protocolVersion) {
                if ($.isPlainObject(key)) {
                    var parts = [];
                    $.each(key, function(k, v) {
                        parts.push(serializePropName(k) + "=" + serializeValue(v, protocolVersion))
                    });
                    return parts.join()
                }
                return serializeValue(key)
            };
        var keyConverters = {
                String: function(value) {
                    return value + ""
                },
                Int32: function(value) {
                    return Math.floor(value)
                },
                Int64: function(value) {
                    if (value instanceof EdmLiteral)
                        return value;
                    return new EdmLiteral(value + "L")
                },
                Guid: function(value) {
                    if (value instanceof Guid)
                        return value;
                    return new Guid(value)
                },
                Boolean: function(value) {
                    return !!value
                },
                Single: function(value) {
                    if (value instanceof EdmLiteral)
                        return value;
                    return new EdmLiteral(value + "f")
                },
                Decimal: function(value) {
                    if (value instanceof EdmLiteral)
                        return value;
                    return new EdmLiteral(value + "m")
                }
            };
        var compileCriteria = function() {
                var createBinaryOperationFormatter = function(op) {
                        return function(prop, val, bag) {
                                bag.push(prop, " ", op, " ", val)
                            }
                    };
                var createStringFuncFormatter = function(op, reverse) {
                        return function(prop, val, bag) {
                                if (reverse)
                                    bag.push(op, "(", val, ",", prop, ")");
                                else
                                    bag.push(op, "(", prop, ",", val, ")")
                            }
                    };
                var formatters = {
                        "=": createBinaryOperationFormatter("eq"),
                        "<>": createBinaryOperationFormatter("ne"),
                        ">": createBinaryOperationFormatter("gt"),
                        ">=": createBinaryOperationFormatter("ge"),
                        "<": createBinaryOperationFormatter("lt"),
                        "<=": createBinaryOperationFormatter("le"),
                        startswith: createStringFuncFormatter("startswith"),
                        endswith: createStringFuncFormatter("endswith")
                    };
                var formattersV2 = $.extend({}, formatters, {
                        contains: createStringFuncFormatter("substringof", true),
                        notcontains: createStringFuncFormatter("not substringof", true)
                    });
                var formattersV4 = $.extend({}, formatters, {
                        contains: createStringFuncFormatter("contains"),
                        notcontains: createStringFuncFormatter("not contains")
                    });
                var compileBinary = function(criteria, bag, protocolVersion) {
                        criteria = data.utils.normalizeBinaryCriterion(criteria);
                        var op = criteria[1],
                            formatters = protocolVersion === 4 ? formattersV4 : formattersV2,
                            formatter = formatters[op.toLowerCase()];
                        if (!formatter)
                            throw DX.Error("E4003", op);
                        formatter(serializePropName(criteria[0]), serializeValue(criteria[2], protocolVersion), bag)
                    };
                var compileGroup = function(criteria, bag, protocolVersion) {
                        var pushAnd = false;
                        $.each(criteria, function() {
                            if ($.isArray(this)) {
                                if (pushAnd)
                                    bag.push(" and ");
                                bag.push("(");
                                compileCore(this, bag, protocolVersion);
                                bag.push(")");
                                pushAnd = true
                            }
                            else {
                                bag.push(/and|&/i.test(this) ? " and " : " or ");
                                pushAnd = false
                            }
                        })
                    };
                var compileCore = function(criteria, bag, protocolVersion) {
                        if ($.isArray(criteria[0]))
                            compileGroup(criteria, bag, protocolVersion);
                        else
                            compileBinary(criteria, bag, protocolVersion)
                    };
                return function(criteria, protocolVersion) {
                        var bag = [];
                        compileCore(criteria, bag, protocolVersion);
                        return bag.join("")
                    }
            }();
        var createODataQueryAdapter = function(queryOptions) {
                var _sorting = [],
                    _criteria = [],
                    _select,
                    _skip,
                    _take,
                    _countQuery;
                var hasSlice = function() {
                        return _skip || _take !== undefined
                    };
                var generateExpand = function() {
                        var hash = {};
                        if (queryOptions.expand)
                            $.each($.makeArray(queryOptions.expand), function() {
                                hash[serializePropName(this)] = 1
                            });
                        if (_select)
                            $.each(_select, function() {
                                var path = this.split(".");
                                if (path.length < 2)
                                    return;
                                path.pop();
                                hash[serializePropName(path.join("."))] = 1
                            });
                        return $.map(hash, function(k, v) {
                                return v
                            }).join() || undefined
                    };
                var requestData = function() {
                        var result = {};
                        if (!_countQuery) {
                            if (_sorting.length)
                                result["$orderby"] = _sorting.join(",");
                            if (_skip)
                                result["$skip"] = _skip;
                            if (_take !== undefined)
                                result["$top"] = _take;
                            if (_select)
                                result["$select"] = serializePropName(_select.join());
                            result["$expand"] = generateExpand()
                        }
                        if (_criteria.length)
                            result["$filter"] = compileCriteria(_criteria.length < 2 ? _criteria[0] : _criteria, queryOptions.version);
                        if (_countQuery)
                            result["$top"] = 0;
                        if (queryOptions.requireTotalCount || _countQuery)
                            if (queryOptions.version !== 4)
                                result["$inlinecount"] = "allpages";
                            else
                                result["$count"] = "true";
                        return result
                    };
                return {
                        exec: function(url) {
                            return sendRequest({
                                    url: url,
                                    params: $.extend(requestData(), queryOptions && queryOptions.params)
                                }, {
                                    beforeSend: queryOptions.beforeSend,
                                    jsonp: queryOptions.jsonp,
                                    withCredentials: queryOptions.withCredentials,
                                    countOnly: _countQuery
                                })
                        },
                        multiSort: function(args) {
                            var rules;
                            if (hasSlice())
                                return false;
                            for (var i = 0; i < args.length; i++) {
                                var getter = args[i][0],
                                    desc = !!args[i][1],
                                    rule;
                                if (typeof getter !== "string")
                                    return false;
                                rule = serializePropName(getter);
                                if (desc)
                                    rule += " desc";
                                rules = rules || [];
                                rules.push(rule)
                            }
                            _sorting = rules
                        },
                        slice: function(skipCount, takeCount) {
                            if (hasSlice())
                                return false;
                            _skip = skipCount;
                            _take = takeCount
                        },
                        filter: function(criterion) {
                            if (hasSlice() || $.isFunction(criterion))
                                return false;
                            if (!$.isArray(criterion))
                                criterion = $.makeArray(arguments);
                            if (_criteria.length)
                                _criteria.push("and");
                            _criteria.push(criterion)
                        },
                        select: function(expr) {
                            if (_select || $.isFunction(expr))
                                return false;
                            if (!$.isArray(expr))
                                expr = $.makeArray(arguments);
                            _select = expr
                        },
                        count: function() {
                            _countQuery = true
                        }
                    }
            };
        $.extend(true, data, {
            EdmLiteral: EdmLiteral,
            utils: {odata: {
                    sendRequest: sendRequest,
                    serializePropName: serializePropName,
                    serializeValue: serializeValue,
                    serializeKey: serializeKey,
                    keyConverters: keyConverters
                }},
            queryAdapters: {odata: createODataQueryAdapter}
        });
        data.OData__internals = {interpretJsonFormat: interpretJsonFormat}
    })(jQuery, DevExpress);
    /*! Module core, file data.store.abstract.js */
    (function($, DX, undefined) {
        var Class = DX.Class,
            abstract = DX.abstract,
            data = DX.data,
            normalizeSortingInfo = data.utils.normalizeSortingInfo;
        var STORE_CALLBACK_NAMES = ["loading", "loaded", "modifying", "modified", "inserting", "inserted", "updating", "updated", "removing", "removed"];
        function multiLevelGroup(query, groupInfo) {
            query = query.groupBy(groupInfo[0].selector);
            if (groupInfo.length > 1)
                query = query.select(function(g) {
                    return $.extend({}, g, {items: multiLevelGroup(data.query(g.items), groupInfo.slice(1)).toArray()})
                });
            return query
        }
        data.utils.multiLevelGroup = multiLevelGroup;
        function arrangeSortingInfo(groupInfo, sortInfo) {
            var filteredGroup = [];
            $.each(groupInfo, function(_, group) {
                var collision = $.grep(sortInfo, function(sort) {
                        return group.selector == sort.selector
                    });
                if (collision.length < 1)
                    filteredGroup.push(group)
            });
            return filteredGroup.concat(sortInfo)
        }
        data.utils.arrangeSortingInfo = arrangeSortingInfo;
        data.Store = Class.inherit({
            ctor: function(options) {
                var that = this;
                options = options || {};
                $.each(STORE_CALLBACK_NAMES, function() {
                    var eventName = this;
                    var callbacks = that[eventName] = $.Callbacks();
                    var originalAdd = callbacks.add;
                    callbacks.add = function() {
                        DX.log("W0003", "Store", eventName, "14.2", "Use the '" + eventName + "' event instead");
                        return originalAdd.apply(eventName, arguments)
                    };
                    if (eventName in options)
                        callbacks.add(options[eventName]);
                    var propertyName = "on" + eventName.charAt(0).toUpperCase() + eventName.slice(1);
                    if (propertyName in options)
                        that.on(eventName, options[propertyName])
                });
                this._key = options.key;
                this._errorHandler = options.errorHandler;
                this._useDefaultSearch = true
            },
            _customLoadOptions: function() {
                return null
            },
            key: function() {
                return this._key
            },
            keyOf: function(obj) {
                if (!this._keyGetter)
                    this._keyGetter = data.utils.compileGetter(this.key());
                return this._keyGetter(obj)
            },
            _requireKey: function() {
                if (!this.key())
                    throw DX.Error("E4005");
            },
            load: function(options) {
                var that = this;
                options = options || {};
                this.fireEvent("loading", [options]);
                this.loading.fire(options);
                return this._loadImpl(options).done(function(result, extra) {
                        that.fireEvent("loaded", [result, options]);
                        that.loaded.fire(result, extra)
                    })
            },
            _loadImpl: function(options) {
                var filter = options.filter,
                    sort = options.sort,
                    select = options.select,
                    group = options.group,
                    skip = options.skip,
                    take = options.take,
                    q = this.createQuery(options);
                if (filter)
                    q = q.filter(filter);
                if (group)
                    group = normalizeSortingInfo(group);
                if (sort || group) {
                    sort = normalizeSortingInfo(sort || []);
                    if (group)
                        sort = arrangeSortingInfo(group, sort);
                    $.each(sort, function(index) {
                        q = q[index ? "thenBy" : "sortBy"](this.selector, this.desc)
                    })
                }
                if (select)
                    q = q.select(select);
                if (group)
                    q = multiLevelGroup(q, group);
                if (take || skip)
                    q = q.slice(skip || 0, take);
                return q.enumerate()
            },
            createQuery: abstract,
            totalCount: function(options) {
                return this._addFailHandlers(this._totalCountImpl(options))
            },
            _totalCountImpl: function(options) {
                options = options || {};
                var q = this.createQuery(),
                    group = options.group,
                    filter = options.filter;
                if (filter)
                    q = q.filter(filter);
                if (group) {
                    group = normalizeSortingInfo(group);
                    q = multiLevelGroup(q, group)
                }
                return q.count()
            },
            byKey: function(key, extraOptions) {
                return this._addFailHandlers(this._byKeyImpl(key, extraOptions))
            },
            _byKeyImpl: abstract,
            insert: function(values) {
                var that = this;
                that.fireEvent("modifying");
                that.fireEvent("inserting", [values]);
                that.modifying.fire();
                that.inserting.fire(values);
                return that._addFailHandlers(that._insertImpl(values).done(function(callbackValues, callbackKey) {
                        that.fireEvent("inserted", [callbackValues, callbackKey]);
                        that.fireEvent("modified");
                        that.inserted.fire(callbackValues, callbackKey);
                        that.modified.fire()
                    }))
            },
            _insertImpl: abstract,
            update: function(key, values) {
                var that = this;
                that.fireEvent("modifying");
                that.fireEvent("updating", [key, values]);
                that.modifying.fire();
                that.updating.fire(key, values);
                return that._addFailHandlers(that._updateImpl(key, values).done(function(callbackKey, callbackValues) {
                        that.fireEvent("updated", [callbackKey, callbackValues]);
                        that.fireEvent("modified");
                        that.updated.fire(callbackKey, callbackValues);
                        that.modified.fire()
                    }))
            },
            _updateImpl: abstract,
            remove: function(key) {
                var that = this;
                that.fireEvent("modifying");
                that.fireEvent("removing", [key]);
                that.modifying.fire();
                that.removing.fire(key);
                return that._addFailHandlers(that._removeImpl(key).done(function(callbackKey) {
                        that.fireEvent("removed", [callbackKey]);
                        that.fireEvent("modified");
                        that.removed.fire(callbackKey);
                        that.modified.fire()
                    }))
            },
            _removeImpl: abstract,
            _addFailHandlers: function(deferred) {
                return deferred.fail(this._errorHandler, data._errorHandler)
            }
        }).include(DX.EventsMixin)
    })(jQuery, DevExpress);
    /*! Module core, file data.store.array.js */
    (function($, DX, undefined) {
        var data = DX.data,
            Guid = data.Guid;
        var trivialPromise = function(_) {
                var d = $.Deferred();
                return d.resolve.apply(d, arguments).promise()
            };
        var rejectedPromise = function(_) {
                var d = $.Deferred();
                return d.reject.apply(d, arguments).promise()
            };
        data.ArrayStore = data.Store.inherit({
            ctor: function(options) {
                if ($.isArray(options))
                    options = {data: options};
                else
                    options = options || {};
                this.callBase(options);
                var initialArray = options.data;
                if (initialArray && !$.isArray(initialArray))
                    throw DX.Error("E4006");
                this._array = initialArray || []
            },
            createQuery: function() {
                return data.query(this._array, {errorHandler: this._errorHandler})
            },
            _byKeyImpl: function(key) {
                var index = this._indexByKey(key);
                if (index === -1)
                    return rejectedPromise();
                return trivialPromise(this._array[index])
            },
            _insertImpl: function(values) {
                var keyExpr = this.key(),
                    keyValue,
                    obj;
                if ($.isPlainObject(values))
                    obj = $.extend({}, values);
                else
                    obj = values;
                if (keyExpr) {
                    keyValue = this.keyOf(obj);
                    if (keyValue === undefined || typeof keyValue === "object" && $.isEmptyObject(keyValue)) {
                        if ($.isArray(keyExpr))
                            throw DX.Error("E4007");
                        keyValue = obj[keyExpr] = String(new Guid)
                    }
                    else if (this._array[this._indexByKey(keyValue)] !== undefined)
                        return rejectedPromise(DX.Error("E4008"))
                }
                else
                    keyValue = obj;
                this._array.push(obj);
                return trivialPromise(values, keyValue)
            },
            _updateImpl: function(key, values) {
                var target;
                if (this.key()) {
                    var index = this._indexByKey(key);
                    if (index < 0)
                        return rejectedPromise(DX.Error("E4009"));
                    target = this._array[index]
                }
                else
                    target = key;
                DX.utils.deepExtendArraySafe(target, values);
                return trivialPromise(key, values)
            },
            _removeImpl: function(key) {
                var index = this._indexByKey(key);
                if (index > -1)
                    this._array.splice(index, 1);
                return trivialPromise(key)
            },
            _indexByKey: function(key) {
                for (var i = 0, arrayLength = this._array.length; i < arrayLength; i++)
                    if (data.utils.keysEqual(this.key(), this.keyOf(this._array[i]), key))
                        return i;
                return -1
            },
            clear: function() {
                this._array = []
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.store.local.js */
    (function($, DX, undefined) {
        var Class = DX.Class,
            abstract = DX.abstract,
            data = DX.data;
        var LocalStoreBackend = Class.inherit({
                ctor: function(store, storeOptions) {
                    this._store = store;
                    this._dirty = false;
                    var immediate = this._immediate = storeOptions.immediate;
                    var flushInterval = Math.max(100, storeOptions.flushInterval || 10 * 1000);
                    if (!immediate) {
                        var saveProxy = $.proxy(this.save, this);
                        setInterval(saveProxy, flushInterval);
                        $(window).on("beforeunload", saveProxy);
                        if (window.cordova)
                            document.addEventListener("pause", saveProxy, false)
                    }
                },
                notifyChanged: function() {
                    this._dirty = true;
                    if (this._immediate)
                        this.save()
                },
                load: function() {
                    this._store._array = this._loadImpl();
                    this._dirty = false
                },
                save: function() {
                    if (!this._dirty)
                        return;
                    this._saveImpl(this._store._array);
                    this._dirty = false
                },
                _loadImpl: abstract,
                _saveImpl: abstract
            });
        var DomLocalStoreBackend = LocalStoreBackend.inherit({
                ctor: function(store, storeOptions) {
                    this.callBase(store, storeOptions);
                    var name = storeOptions.name;
                    if (!name)
                        throw DX.Error("E4013");
                    this._key = "dx-data-localStore-" + name
                },
                _loadImpl: function() {
                    var raw = localStorage.getItem(this._key);
                    if (raw)
                        return JSON.parse(raw);
                    return []
                },
                _saveImpl: function(array) {
                    if (!array.length)
                        localStorage.removeItem(this._key);
                    else
                        localStorage.setItem(this._key, JSON.stringify(array))
                }
            });
        var localStoreBackends = {dom: DomLocalStoreBackend};
        data.LocalStore = data.ArrayStore.inherit({
            ctor: function(options) {
                if (typeof options === "string")
                    options = {name: options};
                else
                    options = options || {};
                this.callBase(options);
                this._backend = new localStoreBackends[options.backend || "dom"](this, options);
                this._backend.load()
            },
            clear: function() {
                this.callBase();
                this._backend.notifyChanged()
            },
            _insertImpl: function(values) {
                var b = this._backend;
                return this.callBase(values).done($.proxy(b.notifyChanged, b))
            },
            _updateImpl: function(key, values) {
                var b = this._backend;
                return this.callBase(key, values).done($.proxy(b.notifyChanged, b))
            },
            _removeImpl: function(key) {
                var b = this._backend;
                return this.callBase(key).done($.proxy(b.notifyChanged, b))
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.store.odata.js */
    (function($, DX, undefined) {
        var Class = DX.Class,
            data = DX.data,
            utils = DX.utils,
            odataUtils = data.utils.odata;
        var escapeServiceOperationParams = function(params, version) {
                if (!params)
                    return params;
                var result = {};
                $.each(params, function(k, v) {
                    result[k] = odataUtils.serializeValue(v, version)
                });
                return result
            };
        var convertSimpleKey = function(keyType, keyValue) {
                var converter = odataUtils.keyConverters[keyType];
                if (!converter)
                    throw DX.Error("E4014", keyType);
                return converter(keyValue)
            };
        var SharedMethods = {
                _extractServiceOptions: function(options) {
                    options = options || {};
                    this._url = String(options.url).replace(/\/+$/, "");
                    this._beforeSend = options.beforeSend;
                    this._jsonp = options.jsonp;
                    this._version = options.version;
                    this._withCredentials = options.withCredentials
                },
                _sendRequest: function(url, method, params, payload) {
                    return odataUtils.sendRequest({
                            url: url,
                            method: method,
                            params: params || {},
                            payload: payload
                        }, {
                            beforeSend: this._beforeSend,
                            jsonp: this._jsonp,
                            withCredentials: this._withCredentials
                        })
                },
                version: function() {
                    return this._version
                }
            };
        var ODataStore = data.Store.inherit({
                ctor: function(options) {
                    this.callBase(options);
                    this._extractServiceOptions(options);
                    this._keyType = options.keyType
                },
                _customLoadOptions: function() {
                    return ["expand", "customQueryParams"]
                },
                _byKeyImpl: function(key, extraOptions) {
                    var params = {};
                    if (extraOptions)
                        if (extraOptions.expand)
                            params["$expand"] = $.map($.makeArray(extraOptions.expand), odataUtils.serializePropName).join();
                    return this._sendRequest(this._byKeyUrl(key), "GET", params)
                },
                createQuery: function(loadOptions) {
                    loadOptions = loadOptions || {};
                    return data.query(this._url, {
                            beforeSend: this._beforeSend,
                            errorHandler: this._errorHandler,
                            jsonp: this._jsonp,
                            version: this._version,
                            withCredentials: this._withCredentials,
                            params: escapeServiceOperationParams(loadOptions.customQueryParams, this._version),
                            expand: loadOptions.expand,
                            requireTotalCount: loadOptions.requireTotalCount
                        })
                },
                _insertImpl: function(values) {
                    this._requireKey();
                    var that = this,
                        d = $.Deferred();
                    $.when(this._sendRequest(this._url, "POST", null, values)).done(function(serverResponse) {
                        d.resolve(values, that.keyOf(serverResponse))
                    }).fail(d.reject, d);
                    return d.promise()
                },
                _updateImpl: function(key, values) {
                    var d = $.Deferred();
                    $.when(this._sendRequest(this._byKeyUrl(key), "MERGE", null, values)).done(function() {
                        d.resolve(key, values)
                    }).fail(d.reject, d);
                    return d.promise()
                },
                _removeImpl: function(key) {
                    var d = $.Deferred();
                    $.when(this._sendRequest(this._byKeyUrl(key), "DELETE")).done(function() {
                        d.resolve(key)
                    }).fail(d.reject, d);
                    return d.promise()
                },
                _byKeyUrl: function(key) {
                    var keyObj = key,
                        keyType = this._keyType;
                    if ($.isPlainObject(keyType)) {
                        keyObj = {};
                        $.each(keyType, function(subKeyName, subKeyType) {
                            keyObj[subKeyName] = convertSimpleKey(subKeyType, key[subKeyName])
                        })
                    }
                    else if (keyType)
                        keyObj = convertSimpleKey(keyType, key);
                    return this._url + "(" + encodeURIComponent(odataUtils.serializeKey(keyObj, this._version)) + ")"
                }
            }).include(SharedMethods);
        var ODataContext = Class.inherit({
                ctor: function(options) {
                    var that = this;
                    that._extractServiceOptions(options);
                    that._errorHandler = options.errorHandler;
                    $.each(options.entities || [], function(entityAlias, entityOptions) {
                        that[entityAlias] = new ODataStore($.extend({}, options, {url: that._url + "/" + encodeURIComponent(entityOptions.name || entityAlias)}, entityOptions))
                    })
                },
                get: function(operationName, params) {
                    return this.invoke(operationName, params, "GET")
                },
                invoke: function(operationName, params, httpMethod) {
                    httpMethod = httpMethod || "POST";
                    var d = $.Deferred();
                    $.when(this._sendRequest(this._url + "/" + encodeURIComponent(operationName), httpMethod, escapeServiceOperationParams(params, this._version))).done(function(r) {
                        if (r && operationName in r)
                            r = r[operationName];
                        d.resolve(r)
                    }).fail([this._errorHandler, data._errorHandler, d.reject]);
                    return d.promise()
                },
                objectLink: function(entityAlias, key) {
                    var store = this[entityAlias];
                    if (!store)
                        throw DX.Error("E4015", entityAlias);
                    if (!utils.isDefined(key))
                        return null;
                    return {__metadata: {uri: store._byKeyUrl(key)}}
                }
            }).include(SharedMethods);
        $.extend(data, {
            ODataStore: ODataStore,
            ODataContext: ODataContext
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.store.custom.js */
    (function($, DX, undefined) {
        var data = DX.data;
        var TOTAL_COUNT = "totalCount",
            LOAD = "load",
            BY_KEY = "byKey",
            INSERT = "insert",
            UPDATE = "update",
            REMOVE = "remove";
        function isPromise(obj) {
            return obj && $.isFunction(obj.then)
        }
        function trivialPromise(value) {
            return $.Deferred().resolve(value).promise()
        }
        function ensureRequiredFuncOption(name, obj) {
            if (!$.isFunction(obj))
                throw DX.Error("E4011", name);
        }
        function throwInvalidUserFuncResult(name) {
            throw DX.Error("E4012", name);
        }
        function createUserFuncFailureHandler(pendingDeferred) {
            function errorMessageFromXhr(promiseArguments) {
                var xhr = promiseArguments[0],
                    textStatus = promiseArguments[1];
                if (!xhr || !xhr.getResponseHeader)
                    return null;
                return data.utils.errorMessageFromXhr(xhr, textStatus)
            }
            return function(arg) {
                    var error;
                    if (arg instanceof Error)
                        error = arg;
                    else
                        error = new Error(errorMessageFromXhr(arguments) || arg && String(arg) || "Unknown error");
                    pendingDeferred.reject(error)
                }
        }
        data.CustomStore = data.Store.inherit({
            ctor: function(options) {
                options = options || {};
                this.callBase(options);
                this._useDefaultSearch = false;
                this._loadFunc = options[LOAD];
                this._totalCountFunc = options[TOTAL_COUNT];
                this._byKeyFunc = options[BY_KEY] || options.lookup;
                this._insertFunc = options[INSERT];
                this._updateFunc = options[UPDATE];
                this._removeFunc = options[REMOVE]
            },
            createQuery: function() {
                throw DX.Error("E4010");
            },
            _totalCountImpl: function(options) {
                var userFunc = this._totalCountFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(TOTAL_COUNT, userFunc);
                userResult = userFunc(options);
                if (!isPromise(userResult)) {
                    userResult = Number(userResult);
                    if (!isFinite(userResult))
                        throwInvalidUserFuncResult(TOTAL_COUNT);
                    userResult = trivialPromise(userResult)
                }
                userResult.then(function(count) {
                    d.resolve(Number(count))
                }, createUserFuncFailureHandler(d));
                return d.promise()
            },
            _loadImpl: function(options) {
                var userFunc = this._loadFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(LOAD, userFunc);
                userResult = userFunc(options);
                if ($.isArray(userResult))
                    userResult = trivialPromise(userResult);
                else if (userResult === null || userResult === undefined)
                    userResult = trivialPromise([]);
                else if (!isPromise(userResult))
                    throwInvalidUserFuncResult(LOAD);
                userResult.then(function(data, extra) {
                    d.resolve(data, extra)
                }, createUserFuncFailureHandler(d));
                return this._addFailHandlers(d.promise())
            },
            _byKeyImpl: function(key) {
                var userFunc = this._byKeyFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(BY_KEY, userFunc);
                userResult = userFunc(key);
                if (!isPromise(userResult))
                    userResult = trivialPromise(userResult);
                userResult.then(function(obj) {
                    d.resolve(obj)
                }, createUserFuncFailureHandler(d));
                return d.promise()
            },
            _insertImpl: function(values) {
                var userFunc = this._insertFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(INSERT, userFunc);
                userResult = userFunc(values);
                if (!isPromise(userResult))
                    userResult = trivialPromise(userResult);
                userResult.then(function(newKey) {
                    d.resolve(values, newKey)
                }, createUserFuncFailureHandler(d));
                return d.promise()
            },
            _updateImpl: function(key, values) {
                var userFunc = this._updateFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(UPDATE, userFunc);
                userResult = userFunc(key, values);
                if (!isPromise(userResult))
                    userResult = trivialPromise();
                userResult.then(function() {
                    d.resolve(key, values)
                }, createUserFuncFailureHandler(d));
                return d.promise()
            },
            _removeImpl: function(key) {
                var userFunc = this._removeFunc,
                    userResult,
                    d = $.Deferred();
                ensureRequiredFuncOption(REMOVE, userFunc);
                userResult = userFunc(key);
                if (!isPromise(userResult))
                    userResult = trivialPromise();
                userResult.then(function() {
                    d.resolve(key)
                }, createUserFuncFailureHandler(d));
                return d.promise()
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file data.dataSource.js */
    (function($, DX, undefined) {
        var data = DX.data,
            CustomStore = data.CustomStore,
            Class = DX.Class;
        var storeTypeRegistry = {
                jaydata: "JayDataStore",
                breeze: "BreezeStore",
                odata: "ODataStore",
                local: "LocalStore",
                array: "ArrayStore"
            };
        var nextLoadOperationId = function() {
                var id = -1;
                return function() {
                        return ++id
                    }
            }();
        var canceledOperationsRegistry = function() {
                var registry = {};
                return {
                        add: function(operationId) {
                            registry[operationId] = true
                        },
                        has: function(operationId) {
                            return operationId in registry
                        },
                        remove: function(operationId) {
                            delete registry[operationId]
                        }
                    }
            }();
        var ensureIsNotRejected = function(loadOperationId, pendingDeferred) {
                if (canceledOperationsRegistry.has(loadOperationId)) {
                    canceledOperationsRegistry.remove(loadOperationId);
                    pendingDeferred.reject("canceled");
                    return false
                }
                return true
            };
        function normalizeDataSourceOptions(options) {
            var store;
            function createCustomStoreFromLoadFunc() {
                var storeConfig = {};
                $.each(["key", "load", "byKey", "lookup", "totalCount", "insert", "update", "remove"], function() {
                    storeConfig[this] = options[this];
                    delete options[this]
                });
                return new CustomStore(storeConfig)
            }
            function createStoreFromConfig(storeConfig) {
                var storeCtor = data[storeTypeRegistry[storeConfig.type]];
                delete storeConfig.type;
                return new storeCtor(storeConfig)
            }
            function createCustomStoreFromUrl(url) {
                return new CustomStore({load: function() {
                            return $.getJSON(url)
                        }})
            }
            if (typeof options === "string")
                options = createCustomStoreFromUrl(options);
            if (options === undefined)
                options = [];
            if ($.isArray(options) || options instanceof data.Store)
                options = {store: options};
            else
                options = $.extend({}, options);
            if (options.store === undefined)
                options.store = [];
            store = options.store;
            if ("load" in options)
                store = createCustomStoreFromLoadFunc();
            else if ($.isArray(store))
                store = new data.ArrayStore(store);
            else if ($.isPlainObject(store))
                store = createStoreFromConfig($.extend({}, store));
            options.store = store;
            return options
        }
        function normalizeStoreLoadOptionAccessorArguments(originalArguments) {
            switch (originalArguments.length) {
                case 0:
                    return undefined;
                case 1:
                    return originalArguments[0]
            }
            return $.makeArray(originalArguments)
        }
        function generateStoreLoadOptionAccessor(optionName) {
            return function() {
                    var args = normalizeStoreLoadOptionAccessorArguments(arguments);
                    if (args !== undefined)
                        this._storeLoadOptions[optionName] = args;
                    return this._storeLoadOptions[optionName]
                }
        }
        function mapDataRespectingGrouping(items, mapper, groupInfo) {
            function mapRecursive(items, level) {
                return level ? mapGroup(items, level) : $.map(items, mapper)
            }
            function mapGroup(group, level) {
                return $.map(group, function(item) {
                        return {
                                key: item.key,
                                items: mapRecursive(item.items, level - 1)
                            }
                    })
            }
            return mapRecursive(items, groupInfo ? data.utils.normalizeSortingInfo(groupInfo).length : 0)
        }
        var DataSource = Class.inherit({
                ctor: function(options) {
                    options = normalizeDataSourceOptions(options);
                    this._store = options.store;
                    this._storeLoadOptions = this._extractLoadOptions(options);
                    this._mapFunc = options.map;
                    this._postProcessFunc = options.postProcess;
                    this._pageIndex = options.pageIndex !== undefined ? options.pageIndex : 0;
                    this._pageSize = options.pageSize !== undefined ? options.pageSize : 20;
                    this._items = [];
                    this._totalCount = -1;
                    this._isLoaded = false;
                    this._loadingCount = 0;
                    this._preferSync = options._preferSync;
                    this._loadQueue = this._createLoadQueue();
                    this._searchValue = "searchValue" in options ? options.searchValue : null;
                    this._searchOperation = options.searchOperation || "contains";
                    this._searchExpr = options.searchExpr;
                    this._paginate = options.paginate;
                    if (this._paginate === undefined)
                        this._paginate = !this.group();
                    this._isLastPage = !this._paginate;
                    this._userData = {};
                    $.each(["changed", "loadError", "loadingChanged"], $.proxy(function(_, eventName) {
                        var callbacks = this[eventName] = $.Callbacks();
                        var originalAdd = callbacks.add;
                        callbacks.add = function() {
                            DX.log("W0003", "DataSource", eventName, "14.2", "Use the '" + eventName + "' event instead");
                            return originalAdd.apply(eventName, arguments)
                        }
                    }, this));
                    $.each(["changed", "loadError", "loadingChanged", "customizeLoadResult", "customizeStoreLoadOptions"], $.proxy(function(_, eventName) {
                        var optionName = "on" + eventName[0].toUpperCase() + eventName.slice(1);
                        if (options.hasOwnProperty(optionName))
                            this.on(eventName, options[optionName])
                    }, this))
                },
                dispose: function() {
                    this.changed.empty();
                    this.loadError.empty();
                    this.loadingChanged.empty();
                    this._disposeEvents();
                    delete this._store;
                    this._disposed = true
                },
                _extractLoadOptions: function(options) {
                    var result = {},
                        names = ["sort", "filter", "select", "group", "requireTotalCount"],
                        customNames = this._store._customLoadOptions();
                    if (customNames)
                        names = names.concat(customNames);
                    $.each(names, function() {
                        result[this] = options[this]
                    });
                    return result
                },
                loadOptions: function() {
                    return this._storeLoadOptions
                },
                items: function() {
                    return this._items
                },
                pageIndex: function(newIndex) {
                    if (newIndex !== undefined) {
                        this._pageIndex = newIndex;
                        this._isLastPage = !this._paginate
                    }
                    return this._pageIndex
                },
                paginate: function(value) {
                    if (arguments.length < 1)
                        return this._paginate;
                    value = !!value;
                    if (this._paginate !== value) {
                        this._paginate = value;
                        this.pageIndex(0)
                    }
                },
                pageSize: function(value) {
                    if (arguments.length < 1)
                        return this._pageSize;
                    this._pageSize = value
                },
                isLastPage: function() {
                    return this._isLastPage
                },
                sort: generateStoreLoadOptionAccessor("sort"),
                filter: function() {
                    var newFilter = normalizeStoreLoadOptionAccessorArguments(arguments);
                    if (newFilter !== undefined) {
                        this._storeLoadOptions.filter = newFilter;
                        this.pageIndex(0)
                    }
                    return this._storeLoadOptions.filter
                },
                group: generateStoreLoadOptionAccessor("group"),
                select: generateStoreLoadOptionAccessor("select"),
                searchValue: function(value) {
                    if (value !== undefined) {
                        this.pageIndex(0);
                        this._searchValue = value
                    }
                    return this._searchValue
                },
                searchOperation: function(op) {
                    if (op !== undefined) {
                        this.pageIndex(0);
                        this._searchOperation = op
                    }
                    return this._searchOperation
                },
                searchExpr: function(expr) {
                    var argc = arguments.length;
                    if (argc) {
                        if (argc > 1)
                            expr = $.makeArray(arguments);
                        this.pageIndex(0);
                        this._searchExpr = expr
                    }
                    return this._searchExpr
                },
                store: function() {
                    return this._store
                },
                key: function() {
                    return this._store && this._store.key()
                },
                totalCount: function() {
                    return this._totalCount
                },
                isLoaded: function() {
                    return this._isLoaded
                },
                isLoading: function() {
                    return this._loadingCount > 0
                },
                _createLoadQueue: function() {
                    return DX.createQueue()
                },
                _changeLoadingCount: function(increment) {
                    var oldLoading = this.isLoading(),
                        newLoading;
                    this._loadingCount += increment;
                    newLoading = this.isLoading();
                    if (oldLoading ^ newLoading) {
                        this.fireEvent("loadingChanged", [newLoading]);
                        this.loadingChanged.fire(newLoading)
                    }
                },
                _scheduleLoadCallbacks: function(deferred) {
                    var thisSource = this;
                    thisSource._changeLoadingCount(1);
                    deferred.always(function() {
                        thisSource._changeLoadingCount(-1)
                    })
                },
                _scheduleChangedCallbacks: function(deferred) {
                    var that = this;
                    deferred.done(function() {
                        that.fireEvent("changed");
                        that.changed.fire()
                    })
                },
                loadSingle: function(propName, propValue) {
                    var that = this;
                    var d = $.Deferred().fail(function() {
                            that.fireEvent("loadError", arguments);
                            that.loadError.fire.apply(that, arguments)
                        }),
                        key = this.key(),
                        store = this._store,
                        loadOptions = this._createStoreLoadOptions();
                    function handleSuccess(data) {
                        if (data === null || typeof data === "undefined" || $.isArray(data) && data.length < 1)
                            d.reject();
                        else
                            d.resolve(that._transformLoadedData(data)[0])
                    }
                    if (arguments.length < 2) {
                        propValue = propName;
                        propName = key
                    }
                    delete loadOptions.skip;
                    delete loadOptions.group;
                    delete loadOptions.refresh;
                    delete loadOptions.pageIndex;
                    delete loadOptions.searchString;
                    if (propName === key || store instanceof data.CustomStore)
                        store.byKey(propValue, loadOptions).done(handleSuccess).fail(d.reject);
                    else {
                        loadOptions.take = 1;
                        loadOptions._preferSync = true;
                        loadOptions.filter = loadOptions.filter ? [loadOptions.filter, [propName, propValue]] : [propName, propValue];
                        store.load(loadOptions).done(handleSuccess).fail(d.reject)
                    }
                    return d.promise()
                },
                load: function() {
                    var thisSource = this,
                        d = $.Deferred().fail(errorCallback),
                        loadOptions;
                    this._scheduleLoadCallbacks(d);
                    this._scheduleChangedCallbacks(d);
                    loadOptions = this._createLoadOptions();
                    this.fireEvent("customizeStoreLoadOptions", [loadOptions]);
                    if (!ensureIsNotRejected(loadOptions.operationId, d))
                        return d.promise();
                    function errorCallback() {
                        if (arguments[0] !== "canceled") {
                            thisSource.fireEvent("loadError", arguments);
                            thisSource.loadError.fire.apply(thisSource.loadError, arguments)
                        }
                    }
                    function loadTask() {
                        if (thisSource._disposed)
                            return undefined;
                        return thisSource._loadFromStore(loadOptions, d)
                    }
                    this._loadQueue.add(function() {
                        if (typeof loadOptions.delay === "number")
                            setTimeout(loadTask, loadOptions.delay);
                        else
                            loadTask();
                        return d.promise()
                    }, function() {
                        thisSource._changeLoadingCount(-1)
                    });
                    return d.promise({loadOperationId: loadOptions.operationId})
                },
                reload: function() {
                    var prop,
                        userData = this._userData;
                    for (prop in userData)
                        if (userData.hasOwnProperty(prop))
                            delete userData[prop];
                    this._totalCount = -1;
                    this._isLoaded = false;
                    return this.load()
                },
                cancel: function(loadOperationId) {
                    canceledOperationsRegistry.add(loadOperationId)
                },
                _addSearchOptions: function(storeLoadOptions) {
                    if (this._disposed)
                        return;
                    if (this.store()._useDefaultSearch)
                        this._addSearchFilter(storeLoadOptions);
                    else {
                        storeLoadOptions.searchValue = this._searchValue;
                        storeLoadOptions.searchExpr = this._searchExpr
                    }
                },
                _createStoreLoadOptions: function() {
                    var result = $.extend({}, this._storeLoadOptions);
                    this._addSearchOptions(result);
                    if (this._paginate)
                        if (this._pageSize) {
                            result.skip = this._pageIndex * this._pageSize;
                            result.take = this._pageSize
                        }
                    result.userData = this._userData;
                    return result
                },
                _createLoadOptions: function() {
                    return {
                            operationId: nextLoadOperationId(),
                            storeLoadOptions: this._createStoreLoadOptions()
                        }
                },
                _addSearchFilter: function(storeLoadOptions) {
                    var value = this._searchValue,
                        op = this._searchOperation,
                        selector = this._searchExpr,
                        searchFilter = [];
                    if (!value)
                        return;
                    if (!selector)
                        selector = "this";
                    if (!$.isArray(selector))
                        selector = [selector];
                    $.each(selector, function(i, item) {
                        if (searchFilter.length)
                            searchFilter.push("or");
                        searchFilter.push([item, op, value])
                    });
                    if (storeLoadOptions.filter)
                        storeLoadOptions.filter = [searchFilter, storeLoadOptions.filter];
                    else
                        storeLoadOptions.filter = searchFilter
                },
                _loadFromStore: function(loadOptions, pendingDeferred) {
                    var thisSource = this;
                    function handleSuccess(data, extra) {
                        function processResult() {
                            var loadResult;
                            loadResult = $.extend({
                                data: data,
                                extra: extra
                            }, loadOptions);
                            thisSource.fireEvent("customizeLoadResult", [loadResult]);
                            if (ensureIsNotRejected(loadOptions.operationId, pendingDeferred))
                                thisSource._processStoreLoadResult(loadResult, pendingDeferred)
                        }
                        if (thisSource._preferSync)
                            processResult();
                        else
                            DX.utils.executeAsync(processResult)
                    }
                    if (!ensureIsNotRejected(loadOptions.operationId, pendingDeferred))
                        return pendingDeferred.promise();
                    return this.store().load(loadOptions.storeLoadOptions).done(handleSuccess).fail(pendingDeferred.reject)
                },
                _processStoreLoadResult: function(loadResult, pendingDeferred) {
                    var thisSource = this;
                    var data = loadResult.data,
                        extra = loadResult.extra,
                        storeLoadOptions = loadResult.storeLoadOptions;
                    function resolvePendingDeferred() {
                        if (!ensureIsNotRejected(loadResult.operationId, pendingDeferred))
                            return pendingDeferred;
                        thisSource._isLoaded = true;
                        thisSource._totalCount = isFinite(extra.totalCount) ? extra.totalCount : -1;
                        return pendingDeferred.resolve(data, extra)
                    }
                    function proceedLoadingTotalCount() {
                        thisSource.store().totalCount(storeLoadOptions).done(function(count) {
                            extra.totalCount = count;
                            resolvePendingDeferred()
                        }).fail(function(){})
                    }
                    if (thisSource._disposed)
                        return;
                    data = thisSource._transformLoadedData(data);
                    if (!$.isPlainObject(extra))
                        extra = {};
                    thisSource._items = data;
                    if (!data.length || !thisSource._paginate || thisSource._pageSize && data.length < thisSource._pageSize)
                        thisSource._isLastPage = true;
                    if (storeLoadOptions.requireTotalCount && !isFinite(extra.totalCount))
                        proceedLoadingTotalCount();
                    else
                        resolvePendingDeferred()
                },
                _transformLoadedData: function(data) {
                    var result = $.makeArray(data);
                    if (this._mapFunc)
                        result = mapDataRespectingGrouping(result, this._mapFunc, this.group());
                    if (this._postProcessFunc)
                        result = this._postProcessFunc(result);
                    return result
                }
            }).include(DX.EventsMixin);
        $.extend(true, data, {
            DataSource: DataSource,
            utils: {
                storeTypeRegistry: storeTypeRegistry,
                normalizeDataSourceOptions: normalizeDataSourceOptions
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ko.js */
    (function($, DX, undefined) {
        if (!DX.support.hasKo)
            return;
        var ko = window.ko;
        (function checkKnockoutVersion(version) {
            version = version.split(".");
            if (version[0] < 2 || version[0] == 2 && version[1] < 3)
                throw DX.Error("E0013");
        })(ko.version)
    })(jQuery, DevExpress);
    /*! Module core, file ng.js */
    (function($, DX, undefined) {
        if (!DX.support.hasNg)
            return;
        DX.ng = {module: window.angular.module("dx", ["ngSanitize"])}
    })(jQuery, DevExpress);
    /*! Module core, file component.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            dataUtils = DX.data.utils,
            inflector = DX.inflector;
        var Component = DX.Class.inherit({
                NAME: "Component",
                _setDeprecatedOptions: function() {
                    this._deprecatedOptions = {}
                },
                _getDeprecatedOptions: function() {
                    return this._deprecatedOptions
                },
                _setOptionAliases: function() {
                    var aliases = this._optionAliases = {};
                    $.each(this._getDeprecatedOptions(), function(optionName, info) {
                        var optionAlias = info.alias;
                        if (optionAlias)
                            aliases[optionName] = optionAlias
                    })
                },
                _getOptionAliases: function() {
                    return this._optionAliases
                },
                _getOptionAliasesByName: function(optionName) {
                    return $.map(this._getOptionAliases(), function(aliasedOption, aliasName) {
                            return optionName === aliasedOption ? aliasName : undefined
                        })
                },
                _setDefaultOptions: function() {
                    this.option({
                        onOptionChanged: null,
                        onDisposing: null,
                        defaultOptionsRules: null
                    })
                },
                _defaultOptionsRules: function() {
                    return []
                },
                _setOptionsByDevice: function(userRules) {
                    var rules = this._defaultOptionsRules(),
                        currentDevice = DX.devices.current(),
                        result = {};
                    if (this._customRules)
                        rules = rules.concat(this._customRules);
                    if ($.isArray(userRules))
                        rules = rules.concat(userRules);
                    var deviceMatch = function(device, filter) {
                            filter = $.makeArray(filter);
                            return filter.length === 1 && $.isEmptyObject(filter[0]) || utils.findBestMatches(device, filter).length > 0
                        };
                    $.each(rules, function(index, rule) {
                        var deviceFilter = rule.device || {},
                            match;
                        if ($.isFunction(deviceFilter))
                            match = deviceFilter(currentDevice);
                        else
                            match = deviceMatch(currentDevice, deviceFilter);
                        if (match)
                            $.extend(result, rule.options)
                    });
                    this.option(result)
                },
                _setOptionsByReference: function() {
                    this._optionsByReference = {}
                },
                _getOptionsByReference: function() {
                    return this._optionsByReference
                },
                ctor: function(options) {
                    if (!this.NAME)
                        throw DX.Error("E0004");
                    options = options || {};
                    this._options = {};
                    this._updateLockCount = 0;
                    this.optionChanged = $.Callbacks();
                    this.disposing = $.Callbacks();
                    $.each(["optionChanged", "disposing"], $.proxy(function(_, propertyName) {
                        var that = this,
                            originalAdd = this[propertyName].add;
                        this[propertyName].add = function() {
                            DX.log("W0003", that.NAME, propertyName, "14.2", "Use the '" + propertyName + "' event instead");
                            return originalAdd.apply(this, arguments)
                        }
                    }, this));
                    this.beginUpdate();
                    try {
                        this._suppressDeprecatedWarnings();
                        this._setOptionsByReference();
                        this._setDeprecatedOptions();
                        this._setOptionAliases();
                        this._setDefaultOptions();
                        this._setOptionsByDevice(options.defaultOptionsRules);
                        this._resumeDeprecatedWarnings();
                        this._initialOptions = $.extend({}, this.option());
                        this._initOptions(options)
                    }
                    finally {
                        this.endUpdate()
                    }
                },
                _initOptions: function(options) {
                    this.option(options)
                },
                _optionValuesEqual: function(name, oldValue, newValue) {
                    oldValue = dataUtils.toComparable(oldValue, true);
                    newValue = dataUtils.toComparable(newValue, true);
                    if (oldValue && newValue && oldValue.jquery && newValue.jquery)
                        return newValue.is(oldValue);
                    if (oldValue === null || typeof oldValue !== "object")
                        return oldValue === newValue;
                    return false
                },
                _init: function() {
                    this._createOptionChangedAction();
                    this._createDisposingAction()
                },
                _createOptionChangedAction: function() {
                    this._optionChangedAction = this._createActionByOption("onOptionChanged")
                },
                _createDisposingAction: function() {
                    this._disposingAction = this._createActionByOption("onDisposing")
                },
                _optionChanged: function(args) {
                    switch (args.name) {
                        case"onOptionChanged":
                            this._createOptionChangedAction();
                            break;
                        case"onDisposing":
                            this._createDisposingAction();
                            break;
                        case"defaultOptionsRules":
                            break
                    }
                },
                _dispose: function() {
                    this.optionChanged.empty();
                    this.disposing.fireWith(this).empty();
                    this._disposingAction();
                    this._disposeEvents()
                },
                instance: function() {
                    return this
                },
                beginUpdate: function() {
                    this._updateLockCount++
                },
                endUpdate: function() {
                    this._updateLockCount--;
                    if (!this._updateLockCount)
                        if (!this._initializing && !this._initialized) {
                            this._initializing = true;
                            try {
                                this._init()
                            }
                            finally {
                                this._initializing = false;
                                this._initialized = true
                            }
                        }
                },
                _logWarningIfDeprecated: function(option) {
                    var info = this._getDeprecatedOptions()[option];
                    if (info && !this._deprecatedOptionsSuppressed)
                        this._logDeprecatedWarning(option, info)
                },
                _logDeprecatedWarningCount: 0,
                _logDeprecatedWarning: function(option, info) {
                    var message = info.message || "Use the '" + info.alias + "' option instead";
                    DX.log("W0001", this.NAME, option, info.since, message);
                    ++this._logDeprecatedWarningCount
                },
                _suppressDeprecatedWarnings: function() {
                    this._deprecatedOptionsSuppressed = true
                },
                _resumeDeprecatedWarnings: function() {
                    this._deprecatedOptionsSuppressed = false
                },
                _notifyOptionChanged: function(option, value, previousValue) {
                    var that = this;
                    if (this._initialized)
                        $.each(that._getOptionAliasesByName(option).concat([option]), function(index, name) {
                            var args = {
                                    name: name.split(/[.\[]/)[0],
                                    fullName: name,
                                    value: value,
                                    previousValue: previousValue
                                };
                            that.optionChanged.fireWith(that, [args.name, value, previousValue]);
                            that._optionChangedAction($.extend({}, args));
                            that._optionChanged(args)
                        })
                },
                initialOption: function(optionName) {
                    var options = this._initialOptions;
                    return options[optionName]
                },
                _defaultActionConfig: function() {
                    return {
                            context: this,
                            component: this
                        }
                },
                _defaultActionArgs: function() {
                    return {component: this}
                },
                _createAction: function(actionSource, config) {
                    var that = this,
                        action = new DX.Action(actionSource, $.extend(config, that._defaultActionConfig()));
                    return function(e) {
                            if (!arguments.length)
                                e = {};
                            if (e instanceof $.Event)
                                throw Error("Action must be executed with jQuery.Event like action({ jQueryEvent: event })");
                            if (!$.isPlainObject(e))
                                e = {actionValue: e};
                            return action.execute.call(action, $.extend(e, that._defaultActionArgs()))
                        }
                },
                _createActionByOption: function(optionName, config) {
                    config = config || {};
                    if (typeof optionName !== "string")
                        throw DX.Error("E0008");
                    var matches = /^on(\w+)/.exec(optionName);
                    if (matches) {
                        var eventName = inflector.camelize(matches[1]),
                            afterExecute = config.afterExecute || $.noop,
                            that = this;
                        config.afterExecute = function(args) {
                            that.fireEvent(eventName, args.args);
                            return afterExecute.apply(this, arguments)
                        }
                    }
                    else {
                        var optionAlias = this._getOptionAliasesByName(optionName),
                            isOptionDeprecated = Boolean(this._getDeprecatedOptions()[optionName]);
                        if (isOptionDeprecated) {
                            if (optionAlias.length)
                                throw Error("The '" + optionName + "' is deprecated and has alias '" + optionAlias + "'");
                        }
                        else
                            throw Error("The '" + optionName + "' option name should start with 'on' prefix");
                    }
                    this._suppressDeprecatedWarnings();
                    var action = this._createAction(this.option(optionName), config);
                    this._resumeDeprecatedWarnings();
                    return action
                },
                option: function(options) {
                    var that = this,
                        name = options,
                        value = arguments[1],
                        optionAliases = this._getOptionAliases();
                    var normalizeOptionName = function(name) {
                            if (name) {
                                that._logWarningIfDeprecated(name);
                                if (optionAliases[name])
                                    name = optionAliases[name]
                            }
                            return name
                        };
                    var getOptionValue = function(name, unwrapObservables) {
                            return dataUtils.compileGetter(name)(that._options, {
                                    functionsAsIs: true,
                                    unwrapObservables: unwrapObservables
                                })
                        };
                    if (arguments.length < 2 && $.type(name) !== "object") {
                        name = normalizeOptionName(name);
                        return getOptionValue(name)
                    }
                    if (typeof name === "string") {
                        options = {};
                        options[name] = value
                    }
                    that.beginUpdate();
                    try {
                        $.each(options, function(name, value) {
                            name = normalizeOptionName(name);
                            var prevValue = getOptionValue(name, false);
                            if (that._optionValuesEqual(name, prevValue, value))
                                return;
                            dataUtils.compileSetter(name)(that._options, value, {
                                functionsAsIs: true,
                                merge: !that._getOptionsByReference()[name],
                                unwrapObservables: false
                            });
                            that._notifyOptionChanged(name, value, prevValue)
                        })
                    }
                    finally {
                        that.endUpdate()
                    }
                }
            }).include(DX.EventsMixin);
        $.extend(DX, {Component: Component})
    })(jQuery, DevExpress);
    /*! Module core, file DOMComponent.js */
    (function($, DX, undefined) {
        var windowResizeCallbacks = DX.utils.windowResizeCallbacks;
        var RTL_DIRECTION_CLASS = "dx-rtl",
            COMPONENT_NAMES_DATA_KEY = "dxComponents",
            VISIBILITY_CHANGE_CLASS = "dx-visibility-change-handler",
            VISIBILITY_CHANGE_EVENTNAMESPACE = "dxVisibilityChange";
        var DOMComponent = DX.Component.inherit({
                NAME: "DOMComponent",
                _setDefaultOptions: function() {
                    this.callBase();
                    this.option({rtlEnabled: DX.rtlEnabled})
                },
                ctor: function(element, options) {
                    this._$element = $(element);
                    this.element().data(this.NAME, this);
                    this._attachInstanceToElement(this._$element);
                    this.callBase(options)
                },
                _attachInstanceToElement: $.noop,
                _visibilityChanged: DX.abstract,
                _dimensionChanged: DX.abstract,
                _init: function() {
                    this.callBase();
                    this._attachWindowResizeCallback()
                },
                _attachWindowResizeCallback: function() {
                    if (this._isDimensionChangeSupported()) {
                        var windowResizeCallBack = this._windowResizeCallBack = $.proxy(this._dimensionChanged, this);
                        windowResizeCallbacks.add(windowResizeCallBack)
                    }
                },
                _isDimensionChangeSupported: function() {
                    return this._dimensionChanged !== DX.abstract
                },
                _render: function() {
                    this._toggleRTLDirection(this.option("rtlEnabled"));
                    this._renderVisibilityChange()
                },
                _renderVisibilityChange: function() {
                    if (!this._isVisibilityChangeSupported())
                        return;
                    this.element().addClass(VISIBILITY_CHANGE_CLASS);
                    this._attachVisiblityChangeHandlers()
                },
                _attachVisiblityChangeHandlers: function() {
                    var that = this;
                    that.element().off("." + VISIBILITY_CHANGE_EVENTNAMESPACE).on("dxhiding." + VISIBILITY_CHANGE_EVENTNAMESPACE, function() {
                        that._visibilityChanged(false)
                    }).on("dxshown." + VISIBILITY_CHANGE_EVENTNAMESPACE, function() {
                        that._visibilityChanged(true)
                    })
                },
                _isVisibilityChangeSupported: function() {
                    return this._visibilityChanged !== DX.abstract
                },
                _clean: $.noop,
                _modelByElement: $.noop,
                _invalidate: function() {
                    if (!this._updateLockCount)
                        throw DX.Error("E0007");
                    this._requireRefresh = true
                },
                _refresh: function() {
                    this._clean();
                    this._render()
                },
                _dispose: function() {
                    this.callBase();
                    this._clean();
                    this._detachWindowResizeCallback()
                },
                _detachWindowResizeCallback: function() {
                    if (this._isDimensionChangeSupported())
                        windowResizeCallbacks.remove(this._windowResizeCallBack)
                },
                _toggleRTLDirection: function(rtl) {
                    this.element().toggleClass(RTL_DIRECTION_CLASS, rtl)
                },
                _defaultActionConfig: function() {
                    return $.extend(this.callBase(), {context: this._modelByElement(this.element())})
                },
                _defaultActionArgs: function() {
                    var element = this.element(),
                        model = this._modelByElement(this.element());
                    return $.extend(this.callBase(), {
                            element: element,
                            model: model
                        })
                },
                _optionChanged: function(args) {
                    if (args.name === "rtlEnabled")
                        this._invalidate();
                    else
                        this.callBase(args)
                },
                endUpdate: function() {
                    var requireRender = !this._initializing && !this._initialized;
                    this.callBase.apply(this, arguments);
                    if (!this._updateLockCount)
                        if (requireRender)
                            this._render();
                        else if (this._requireRefresh) {
                            this._requireRefresh = false;
                            this._refresh()
                        }
                },
                element: function() {
                    return this._$element
                }
            });
        var registerComponent = function(name, namespace, componentClass) {
                if (!componentClass) {
                    componentClass = namespace;
                    namespace = DX
                }
                componentClass.redefine({_attachInstanceToElement: function($element) {
                        $element.data(name, this);
                        if (!$element.data(COMPONENT_NAMES_DATA_KEY))
                            $element.data(COMPONENT_NAMES_DATA_KEY, []);
                        $element.data(COMPONENT_NAMES_DATA_KEY).push(name)
                    }});
                namespace[name] = componentClass;
                componentClass.prototype.NAME = name;
                componentClass.defaultOptions = function(rule) {
                    componentClass.prototype._customRules = componentClass.prototype._customRules || [];
                    componentClass.prototype._customRules.push(rule)
                };
                $.fn[name] = function(options) {
                    var isMemberInvoke = typeof options === "string",
                        result;
                    if (isMemberInvoke) {
                        var memberName = options,
                            memberArgs = $.makeArray(arguments).slice(1);
                        this.each(function() {
                            var instance = $(this).data(name);
                            if (!instance)
                                throw DX.Error("E0009", name);
                            var member = instance[memberName],
                                memberValue = member.apply(instance, memberArgs);
                            if (result === undefined)
                                result = memberValue
                        })
                    }
                    else {
                        this.each(function() {
                            var instance = $(this).data(name);
                            if (instance)
                                instance.option(options);
                            else
                                new componentClass(this, options)
                        });
                        result = this
                    }
                    return result
                }
            };
        var getComponents = function(element) {
                element = $(element);
                var names = element.data(COMPONENT_NAMES_DATA_KEY);
                if (!names)
                    return [];
                return $.map(names, function(name) {
                        return element.data(name)
                    })
            };
        var disposeComponents = function() {
                $.each(getComponents(this), function() {
                    this._dispose()
                })
            };
        var originalCleanData = $.cleanData;
        $.cleanData = function(element) {
            $.each(element, disposeComponents);
            return originalCleanData.apply(this, arguments)
        };
        registerComponent("DOMComponent", DOMComponent);
        DX.registerComponent = registerComponent
    })(jQuery, DevExpress);
    /*! Module core, file ui.js */
    (function($, DX, undefined) {
        var ui = DX.ui = {};
        DX.registerActionExecutor({
            designMode: {validate: function(e) {
                    if (DX.designMode)
                        e.cancel = true
                }},
            disabled: {validate: function(e) {
                    if (!e.args.length)
                        return;
                    var args = e.args[0],
                        jQueryEvent = args.jQueryEvent;
                    var args = e.args[0],
                        element = args[e.validatingTargetName] || args.element;
                    if (element && element.is(".dx-state-disabled, .dx-state-disabled *"))
                        e.cancel = true
                }},
            readOnly: {validate: function(e) {
                    if (!e.args.length)
                        return;
                    var args = e.args[0],
                        jQueryEvent = args.jQueryEvent;
                    var args = e.args[0],
                        element = args[e.validatingTargetName] || args.element;
                    if (element && element.is(".dx-state-readonly, .dx-state-readonly *"))
                        e.cancel = true
                }}
        });
        $.extend(ui, {initViewport: function() {
                DX.log("W1002", "DevExpress.ui.initViewport", "14.1", "Use DX.utils.initMobileViewport instead");
                DX.utils.initMobileViewport()
            }})
    })(jQuery, DevExpress);
    /*! Module core, file ui.templates.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            triggerShownEvent = DX.utils.triggerShownEvent;
        var TemplateProviderBase = DX.Class.inherit({
                ctor: function() {
                    this.widgetTemplatesCache = {}
                },
                createTemplate: DX.abstract,
                getTemplates: function(widget) {
                    var cache = this.widgetTemplatesCache,
                        key = widget.NAME;
                    if (!cache[key])
                        cache[key] = this._getWidgetTemplates(widget.constructor);
                    return cache[key]
                },
                _getWidgetTemplates: function(widget) {
                    if (!widget.prototype.NAME)
                        return {};
                    if (widget.prototype.NAME === widget.parent.prototype.NAME)
                        return this._getWidgetTemplates(widget.parent);
                    return $.extend(this._getWidgetTemplates(widget.parent), this._templatesForWidget(widget.prototype.NAME))
                },
                _templatesForWidget: DX.abstract
            });
        var TemplateBase = DX.Class.inherit({
                ctor: function(element, owner) {
                    this._element = $(element);
                    if (!this._element.is("script"))
                        this._element.detach();
                    this._owner = owner
                },
                owner: function() {
                    return this._owner
                },
                render: function(data, container, index) {
                    if (data instanceof jQuery) {
                        container = data;
                        data = undefined
                    }
                    if (container)
                        data = this._prepareDataForContainer(data, container);
                    var result = this._renderCore(data, index, container);
                    if (this._shouldAppend && container) {
                        container.append(result);
                        if (typeof result !== "string" && container.is(":visible"))
                            triggerShownEvent(result)
                    }
                    return result
                },
                _prepareDataForContainer: function(data, container) {
                    return data
                },
                _renderCore: DX.abstract,
                _shouldAppend: true,
                dispose: function() {
                    this._owner = null
                }
            });
        $.extend(ui, {
            TemplateProviderBase: TemplateProviderBase,
            TemplateBase: TemplateBase
        })
    })(jQuery, DevExpress);
    /*! Module core, file jquery.templates.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            isString = DX.utils.isString,
            currentTemplateEngine,
            templateEngines = {};
        var Template = ui.TemplateBase.inherit({
                ctor: function(element, owner) {
                    this.callBase(element, owner);
                    this._compiledTemplate = currentTemplateEngine.compile(element)
                },
                _renderCore: function(data) {
                    return currentTemplateEngine.render(this._compiledTemplate, data)
                }
            });
        var setTemplateEngine = function(templateEngine) {
                if (isString(templateEngine)) {
                    currentTemplateEngine = templateEngines[templateEngine];
                    if (!currentTemplateEngine)
                        throw DX.Error("E0020", templateEngine);
                }
                else
                    currentTemplateEngine = templateEngine
            };
        var registerTemplateEngine = function(name, templateEngine) {
                templateEngines[name] = templateEngine
            };
        var outerHtml = function(element) {
                element = $(element);
                if (!element.length || element[0].nodeName.toLowerCase() !== "script")
                    element = $("<div>").append(element);
                return element.html()
            };
        registerTemplateEngine("default", {
            compile: function(element) {
                return DX.utils.normalizeTemplateElement(element)
            },
            render: function(template, data) {
                return template.clone()
            }
        });
        registerTemplateEngine("jquery-tmpl", {
            compile: function(element) {
                return $("<div>").append(DX.utils.normalizeTemplateElement(element))
            },
            render: function(template, data) {
                return template.tmpl(data)
            }
        });
        registerTemplateEngine("jsrender", {
            compile: function(element) {
                return $.templates(outerHtml(element))
            },
            render: function(template, data) {
                return template.render(data)
            }
        });
        registerTemplateEngine("mustache", {
            compile: function(element) {
                return Mustache.compile(outerHtml(element))
            },
            render: function(template, data) {
                return template(data)
            }
        });
        registerTemplateEngine("hogan", {
            compile: function(element) {
                return Hogan.compile(outerHtml(element))
            },
            render: function(template, data) {
                return template.render(data)
            }
        });
        registerTemplateEngine("underscore", {
            compile: function(element) {
                return _.template(outerHtml(element))
            },
            render: function(template, data) {
                return template(data)
            }
        });
        registerTemplateEngine("handlebars", {
            compile: function(element) {
                return Handlebars.compile(outerHtml(element))
            },
            render: function(template, data) {
                return template(data)
            }
        });
        registerTemplateEngine("doT", {
            compile: function(element) {
                return doT.template(outerHtml(element))
            },
            render: function(template, data) {
                return template(data)
            }
        });
        setTemplateEngine("default");
        var TemplateProvider = ui.TemplateProviderBase.inherit({
                createTemplate: function(element, owner) {
                    return new Template(element, owner)
                },
                _templatesForWidget: function(name) {
                    return defaultTemplates(name)
                }
            });
        var DefaultTemplate = ui.TemplateBase.inherit({
                ctor: function(render, owner) {
                    this.callBase($("<div>"), owner);
                    this._render = render
                },
                _renderCore: function(data, index, container) {
                    return DX.utils.stringToJquery(this._render(data, index, container))
                }
            });
        var defaultTemplates = function() {
                var cache = {};
                return function(widgetName) {
                        if (!cache[widgetName]) {
                            var templateGenerators = TEMPLATE_GENERATORS[widgetName] || {},
                                templates = {};
                            $.each(templateGenerators, function(name, generator) {
                                templates[name] = new ui.DefaultTemplate(generator)
                            });
                            cache[widgetName] = templates
                        }
                        return cache[widgetName]
                    }
            }();
        var TEMPLATE_GENERATORS = {};
        var ITEM_CONTENT_PLACEHOLDER_CLASS = "dx-item-content-placeholder";
        TEMPLATE_GENERATORS.CollectionWidget = {
            item: function(itemData) {
                var $itemContent = $("<div>");
                if ($.isPlainObject(itemData)) {
                    if (itemData.text)
                        $itemContent.text(itemData.text);
                    if (itemData.html)
                        $itemContent.html(itemData.html)
                }
                else
                    $itemContent.html(String(itemData));
                return $itemContent
            },
            itemFrame: function(itemData) {
                var $itemFrame = $("<div>");
                $itemFrame.toggleClass("dx-state-invisible", itemData.visible !== undefined && !itemData.visible);
                $itemFrame.toggleClass("dx-state-disabled", !!itemData.disabled);
                var $placeholder = $("<div>").addClass(ITEM_CONTENT_PLACEHOLDER_CLASS);
                $itemFrame.append($placeholder);
                return $itemFrame
            }
        };
        var LIST_ITEM_BADGE_CONTAINER_CLASS = "dx-list-item-badge-container",
            LIST_ITEM_BADGE_CLASS = "dx-list-item-badge",
            BADGE_CLASS = "dx-badge",
            LIST_ITEM_CHEVRON_CONTAINER_CLASS = "dx-list-item-chevron-container",
            LIST_ITEM_CHEVRON_CLASS = "dx-list-item-chevron";
        TEMPLATE_GENERATORS.dxList = {
            item: function(itemData) {
                var $itemContent = TEMPLATE_GENERATORS.CollectionWidget.item(itemData);
                if (itemData.key) {
                    var $key = $("<div>").text(itemData.key);
                    $key.appendTo($itemContent)
                }
                return $itemContent
            },
            itemFrame: function(itemData) {
                var $itemFrame = TEMPLATE_GENERATORS.CollectionWidget.itemFrame(itemData);
                if (itemData.badge) {
                    var $badgeContainer = $("<div>").addClass(LIST_ITEM_BADGE_CONTAINER_CLASS),
                        $badge = $("<div>").addClass(LIST_ITEM_BADGE_CLASS).addClass(BADGE_CLASS);
                    $badge.text(itemData.badge);
                    $badgeContainer.append($badge).appendTo($itemFrame)
                }
                if (itemData.showChevron) {
                    var $chevronContainer = $("<div>").addClass(LIST_ITEM_CHEVRON_CONTAINER_CLASS),
                        $chevron = $("<div>").addClass(LIST_ITEM_CHEVRON_CLASS);
                    $chevronContainer.append($chevron).appendTo($itemFrame)
                }
                return $itemFrame
            },
            group: function(groupData) {
                var $groupContent = $("<div>");
                if ($.isPlainObject(groupData)) {
                    if (groupData.key)
                        $groupContent.text(groupData.key)
                }
                else
                    $groupContent.html(String(groupData));
                return $groupContent
            }
        };
        TEMPLATE_GENERATORS.dxDropDownMenu = {item: TEMPLATE_GENERATORS.dxList.item};
        TEMPLATE_GENERATORS.dxDropDownList = {item: TEMPLATE_GENERATORS.dxList.item};
        TEMPLATE_GENERATORS.dxRadioGroup = {item: TEMPLATE_GENERATORS.CollectionWidget.item};
        TEMPLATE_GENERATORS.dxSlideOut = {
            menuItem: TEMPLATE_GENERATORS.dxList.item,
            menuGroup: TEMPLATE_GENERATORS.dxList.group
        };
        var titleTemplate = function(titleData) {
                var $titleContent = $("<div>");
                if ($.isPlainObject(titleData)) {
                    if (titleData.title)
                        $titleContent.text(titleData.title)
                }
                else
                    $titleContent.html(String(titleData));
                return $titleContent
            };
        TEMPLATE_GENERATORS.dxAccordion = {
            title: titleTemplate,
            item: TEMPLATE_GENERATORS.CollectionWidget.item
        };
        TEMPLATE_GENERATORS.dxActionSheet = {item: function(itemData) {
                return $("<div>").dxButton($.extend({onClick: itemData.click}, itemData))
            }};
        TEMPLATE_GENERATORS.dxGallery = {item: function(itemData) {
                var $itemContent = $("<div>");
                if (itemData.imageSrc)
                    $('<img>').attr('src', itemData.imageSrc).appendTo($itemContent);
                else
                    $('<img>').attr('src', String(itemData)).appendTo($itemContent);
                return $itemContent
            }};
        var DX_ICON_CLASS = "dx-icon",
            DX_MENU_ITEM_CAPTION_CLASS = 'dx-menu-item-text',
            DX_MENU_ITEM_POPOUT_CLASS = 'dx-menu-item-popout',
            DX_MENU_ITEM_POPOUT_CONTAINER_CLASS = 'dx-menu-item-popout-container';
        TEMPLATE_GENERATORS.dxMenuBase = {item: function(itemData) {
                var $itemContent = $("<div>");
                var $itemImage;
                if (itemData.icon)
                    $itemImage = $('<span>').addClass(DX_ICON_CLASS + "-" + itemData.icon).appendTo($itemContent);
                else if (itemData.iconSrc)
                    $itemImage = $('<img>').attr('src', itemData.iconSrc).appendTo($itemContent);
                if ($itemImage)
                    $itemImage.addClass(DX_ICON_CLASS);
                var $itemCaption;
                $itemCaption = $('<span>').addClass(DX_MENU_ITEM_CAPTION_CLASS);
                if ($.isPlainObject(itemData)) {
                    if (itemData.text)
                        $itemCaption.text(itemData.text)
                }
                else
                    $itemCaption.html(String(itemData));
                $itemContent.append($itemCaption);
                var $popOutImage,
                    $popOutContainer;
                if (itemData.items && itemData.items.length > 0) {
                    $popOutContainer = $('<span>').addClass(DX_MENU_ITEM_POPOUT_CONTAINER_CLASS).appendTo($itemContent);
                    $popOutImage = $('<div>').addClass(DX_MENU_ITEM_POPOUT_CLASS).appendTo($popOutContainer)
                }
                return $itemContent
            }};
        var PANORAMA_ITEM_TITLE_CLASS = "dx-panorama-item-title";
        TEMPLATE_GENERATORS.dxPanorama = {itemFrame: function(itemData) {
                var $itemContent = TEMPLATE_GENERATORS.CollectionWidget.itemFrame(itemData);
                if (itemData.title) {
                    var $itemHeader = $("<div>").addClass(PANORAMA_ITEM_TITLE_CLASS).text(itemData.title);
                    $itemContent.prepend($itemHeader)
                }
                return $itemContent
            }};
        TEMPLATE_GENERATORS.dxPivotTabs = {item: function(itemData) {
                var $itemContent = $("<div>");
                var $itemText = $("<span>").text(itemData.title);
                $itemContent.html($itemText);
                return $itemContent
            }};
        var TABS_ITEM_TEXT_CLASS = "dx-tab-text";
        TEMPLATE_GENERATORS.dxTabs = {item: function(itemData) {
                var $itemContent = TEMPLATE_GENERATORS.CollectionWidget.item(itemData);
                if (itemData.html)
                    return $itemContent;
                var text = itemData.text,
                    icon = itemData.icon,
                    iconSrc = itemData.iconSrc,
                    iconElement;
                if (text)
                    $itemContent.wrapInner($("<span>").addClass(TABS_ITEM_TEXT_CLASS));
                if (icon)
                    iconElement = $("<span>").addClass(DX_ICON_CLASS + "-" + icon);
                else if (iconSrc)
                    iconElement = $("<img>").attr("src", iconSrc);
                if (iconElement)
                    iconElement.addClass(DX_ICON_CLASS).prependTo($itemContent);
                return $itemContent
            }};
        TEMPLATE_GENERATORS.dxTabPanel = {
            item: TEMPLATE_GENERATORS.CollectionWidget.item,
            title: titleTemplate
        };
        var NAVBAR_ITEM_BADGE_CLASS = "dx-navbar-item-badge";
        TEMPLATE_GENERATORS.dxNavBar = {itemFrame: function(itemData) {
                var $itemFrame = TEMPLATE_GENERATORS.CollectionWidget.itemFrame(itemData);
                if (itemData.badge) {
                    var $badge = $("<div>").addClass(NAVBAR_ITEM_BADGE_CLASS).addClass(BADGE_CLASS);
                    $badge.text(itemData.badge);
                    $badge.appendTo($itemFrame)
                }
                return $itemFrame
            }};
        TEMPLATE_GENERATORS.dxToolbar = {
            item: function(itemData) {
                var $itemContent = TEMPLATE_GENERATORS.CollectionWidget.item(itemData);
                var widget = itemData.widget;
                if (widget) {
                    var widgetElement = $("<div>").appendTo($itemContent),
                        widgetName = DX.inflector.camelize("dx-" + widget),
                        options = itemData.options || {};
                    widgetElement[widgetName](options)
                }
                else if (itemData.text)
                    $itemContent.wrapInner("<div>");
                return $itemContent
            },
            menuItem: TEMPLATE_GENERATORS.dxList.item,
            actionSheetItem: TEMPLATE_GENERATORS.dxActionSheet.item
        };
        TEMPLATE_GENERATORS.dxTreeView = {item: function(itemData) {
                var $itemContent = $("<div>");
                if (itemData.icon)
                    $('<span>').addClass(DX_ICON_CLASS + "-" + itemData.icon).addClass(DX_ICON_CLASS).appendTo($itemContent);
                if (itemData.iconSrc)
                    $('<img>').attr("src", itemData.iconSrc).addClass(DX_ICON_CLASS).appendTo($itemContent);
                $("<span>").text(itemData.text).appendTo($itemContent);
                return $itemContent
            }};
        var popupTitleAndBottom = function(itemData) {
                return $("<div>").dxToolbar({items: itemData})
            };
        TEMPLATE_GENERATORS.dxPopup = {
            title: popupTitleAndBottom,
            bottom: popupTitleAndBottom
        };
        TEMPLATE_GENERATORS.dxLookup = {
            title: TEMPLATE_GENERATORS.dxPopup.title,
            group: TEMPLATE_GENERATORS.dxList.group
        };
        $.extend(ui, {
            TemplateProvider: TemplateProvider,
            Template: Template,
            DefaultTemplate: DefaultTemplate,
            setTemplateEngine: setTemplateEngine
        })
    })(jQuery, DevExpress);
    /*! Module core, file ko.components.js */
    (function($, DX, undefined) {
        if (!DX.support.hasKo)
            return;
        var ko = window.ko,
            ui = DX.ui,
            LOCKS_DATA_KEY = "dxKoLocks",
            CREATED_WITH_KO_DATA_KEY = "dxKoCreation";
        var Locks = function() {
                var info = {};
                var currentCount = function(lockName) {
                        return info[lockName] || 0
                    };
                return {
                        obtain: function(lockName) {
                            info[lockName] = currentCount(lockName) + 1
                        },
                        release: function(lockName) {
                            var count = currentCount(lockName);
                            if (count < 1)
                                throw DX.Error("E0014");
                            if (count === 1)
                                delete info[lockName];
                            else
                                info[lockName] = count - 1
                        },
                        locked: function(lockName) {
                            return currentCount(lockName) > 0
                        }
                    }
            };
        var registerComponentKoBinding = function(componentName, componentClass) {
                ko.bindingHandlers[componentName] = {init: function(domNode, valueAccessor) {
                        var $element = $(domNode),
                            ctorOptions = {templateProvider: new ui.KoTemplateProvider},
                            optionNameToModelMap = {};
                        var applyModelValueToOption = function(optionName, modelValue) {
                                var component = $element.data(componentName),
                                    locks = $element.data(LOCKS_DATA_KEY),
                                    optionValue = ko.unwrap(modelValue);
                                if (ko.isWriteableObservable(modelValue))
                                    optionNameToModelMap[optionName] = modelValue;
                                if (component) {
                                    if (locks.locked(optionName))
                                        return;
                                    locks.obtain(optionName);
                                    try {
                                        component.option(optionName, optionValue)
                                    }
                                    finally {
                                        locks.release(optionName)
                                    }
                                }
                                else
                                    ctorOptions[optionName] = optionValue
                            };
                        var handleOptionChanged = function(args) {
                                var optionName = args.fullName,
                                    optionValue = args.value;
                                if (!(optionName in optionNameToModelMap))
                                    return;
                                var $element = this._$element,
                                    locks = $element.data(LOCKS_DATA_KEY);
                                if (locks.locked(optionName))
                                    return;
                                locks.obtain(optionName);
                                try {
                                    optionNameToModelMap[optionName](optionValue)
                                }
                                finally {
                                    locks.release(optionName)
                                }
                            };
                        var createComponent = function() {
                                $element.data(CREATED_WITH_KO_DATA_KEY, true).data(LOCKS_DATA_KEY, new Locks)[componentName](ctorOptions)[componentName]("on", "optionChanged", handleOptionChanged);
                                ctorOptions = null
                            };
                        var unwrapModelValue = function(option, model) {
                                var modelUnwrapped;
                                ko.computed(function() {
                                    applyModelValueToOption(option, model);
                                    modelUnwrapped = ko.unwrap(model)
                                }, null, {disposeWhenNodeIsRemoved: domNode});
                                if ($.isPlainObject(modelUnwrapped))
                                    $.each(modelUnwrapped, function(optionName, modelValue) {
                                        unwrapModelValue(option + "." + optionName, modelValue)
                                    })
                            };
                        ko.computed(function() {
                            var component = $element.data(componentName);
                            if (component)
                                component.beginUpdate();
                            $.each(ko.unwrap(valueAccessor()), function(optionName, modelValue) {
                                unwrapModelValue(optionName, modelValue)
                            });
                            if (component)
                                component.endUpdate();
                            else
                                createComponent()
                        }, null, {disposeWhenNodeIsRemoved: domNode});
                        return {controlsDescendantBindings: componentClass.subclassOf(ui.Widget)}
                    }}
            };
        DX.DOMComponent.redefine({_modelByElement: function(element) {
                if (element.length)
                    return ko.dataFor(element.get(0))
            }});
        var originalRegisterComponent = DX.registerComponent;
        var registerKoComponent = function(componentName, _, componentClass) {
                componentClass = componentClass || _;
                originalRegisterComponent.apply(this, arguments);
                registerComponentKoBinding(componentName, componentClass)
            };
        DX.registerComponent = registerKoComponent;
        var cleanKoData = function(element, andSelf) {
                var cleanNode = function() {
                        ko.cleanNode(this)
                    };
                if (andSelf)
                    element.each(cleanNode);
                else
                    element.find("*").each(cleanNode)
            };
        var originalEmpty = $.fn.empty;
        $.fn.empty = function() {
            cleanKoData(this, false);
            return originalEmpty.apply(this, arguments)
        };
        var originalRemove = $.fn.remove;
        $.fn.remove = function(selector, keepData) {
            if (!keepData) {
                var subject = this;
                if (selector)
                    subject = subject.filter(selector);
                cleanKoData(subject, true)
            }
            return originalRemove.call(this, selector, keepData)
        };
        var originalHtml = $.fn.html;
        $.fn.html = function(value) {
            if (typeof value === "string")
                cleanKoData(this, false);
            return originalHtml.apply(this, arguments)
        };
        ko.bindingHandlers.dxAction = {update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                var $element = $(element);
                var unwrappedValue = ko.utils.unwrapObservable(valueAccessor()),
                    actionSource = unwrappedValue,
                    actionOptions = {context: element};
                if (unwrappedValue.execute) {
                    actionSource = unwrappedValue.execute;
                    $.extend(actionOptions, unwrappedValue)
                }
                var action = new DX.Action(actionSource, actionOptions);
                $element.off(".dxActionBinding").on("dxclick.dxActionBinding", function(e) {
                    action.execute({
                        element: $element,
                        model: viewModel,
                        evaluate: function(expression) {
                            var context = viewModel;
                            if (expression.length > 0 && expression[0] === "$")
                                context = ko.contextFor(element);
                            var getter = DX.data.utils.compileGetter(expression);
                            return getter(context)
                        },
                        jQueryEvent: e
                    });
                    if (!actionOptions.bubbling)
                        e.stopPropagation()
                })
            }}
    })(jQuery, DevExpress);
    /*! Module core, file ng.components.js */
    (function($, DX, undefined) {
        if (!DX.support.hasNg)
            return;
        var ui = DX.ui,
            compileSetter = DX.data.utils.compileSetter,
            compileGetter = DX.data.utils.compileGetter;
        var CREATED_WITH_NG_DATA_KEY = "dxNgCreation",
            TEMPLATES_DATA_KEY = "dxTemplates",
            COMPILER_DATA_KEY = "dxNgCompiler",
            DEFAULT_COMPILER_DATA_KEY = "dxDefaultCompilerGetter",
            ANONYMOUS_TEMPLATE_NAME = "template";
        var phoneJsModule = DX.ng.module;
        var ComponentBuilder = DX.Class.inherit({
                ctor: function(options) {
                    this._$element = options.$element.data(CREATED_WITH_NG_DATA_KEY, true);
                    this._$templates = options.$templates;
                    this._componentClass = options.componentClass;
                    this._scope = options.scope;
                    this._compile = options.compile;
                    this._ngOptions = options.ngOptions;
                    this._componentDisposing = $.Callbacks();
                    if (options.ngOptions.data)
                        this._initDataScope(options.ngOptions.data)
                },
                initDefaultCompilerGetter: function() {
                    this._$element.data(DEFAULT_COMPILER_DATA_KEY, $.proxy(function($template) {
                        return this._compilerByTemplate($template)
                    }, this))
                },
                initTemplateCompilers: function() {
                    var that = this;
                    if (this._$templates)
                        this._$templates.each(function(i, template) {
                            $(template).data(COMPILER_DATA_KEY, that._compilerByTemplate(template))
                        })
                },
                initComponentWithBindings: function() {
                    this._initComponent(this._scope);
                    this._initComponentBindings()
                },
                _initDataScope: function(data) {
                    if (typeof data === "string") {
                        var dataStr = data,
                            rootScope = this._scope;
                        data = rootScope.$eval(data);
                        this._scope = rootScope.$new();
                        this._synchronizeDataScopes(rootScope, this._scope, data, dataStr)
                    }
                    $.extend(this._scope, data)
                },
                _synchronizeDataScopes: function(parentScope, childScope, data, parentPrefix) {
                    var that = this;
                    $.each(data, function(fieldPath) {
                        that._synchronizeScopeField({
                            parentScope: parentScope,
                            childScope: childScope,
                            fieldPath: fieldPath,
                            parentPrefix: parentPrefix
                        })
                    })
                },
                _initComponent: function(scope) {
                    this._component = new this._componentClass(this._$element, this._evalOptions(scope))
                },
                _initComponentBindings: function() {
                    var that = this,
                        optionDependencies = {};
                    if (that._ngOptions.bindingOptions)
                        $.each(that._ngOptions.bindingOptions, function(optionPath, valuePath) {
                            var separatorIndex = optionPath.search(/\[|\./),
                                optionForSubscribe = separatorIndex > -1 ? optionPath.substring(0, separatorIndex) : optionPath,
                                prevWatchMethod,
                                clearWatcher;
                            if (!optionDependencies[optionForSubscribe])
                                optionDependencies[optionForSubscribe] = {};
                            optionDependencies[optionForSubscribe][optionPath] = valuePath;
                            var watchCallback = function(newValue, oldValue) {
                                    if (newValue !== oldValue) {
                                        that._component.option(optionPath, newValue);
                                        updateWatcher()
                                    }
                                };
                            var updateWatcher = function() {
                                    var watchMethod = $.isArray(that._scope.$eval(valuePath)) ? "$watchCollection" : "$watch";
                                    if (prevWatchMethod !== watchMethod) {
                                        if (clearWatcher)
                                            clearWatcher();
                                        clearWatcher = that._scope[watchMethod](valuePath, watchCallback, true);
                                        prevWatchMethod = watchMethod
                                    }
                                };
                            updateWatcher();
                            that._component.on("disposing", function() {
                                clearWatcher();
                                that._componentDisposing.fire()
                            })
                        });
                    that._component.on("optionChanged", function(args) {
                        var optionName = args.name,
                            optionValue = args.value;
                        if (that._scope.$root.$$phase === "$digest" || !optionDependencies || !optionDependencies[optionName])
                            return;
                        safeApply(function(scope) {
                            $.each(optionDependencies[optionName], function(optionPath, valuePath) {
                                var setter = compileSetter(valuePath),
                                    getter = compileGetter(optionPath);
                                var tmpData = {};
                                tmpData[optionName] = optionValue;
                                setter(scope, getter(tmpData))
                            })
                        }, that._scope)
                    })
                },
                _compilerByTemplate: function(template) {
                    var that = this,
                        scopeItemsPath = this._getScopeItemsPath();
                    return function(data, index) {
                            var $resultMarkup = $(template).clone(),
                                templateScope;
                            if (data !== undefined) {
                                var dataIsScope = data.$id,
                                    templateScope = dataIsScope ? data : that._createScopeWithData(data);
                                $resultMarkup.on("$destroy", function() {
                                    var destroyAlreadyCalled = !templateScope.$parent;
                                    if (destroyAlreadyCalled)
                                        return;
                                    templateScope.$destroy()
                                })
                            }
                            else
                                templateScope = that._scope;
                            if (scopeItemsPath)
                                that._synchronizeScopes(templateScope, scopeItemsPath, index);
                            safeApply(that._compile($resultMarkup), templateScope);
                            return $resultMarkup
                        }
                },
                _getScopeItemsPath: function() {
                    if (this._componentClass.subclassOf(ui.CollectionWidget) && this._ngOptions.bindingOptions)
                        return this._ngOptions.bindingOptions.items
                },
                _createScopeWithData: function(data) {
                    var newScope = this._scope.$new(true);
                    if ($.isPlainObject(data))
                        $.extend(newScope, data);
                    else
                        newScope.scopeValue = data;
                    return newScope
                },
                _synchronizeScopes: function(itemScope, parentPrefix, itemIndex) {
                    var that = this,
                        item = compileGetter(parentPrefix + "[" + itemIndex + "]")(this._scope);
                    if (!$.isPlainObject(item))
                        item = {scopeValue: item};
                    $.each(item, function(itemPath) {
                        that._synchronizeScopeField({
                            parentScope: that._scope,
                            childScope: itemScope,
                            fieldPath: itemPath,
                            parentPrefix: parentPrefix,
                            itemIndex: itemIndex
                        })
                    })
                },
                _synchronizeScopeField: function(args) {
                    var parentScope = args.parentScope,
                        childScope = args.childScope,
                        fieldPath = args.fieldPath,
                        parentPrefix = args.parentPrefix,
                        itemIndex = args.itemIndex;
                    var innerPathSuffix = fieldPath === "scopeValue" ? "" : "." + fieldPath,
                        collectionField = itemIndex !== undefined,
                        optionOuterBag = [parentPrefix],
                        optionOuterPath;
                    if (collectionField)
                        optionOuterBag.push("[", itemIndex, "]");
                    optionOuterBag.push(innerPathSuffix);
                    optionOuterPath = optionOuterBag.join("");
                    var clearParentWatcher = parentScope.$watch(optionOuterPath, function(newValue, oldValue) {
                            if (newValue !== oldValue)
                                compileSetter(fieldPath)(childScope, newValue)
                        });
                    var clearItemWatcher = childScope.$watch(fieldPath, function(newValue, oldValue) {
                            if (newValue !== oldValue) {
                                if (collectionField && !compileGetter(parentPrefix)(parentScope)[itemIndex]) {
                                    clearItemWatcher();
                                    return
                                }
                                compileSetter(optionOuterPath)(parentScope, newValue)
                            }
                        });
                    this._componentDisposing.add([clearParentWatcher, clearItemWatcher])
                },
                _evalOptions: function(scope) {
                    var result = $.extend({}, this._ngOptions);
                    delete result.data;
                    delete result.bindingOptions;
                    if (this._ngOptions.bindingOptions)
                        $.each(this._ngOptions.bindingOptions, function(key, value) {
                            result[key] = scope.$eval(value)
                        });
                    result.templateProvider = new ui.NgTemplateProvider;
                    return result
                }
            });
        var safeApply = function(func, scope) {
                if (scope.$root.$$phase)
                    func(scope);
                else
                    scope.$apply(function() {
                        func(scope)
                    })
            };
        var extractTemplates = function($element, componentClass) {
                if ($element.data(TEMPLATES_DATA_KEY))
                    return $element.data(TEMPLATES_DATA_KEY);
                var $templates;
                if (componentClass.subclassOf(ui.Widget) && $.trim($element.html())) {
                    var isAnonymousTemplate = !$element.children().first().attr("data-options");
                    if (isAnonymousTemplate)
                        $templates = $("<div/>").attr("data-options", "dxTemplate: { name: '" + ANONYMOUS_TEMPLATE_NAME + "' }").append($element.contents());
                    else
                        $templates = $element.children().detach();
                    $element.data(TEMPLATES_DATA_KEY, $templates)
                }
                return $templates
            };
        var NgComponent = DX.DOMComponent.inherit({
                _modelByElement: function(element) {
                    if (element.length)
                        return element.scope()
                },
                _createAction: function() {
                    var action = this.callBase.apply(this, arguments);
                    var component = this,
                        wrappedAction = function() {
                            var that = this,
                                scope = component._modelByElement(component.element()),
                                args = arguments;
                            if (!scope || !scope.$root || scope.$root.$$phase)
                                return action.apply(that, args);
                            return scope.$apply(function() {
                                    return action.apply(that, args)
                                })
                        };
                    return wrappedAction
                }
            });
        var originalRegisterComponent = DX.registerComponent;
        var registerNgComponent = function(componentName, _, componentClass) {
                componentClass = componentClass || _;
                originalRegisterComponent.apply(this, arguments);
                phoneJsModule.directive(componentName, ["$compile", function(compile) {
                        return {
                                restrict: "A",
                                compile: function($element) {
                                    var $templates = extractTemplates($element, componentClass);
                                    return function(scope, $element, attrs) {
                                            var componentBuilder = new ComponentBuilder({
                                                    componentClass: componentClass,
                                                    componentName: componentName,
                                                    compile: compile,
                                                    $element: $element,
                                                    scope: scope,
                                                    ngOptions: attrs[componentName] ? scope.$eval(attrs[componentName]) : {},
                                                    $templates: $templates
                                                });
                                            componentBuilder.initTemplateCompilers();
                                            componentBuilder.initDefaultCompilerGetter();
                                            componentBuilder.initComponentWithBindings()
                                        }
                                }
                            }
                    }])
            };
        DX.registerComponent = registerNgComponent;
        registerNgComponent("DOMComponent", NgComponent)
    })(jQuery, DevExpress);
    /*! Module core, file ko.templates.js */
    (function($, DX, undefined) {
        if (!DX.support.hasKo)
            return;
        var ko = window.ko,
            ui = DX.ui,
            CREATED_WITH_KO_DATA_KEY = "dxKoCreation";
        var KoTemplate = ui.TemplateBase.inherit({
                ctor: function(element) {
                    this.callBase.apply(this, arguments);
                    this._template = $("<div>").append(DX.utils.normalizeTemplateElement(element));
                    this._registerKoTemplate()
                },
                _registerKoTemplate: function() {
                    var template = this._template.get(0);
                    new ko.templateSources.anonymousTemplate(template)['nodes'](template)
                },
                _prepareDataForContainer: function(data, container) {
                    var result = data,
                        containerElement,
                        containerContext;
                    if (container.length) {
                        containerElement = container.get(0);
                        data = DX.utils.isDefined(data) ? data : ko.dataFor(containerElement) || {};
                        containerContext = ko.contextFor(containerElement);
                        if (containerContext)
                            result = data === containerContext.$data ? containerContext : containerContext.createChildContext(data);
                        else
                            result = data
                    }
                    return result
                },
                _renderCore: function(data) {
                    var renderBag = $("<div />"),
                        result;
                    ko.renderTemplate(this._template.get(0), data, null, renderBag.get(0));
                    result = renderBag.contents();
                    result.detach();
                    renderBag.remove();
                    return result
                },
                dispose: function() {
                    this.callBase();
                    this._template.remove()
                }
            });
        var KoTemplateProvider = ui.TemplateProviderBase.inherit({
                createTemplate: function(element, owner) {
                    return new KoTemplate(element, owner)
                },
                applyTemplate: function(element, model) {
                    ko.applyBindings(model, element)
                },
                _templatesForWidget: function(name) {
                    return defaultTemplates(name)
                }
            });
        var defaultTemplates = function() {
                var cache = {};
                return function(widgetName) {
                        if (!cache[widgetName]) {
                            var templateGenerators = TEMPLATE_GENERATORS[widgetName] || {},
                                templates = {};
                            $.each(templateGenerators, function(name, generator) {
                                var markup = DX.utils.createMarkupFromString(generator());
                                templates[name] = new KoTemplate(markup)
                            });
                            cache[widgetName] = templates
                        }
                        return cache[widgetName]
                    }
            }();
        var createElementWithBindAttr = function(tagName, bindings, closeTag, additionalProperties) {
                closeTag = closeTag === undefined ? true : closeTag;
                var bindAttr = $.map(bindings, function(value, key) {
                        return key + ":" + value
                    }).join(",");
                additionalProperties = additionalProperties || "";
                return "<" + tagName + " data-bind=\"" + bindAttr + "\" " + additionalProperties + ">" + (closeTag ? "</" + tagName + ">" : "")
            };
        var defaultKoTemplateBasicBindings = {css: "{ 'dx-state-disabled': $data.disabled, 'dx-state-invisible': !($data.visible === undefined || ko.unwrap($data.visible)) }"};
        var TEMPLATE_GENERATORS = {};
        TEMPLATE_GENERATORS.CollectionWidget = {
            itemFrame: function() {
                var markup = [createElementWithBindAttr("div", defaultKoTemplateBasicBindings, false), "<div class='dx-item-content-placeholder'></div>", "</div>"];
                return markup.join("")
            },
            item: function() {
                var htmlBinding = createElementWithBindAttr("div", {html: "html"}),
                    textBinding = createElementWithBindAttr("div", {text: "text"}),
                    primitiveBinding = createElementWithBindAttr("div", {text: "String($data)"});
                var markup = ["<div>", "<!-- ko if: $data.html && !$data.text -->", htmlBinding, "<!-- /ko -->", "<!-- ko if: !$data.html && $data.text -->", textBinding, "<!-- /ko -->", "<!-- ko ifnot: $.isPlainObject($data) -->", primitiveBinding, "<!-- /ko -->", "</div>"];
                return markup.join("")
            }
        };
        var LIST_ITEM_BADGE_CONTAINER_CLASS = "dx-list-item-badge-container",
            LIST_ITEM_BADGE_CLASS = "dx-list-item-badge",
            BADGE_CLASS = "dx-badge",
            LIST_ITEM_CHEVRON_CONTAINER_CLASS = "dx-list-item-chevron-container",
            LIST_ITEM_CHEVRON_CLASS = "dx-list-item-chevron";
        TEMPLATE_GENERATORS.dxList = {
            item: function() {
                var template = TEMPLATE_GENERATORS.CollectionWidget.item(),
                    keyBinding = createElementWithBindAttr("div", {text: "key"});
                template = [template.substring(0, template.length - 6), "<!-- ko if: $data.key -->" + keyBinding + "<!-- /ko -->", "</div>"];
                return template.join("")
            },
            itemFrame: function() {
                var template = TEMPLATE_GENERATORS.CollectionWidget.itemFrame(),
                    badgeBinding = createElementWithBindAttr("div", {text: "badge"}, true, 'class="' + LIST_ITEM_BADGE_CLASS + " " + BADGE_CLASS + '"');
                var markup = [template.substring(0, template.length - 6), "<!-- ko if: $data.badge -->", "<div class=\"" + LIST_ITEM_BADGE_CONTAINER_CLASS + "\">", badgeBinding, "</div>", "<!-- /ko -->", "<!-- ko if: $data.showChevron -->", "<div class=\"" + LIST_ITEM_CHEVRON_CONTAINER_CLASS + "\">", "<div class=\"" + LIST_ITEM_CHEVRON_CLASS + "\"></div>", "</div>", "<!-- /ko -->", "</div>"];
                return markup.join("")
            },
            group: function() {
                var keyBinding = createElementWithBindAttr("div", {text: "key"}),
                    primitiveBinding = createElementWithBindAttr("div", {text: "String($data)"});
                var markup = ["<div>", "<!-- ko if: $data.key -->", keyBinding, "<!-- /ko -->", "<!-- ko ifnot: $.isPlainObject($data) -->", primitiveBinding, "<!-- /ko -->", "</div>"];
                return markup.join("")
            }
        };
        TEMPLATE_GENERATORS.dxDropDownMenu = {item: TEMPLATE_GENERATORS.dxList.item};
        TEMPLATE_GENERATORS.dxDropDownList = {item: TEMPLATE_GENERATORS.dxList.item};
        TEMPLATE_GENERATORS.dxRadioGroup = {item: TEMPLATE_GENERATORS.CollectionWidget.item};
        TEMPLATE_GENERATORS.dxSlideOut = {
            menuItem: TEMPLATE_GENERATORS.dxList.item,
            menuGroup: TEMPLATE_GENERATORS.dxList.group
        };
        var titleTemplate = function() {
                var titleBinding = createElementWithBindAttr("div", {text: "title"}),
                    primitiveBinding = createElementWithBindAttr("div", {text: "String($data)"});
                var markup = ["<div>", "<!-- ko if: $data.title -->", titleBinding, "<!-- /ko -->", "<!-- ko ifnot: $.isPlainObject($data) -->", primitiveBinding, "<!-- /ko -->", "</div>"];
                return markup.join("")
            };
        TEMPLATE_GENERATORS.dxAccordion = {
            title: titleTemplate,
            item: TEMPLATE_GENERATORS.CollectionWidget.item
        };
        TEMPLATE_GENERATORS.dxResponsiveBox = {item: TEMPLATE_GENERATORS.CollectionWidget.item},
        TEMPLATE_GENERATORS.dxPivotTabs = {item: function() {
                var template = TEMPLATE_GENERATORS.CollectionWidget.item(),
                    titleBinding = createElementWithBindAttr("span", {text: "title"});
                var divInnerStart = template.indexOf(">") + 1,
                    divInnerFinish = template.length - 6;
                template = [template.substring(0, divInnerStart), titleBinding, template.substring(divInnerFinish, template.length)];
                return template.join("")
            }};
        var PANORAMA_ITEM_TITLE_CLASS = "dx-panorama-item-title";
        TEMPLATE_GENERATORS.dxPanorama = {itemFrame: function() {
                var template = TEMPLATE_GENERATORS.CollectionWidget.itemFrame(),
                    headerBinding = createElementWithBindAttr("div", {text: "title"}, true, 'class="' + PANORAMA_ITEM_TITLE_CLASS + '"');
                var divInnerStart = template.indexOf(">") + 1;
                template = [template.substring(0, divInnerStart), "<!-- ko if: $data.title -->", headerBinding, "<!-- /ko -->", template.substring(divInnerStart, template.length)];
                return template.join("")
            }};
        TEMPLATE_GENERATORS.dxActionSheet = {item: function() {
                return createElementWithBindAttr("div", {dxButton: "{ text: $data.text, onClick: $data.clickAction || $data.onClick, type: $data.type, disabled: !!ko.unwrap($data.disabled) }"})
            }};
        TEMPLATE_GENERATORS.dxToolbar = {
            item: function() {
                var template = TEMPLATE_GENERATORS.CollectionWidget.item();
                template = [template.substring(0, template.length - 6), "<!-- ko if: $data.widget -->"];
                $.each(["button", "tabs", "dropDownMenu"], function() {
                    var bindingName = DX.inflector.camelize(["dx", "-", this].join("")),
                        bindingObj = {};
                    bindingObj[bindingName] = "$data.options";
                    template.push("<!-- ko if: $data.widget === '", this, "' -->", createElementWithBindAttr("div", bindingObj), "<!-- /ko -->")
                });
                template.push("<!-- /ko -->");
                return template.join("")
            },
            menuItem: TEMPLATE_GENERATORS.dxList.item,
            actionSheetItem: TEMPLATE_GENERATORS.dxActionSheet.item
        };
        TEMPLATE_GENERATORS.dxGallery = {item: function() {
                var template = TEMPLATE_GENERATORS.CollectionWidget.item(),
                    primitiveBinding = createElementWithBindAttr("div", {text: "String($data)"}),
                    imgBinding = createElementWithBindAttr("img", {attr: "{ src: String($data) }"}, false);
                template = [template.substring(0, template.length - 6).replace(primitiveBinding, imgBinding), "<!-- ko if: $data.imageSrc -->", createElementWithBindAttr("img", {attr: "{ src: $data.imageSrc }"}, false), "<!-- /ko -->"].join("");
                return template
            }};
        TEMPLATE_GENERATORS.dxTabs = {item: function() {
                var template = TEMPLATE_GENERATORS.CollectionWidget.item(),
                    baseTextBinding = createElementWithBindAttr("div", {text: "text"}),
                    iconBinding = createElementWithBindAttr("span", {
                        attr: "{ 'class': 'dx-icon-' + $data.icon }",
                        css: "{ 'dx-icon': true }"
                    }),
                    iconSrcBinding = createElementWithBindAttr("img", {
                        attr: "{ src: $data.iconSrc }",
                        css: "{ 'dx-icon': true }"
                    }, false),
                    textBinding = "<!-- ko if: $data.icon -->" + iconBinding + "<!-- /ko -->" + "<!-- ko if: !$data.icon && $data.iconSrc -->" + iconSrcBinding + "<!-- /ko -->" + "<span class=\"dx-tab-text\" data-bind=\"text: $data.text\"></span>";
                template = template.replace("<!-- ko if: !$data.html && $data.text -->", "<!-- ko if: !$data.html && ($data.text || $data.icon || $data.iconSrc) -->").replace(baseTextBinding, textBinding);
                return template
            }};
        TEMPLATE_GENERATORS.dxTabPanel = {
            item: TEMPLATE_GENERATORS.CollectionWidget.item,
            title: titleTemplate
        };
        var NAVBAR_ITEM_BADGE_CLASS = "dx-navbar-item-badge";
        TEMPLATE_GENERATORS.dxNavBar = {itemFrame: function() {
                var template = TEMPLATE_GENERATORS.CollectionWidget.itemFrame(),
                    badgeBinding = createElementWithBindAttr("div", {text: "badge"}, true, 'class="' + NAVBAR_ITEM_BADGE_CLASS + " " + BADGE_CLASS + '"');
                var markup = [template.substring(0, template.length - 6), "<!-- ko if: $data.badge -->", badgeBinding, "<!-- /ko -->", "</div>"];
                return markup.join("")
            }};
        TEMPLATE_GENERATORS.dxMenuBase = {item: function() {
                var template = [createElementWithBindAttr("div", defaultKoTemplateBasicBindings, false)],
                    iconBinding = createElementWithBindAttr("span", {
                        attr: "{ 'class': 'dx-icon-' + $data.icon }",
                        css: "{ 'dx-icon': true }"
                    }),
                    iconSrcBinding = createElementWithBindAttr("img", {
                        attr: "{ src: $data.iconSrc }",
                        css: "{ 'dx-icon': true }"
                    }),
                    textBinding = createElementWithBindAttr("span", {
                        text: "text",
                        css: "{ 'dx-menu-item-text': true }"
                    }),
                    primitiveBinding = createElementWithBindAttr("span", {
                        text: "String($data)",
                        css: "{ 'dx-menu-item-text': true }"
                    }),
                    popout = '<span class="dx-menu-item-popout-container"><div class="dx-menu-item-popout"></div></span>';
                template.push('<!-- ko if: $data.icon -->', iconBinding, '<!-- /ko -->', '<!-- ko if: !$data.icon && $data.iconSrc -->', iconSrcBinding, '<!-- /ko -->', '<!-- ko if: $.isPlainObject($data) -->', textBinding, '<!-- /ko -->', '<!-- ko ifnot: $.isPlainObject($data) -->', primitiveBinding, '<!-- /ko -->', '<!-- ko if: $data.items -->', popout, '<!-- /ko -->', '</div>');
                return template.join("")
            }};
        TEMPLATE_GENERATORS.dxTreeView = {item: function() {
                var node = [createElementWithBindAttr("div", defaultKoTemplateBasicBindings, false)],
                    link = createElementWithBindAttr("span", {text: "text"}, true),
                    iconBinding = createElementWithBindAttr("span", {
                        attr: "{ 'class': 'dx-icon-' + $data.icon }",
                        css: "{ 'dx-icon': true }"
                    }),
                    iconSrcBinding = createElementWithBindAttr("img", {
                        attr: "{ src: $data.iconSrc }",
                        css: "{ 'dx-icon': true }"
                    }, false);
                node.push("<div>", "<!-- ko if: $data.icon -->", iconBinding, "<!-- /ko -->", "<!-- ko if: !$data.icon && $data.iconSrc -->", iconSrcBinding, "<!-- /ko -->", "<!-- ko if: !$data.html && $data.text -->" + link + "<!-- /ko -->", "</div>");
                return node.join("")
            }};
        var popupTitleAndBottom = function(itemData) {
                return createElementWithBindAttr("div", {dxToolbar: "{ items: $data }"})
            };
        TEMPLATE_GENERATORS.dxPopup = {
            title: popupTitleAndBottom,
            bottom: popupTitleAndBottom
        };
        TEMPLATE_GENERATORS.dxLookup = {
            title: TEMPLATE_GENERATORS.dxPopup.title,
            group: TEMPLATE_GENERATORS.dxList.group
        };
        $.extend(ui, {
            KoTemplateProvider: KoTemplateProvider,
            KoTemplate: KoTemplate
        })
    })(jQuery, DevExpress);
    /*! Module core, file ng.templates.js */
    (function($, DX, undefined) {
        if (!DX.support.hasNg)
            return;
        var ui = DX.ui;
        var CREATED_WITH_NG_DATA_KEY = "dxNgCreation",
            COMPILER_DATA_KEY = "dxNgCompiler",
            DEFAULT_COMPILER_DATA_KEY = "dxDefaultCompilerGetter";
        var NgTemplate = ui.TemplateBase.inherit({
                ctor: function() {
                    this.callBase.apply(this, arguments);
                    this._compiler = this._element.data(COMPILER_DATA_KEY)
                },
                _renderCore: function(data, index) {
                    var compiler = this._compiler,
                        result = $.isFunction(compiler) ? compiler(data, index) : compiler;
                    return result
                },
                setCompiler: function(compilerGetter) {
                    this._compiler = compilerGetter(this._element)
                }
            });
        var NgTemplateProvider = ui.TemplateProviderBase.inherit({
                createTemplate: function(element, owner) {
                    return new NgTemplate(element, owner)
                },
                getTemplates: function(widget) {
                    var compilerGetter = widget.element().data(DEFAULT_COMPILER_DATA_KEY);
                    var templates = this.callBase.apply(this, arguments);
                    $.each(templates, function(_, template) {
                        template.setCompiler(compilerGetter)
                    });
                    return templates
                },
                _templatesForWidget: function(name) {
                    return defaultTemplates(name)
                }
            });
        var defaultTemplates = function() {
                var cache = {};
                return function(widgetName) {
                        if (!cache[widgetName]) {
                            var templateGenerators = TEMPLATE_GENERATORS[widgetName] || {},
                                templates = {};
                            $.each(templateGenerators, function(name, generator) {
                                var markup = DX.utils.createMarkupFromString(generator());
                                templates[name] = new NgTemplate(markup)
                            });
                            cache[widgetName] = templates
                        }
                        return cache[widgetName]
                    }
            }();
        var baseElements = {
                container: function() {
                    return $("<div>")
                },
                html: function() {
                    return $("<div>").attr("ng-if", "html").attr("ng-bind-html", "html")
                },
                text: function() {
                    return $("<div>").attr("ng-if", "text").attr("ng-bind", "text")
                },
                primitive: function() {
                    return $("<div>").attr("ng-if", "scopeValue").attr("ng-bind-html", "'' + scopeValue")
                }
            };
        var TEMPLATE_GENERATORS = {};
        TEMPLATE_GENERATORS.CollectionWidget = {
            item: function() {
                return baseElements.container().append(baseElements.html()).append(baseElements.text()).append(baseElements.primitive())
            },
            itemFrame: function() {
                var $container = $("<div>").attr("ng-class", "{ 'dx-state-invisible': !visible && visible != undefined, 'dx-state-disabled': !!disabled }"),
                    $placeholder = $("<div>").addClass("dx-item-content-placeholder");
                $container.append($placeholder);
                return $container
            }
        };
        var LIST_ITEM_BADGE_CONTAINER_CLASS = "dx-list-item-badge-container",
            LIST_ITEM_BADGE_CLASS = "dx-list-item-badge",
            BADGE_CLASS = "dx-badge",
            LIST_ITEM_CHEVRON_CONTAINER_CLASS = "dx-list-item-chevron-container",
            LIST_ITEM_CHEVRON_CLASS = "dx-list-item-chevron";
        TEMPLATE_GENERATORS.dxList = {
            item: function() {
                return TEMPLATE_GENERATORS.CollectionWidget.item().append($("<div>").attr("ng-if", "key").attr("ng-bind", "key"))
            },
            itemFrame: function() {
                var $badgeContainer = $("<div>").addClass(LIST_ITEM_BADGE_CONTAINER_CLASS).attr("ng-if", "badge"),
                    $badge = $("<div>").addClass(LIST_ITEM_BADGE_CLASS).addClass(BADGE_CLASS).attr("ng-bind", "badge");
                var $chevronContainer = $("<div>").addClass(LIST_ITEM_CHEVRON_CONTAINER_CLASS).attr("ng-if", "showChevron"),
                    $chevron = $("<div>").addClass(LIST_ITEM_CHEVRON_CLASS);
                return TEMPLATE_GENERATORS.CollectionWidget.itemFrame().append($badgeContainer.append($badge)).append($chevronContainer.append($chevron))
            },
            group: function() {
                var $keyBinding = $("<div>").attr("ng-if", "key").attr("ng-bind", "key");
                return baseElements.container().append($keyBinding).append(baseElements.primitive())
            }
        };
        TEMPLATE_GENERATORS.dxDropDownMenu = {item: TEMPLATE_GENERATORS.dxList.item};
        TEMPLATE_GENERATORS.dxDropDownList = {item: TEMPLATE_GENERATORS.dxList.item};
        TEMPLATE_GENERATORS.dxRadioGroup = {item: TEMPLATE_GENERATORS.CollectionWidget.item};
        TEMPLATE_GENERATORS.dxSlideOut = {
            menuItem: TEMPLATE_GENERATORS.dxList.item,
            menuGroup: TEMPLATE_GENERATORS.dxList.group
        };
        var titleTemplate = function() {
                var $titleBinding = $("<div>").attr("ng-if", "title").attr("ng-bind", "title");
                return baseElements.container().append($titleBinding).append(baseElements.primitive())
            };
        TEMPLATE_GENERATORS.dxAccordion = {
            title: titleTemplate,
            content: TEMPLATE_GENERATORS.CollectionWidget.item
        };
        TEMPLATE_GENERATORS.dxPivotTabs = {item: function() {
                return baseElements.container().append($("<span>").attr("ng-bind", "title"))
            }};
        var PANORAMA_ITEM_TITLE_CLASS = "dx-panorama-item-title";
        TEMPLATE_GENERATORS.dxPanorama = {itemFrame: function() {
                return TEMPLATE_GENERATORS.CollectionWidget.itemFrame().prepend($("<div>").addClass(PANORAMA_ITEM_TITLE_CLASS).attr("ng-if", "title").attr("ng-bind", "title"))
            }};
        TEMPLATE_GENERATORS.dxActionSheet = {item: function() {
                return $("<div>").attr("dx-button", "{ bindingOptions: { text: 'text', onClick: 'onClick', type: 'type', disabled: 'disabled' } }")
            }};
        TEMPLATE_GENERATORS.dxToolbar = {
            item: function() {
                var template = TEMPLATE_GENERATORS.CollectionWidget.item();
                $.each(["button", "tabs", "dropDownMenu"], function(i, widgetName) {
                    var bindingName = "dx-" + DX.inflector.dasherize(this);
                    $("<div>").attr("ng-if", "widget === '" + widgetName + "'").attr(bindingName, "options").appendTo(template)
                });
                return template
            },
            menuItem: TEMPLATE_GENERATORS.dxList.item,
            actionSheetItem: TEMPLATE_GENERATORS.dxActionSheet.item
        };
        TEMPLATE_GENERATORS.dxGallery = {item: function() {
                return baseElements.container().append(baseElements.html()).append(baseElements.text()).append($("<img>").attr("ng-if", "scopeValue").attr("ng-src", "{{'' + scopeValue}}")).append($("<img>").attr("ng-if", "imageSrc").attr("ng-src", "{{imageSrc}}"))
            }};
        TEMPLATE_GENERATORS.dxTabs = {item: function() {
                var container = baseElements.container();
                var text = $("<span>").addClass("dx-tab-text").attr("ng-bind", "text").attr("ng-if", "text"),
                    icon = $("<span>").attr("ng-if", "icon").addClass("dx-icon").attr("ng-class", "'dx-icon-' + icon"),
                    iconSrc = $("<img>").attr("ng-if", "iconSrc").addClass("dx-icon").attr("ng-src", "{{iconSrc}}");
                return container.append(baseElements.html()).append(icon).append(iconSrc).append(text).append(baseElements.primitive())
            }};
        var NAVBAR_ITEM_BADGE_CLASS = "dx-navbar-item-badge";
        TEMPLATE_GENERATORS.dxNavBar = {itemFrame: function() {
                var $badge = $("<div>").addClass(NAVBAR_ITEM_BADGE_CLASS).addClass(BADGE_CLASS).attr("ng-if", "badge").attr("ng-bind", "badge");
                return TEMPLATE_GENERATORS.CollectionWidget.itemFrame().append($badge)
            }};
        TEMPLATE_GENERATORS.dxMenuBase = {item: function() {
                var container = baseElements.container();
                var text = $("<span>").attr("ng-if", "text").addClass("dx-menu-item-text").attr("ng-bind", "text"),
                    icon = $("<span>").attr("ng-if", "icon").addClass("dx-icon").attr("ng-class", "'dx-icon-' + icon"),
                    iconSrc = $("<img>").attr("ng-if", "iconSrc").addClass("dx-icon").attr("ng-src", "{{iconSrc}}"),
                    popout = $("<span>").addClass("dx-menu-item-popout-container").attr("ng-if", "items").append($("<div>").addClass("dx-menu-item-popout"));
                container.append(baseElements.html()).append(icon).append(iconSrc).append(text).append(popout).append(baseElements.primitive()).appendTo(container);
                return container
            }};
        TEMPLATE_GENERATORS.dxTreeView = {item: function() {
                var container = baseElements.container();
                var content = $("<div />"),
                    link = $("<span/>").attr("ng-bind", "text"),
                    icon = $("<span>").attr("ng-if", "icon").addClass("dx-icon").attr("ng-class", "'dx-icon-' + icon"),
                    iconSrc = $("<img>").attr("ng-if", "iconSrc").addClass("dx-icon").attr("ng-src", "{{iconSrc}}");
                content.append(baseElements.html()).append(icon).append(iconSrc).append(link).append(baseElements.primitive()).appendTo(container);
                return container
            }};
        TEMPLATE_GENERATORS.dxTabPanel = {
            item: TEMPLATE_GENERATORS.CollectionWidget.item,
            title: titleTemplate
        };
        var popupTitleAndBottom = function() {
                return $("<div>").attr("dx-toolbar", "{ bindingOptions: { items: 'scopeValue' } }")
            };
        TEMPLATE_GENERATORS.dxPopup = {
            title: popupTitleAndBottom,
            bottom: popupTitleAndBottom
        };
        TEMPLATE_GENERATORS.dxLookup = {
            title: TEMPLATE_GENERATORS.dxPopup.title,
            group: TEMPLATE_GENERATORS.dxList.group
        };
        $.extend(ui, {
            NgTemplate: NgTemplate,
            NgTemplateProvider: NgTemplateProvider
        })
    })(jQuery, DevExpress);
    /*! Module core, file ko.validation.js */
    (function($, DX, undefined) {
        if (!DX.support.hasKo)
            return;
        var ko = window.ko;
        var koDxValidator = DX.Class.inherit({
                ctor: function(target, option) {
                    var that = this;
                    that.target = target;
                    that.validationRules = option.validationRules;
                    that.name = option.name;
                    that.isValid = ko.observable(true);
                    that.validationError = ko.observable();
                    $.each(this.validationRules, function(_, rule) {
                        rule.validator = that
                    })
                },
                validate: function() {
                    var result = DevExpress.validationEngine.validate(this.target(), this.validationRules, this.name);
                    this.target.dxValidator.isValid(result.isValid);
                    this.target.dxValidator.validationError(result.brokenRule);
                    this.fireEvent("validated", [result]);
                    return result
                }
            }).include(DX.EventsMixin);
        ko.extenders.dxValidator = function(target, option) {
            target.dxValidator = new koDxValidator(target, option);
            target.subscribe($.proxy(target.dxValidator.validate, target.dxValidator));
            return target
        };
        DevExpress.validationEngine.registerModelForValidation = function(model) {
            $.each(model, function(name, member) {
                if (ko.isObservable(member) && member.dxValidator)
                    DevExpress.validationEngine.registerValidatorInGroup(model, member.dxValidator)
            })
        };
        DevExpress.validationEngine.validateModel = DevExpress.validationEngine.validateGroup
    })(jQuery, DevExpress);
    /*! Module core, file ui.themes.js */
    (function($, DX, undefined) {
        var DX_LINK_SELECTOR = "link[rel=dx-theme]",
            THEME_ATTR = "data-theme",
            ACTIVE_ATTR = "data-active";
        var context,
            $activeThemeLink,
            knownThemes,
            currentThemeName,
            pendingThemeName;
        var THEME_MARKER_PREFIX = "dx.";
        function readThemeMarker() {
            var element = $("<div></div>", context).addClass("dx-theme-marker").appendTo(context.documentElement),
                result;
            try {
                result = element.css("font-family");
                if (!result)
                    return null;
                result = result.replace(/["']/g, "");
                if (result.substr(0, THEME_MARKER_PREFIX.length) !== THEME_MARKER_PREFIX)
                    return null;
                return result.substr(THEME_MARKER_PREFIX.length)
            }
            finally {
                element.remove()
            }
        }
        function waitForThemeLoad(themeName, callback) {
            var timerId,
                waitStartTime;
            pendingThemeName = themeName;
            function handleLoaded() {
                pendingThemeName = null;
                callback()
            }
            if (isPendingThemeLoaded())
                handleLoaded();
            else {
                waitStartTime = $.now();
                timerId = setInterval(function() {
                    var isLoaded = isPendingThemeLoaded(),
                        isTimeout = !isLoaded && $.now() - waitStartTime > 15 * 1000;
                    if (isTimeout)
                        DX.log("W0004", pendingThemeName);
                    if (isLoaded || isTimeout) {
                        clearInterval(timerId);
                        handleLoaded()
                    }
                }, 10)
            }
        }
        function isPendingThemeLoaded() {
            return !pendingThemeName || readThemeMarker() === pendingThemeName
        }
        function processMarkup() {
            var $allThemeLinks = $(DX_LINK_SELECTOR, context);
            if (!$allThemeLinks.length)
                return;
            knownThemes = {};
            $activeThemeLink = $(DX.utils.createMarkupFromString("<link rel=stylesheet>"), context);
            $allThemeLinks.each(function() {
                var link = $(this, context),
                    fullThemeName = link.attr(THEME_ATTR),
                    url = link.attr("href"),
                    isActive = link.attr(ACTIVE_ATTR) === "true";
                knownThemes[fullThemeName] = {
                    url: url,
                    isActive: isActive
                }
            });
            $allThemeLinks.last().after($activeThemeLink);
            $allThemeLinks.remove()
        }
        function resolveFullThemeName(desiredThemeName) {
            var desiredThemeParts = desiredThemeName.split("."),
                result = null;
            if (knownThemes)
                $.each(knownThemes, function(knownThemeName, themeData) {
                    var knownThemeParts = knownThemeName.split(".");
                    if (knownThemeParts[0] !== desiredThemeParts[0])
                        return;
                    if (desiredThemeParts[1] && desiredThemeParts[1] !== knownThemeParts[1])
                        return;
                    if (!result || themeData.isActive)
                        result = knownThemeName;
                    if (themeData.isActive)
                        return false
                });
            return result
        }
        function initContext(newContext) {
            try {
                if (newContext !== context)
                    knownThemes = null
            }
            catch(x) {
                knownThemes = null
            }
            context = newContext
        }
        function init(options) {
            options = options || {};
            initContext(options.context || document);
            processMarkup();
            currentThemeName = undefined;
            current(options)
        }
        function current(options) {
            if (!arguments.length)
                return currentThemeName || readThemeMarker();
            detachCssClasses(DX.viewPort(), currentThemeName);
            options = options || {};
            if (typeof options === "string")
                options = {theme: options};
            var isAutoInit = options._autoInit,
                loadCallback = options.loadCallback,
                currentThemeData;
            currentThemeName = options.theme || currentThemeName;
            if (isAutoInit && !currentThemeName)
                currentThemeName = themeNameFromDevice(DX.devices.current());
            currentThemeName = resolveFullThemeName(currentThemeName);
            if (currentThemeName)
                currentThemeData = knownThemes[currentThemeName];
            if (currentThemeData) {
                $activeThemeLink.removeAttr("href");
                $activeThemeLink.attr("href", knownThemes[currentThemeName].url);
                if (loadCallback)
                    waitForThemeLoad(currentThemeName, loadCallback);
                else if (pendingThemeName)
                    pendingThemeName = currentThemeName
            }
            else if (isAutoInit) {
                if (loadCallback)
                    loadCallback()
            }
            else
                throw DX.Error("E0021", currentThemeName);
            attachCssClasses(DX.viewPort(), currentThemeName)
        }
        function themeNameFromDevice(device) {
            var themeName = device.platform,
                majorVersion = device.version && device.version[0];
            if (themeName === "ios" && (!majorVersion || majorVersion > 6))
                themeName += "7";
            if (themeName === "android" && (!majorVersion || majorVersion > 4))
                themeName += "5";
            return themeName
        }
        function getCssClasses(themeName) {
            themeName = themeName || current();
            var result = [],
                themeNameParts = themeName && themeName.split(".");
            if (themeNameParts) {
                result.push("dx-theme-" + themeNameParts[0], "dx-theme-" + themeNameParts[0] + "-typography");
                if (themeNameParts.length > 1)
                    result.push("dx-color-scheme-" + themeNameParts[1])
            }
            return result
        }
        function attachCssClasses(element, themeName) {
            $(element).addClass(getCssClasses(themeName).join(" "))
        }
        function detachCssClasses(element, themeName) {
            $(element).removeClass(getCssClasses(themeName).join(" "))
        }
        $.holdReady(true);
        init({
            _autoInit: true,
            loadCallback: function() {
                $.holdReady(false)
            }
        });
        $(function() {
            if ($(DX_LINK_SELECTOR, context).length)
                throw DX.Error("E0022");
        });
        DX.viewPortChanged.add(function(viewPort, prevViewPort) {
            detachCssClasses(prevViewPort);
            attachCssClasses(viewPort)
        });
        DX.ui.themes = {
            init: init,
            current: current,
            attachCssClasses: attachCssClasses,
            detachCssClasses: detachCssClasses
        };
        DX.ui.themes.__internals = {
            themeNameFromDevice: themeNameFromDevice,
            waitForThemeLoad: waitForThemeLoad,
            resetTheme: function() {
                $activeThemeLink.attr("href", "about:blank");
                currentThemeName = null;
                pendingThemeName = null
            }
        }
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            eventNS = $.event,
            hooksNS = eventNS.fixHooks,
            specialNS = eventNS.special,
            EVENT_SOURCES_REGEX = {
                dx: /^dx/i,
                mouse: /(mouse|wheel)/i,
                touch: /^touch/i,
                keyboard: /^key/i,
                pointer: /^(ms)?pointer/i
            };
        var eventSource = function(e) {
                var result = "other";
                $.each(EVENT_SOURCES_REGEX, function(key) {
                    if (this.test(e.type)) {
                        result = key;
                        return false
                    }
                });
                return result
            };
        var isDxEvent = function(e) {
                return eventSource(e) === "dx"
            };
        var isNativeMouseEvent = function(e) {
                return eventSource(e) === "mouse"
            };
        var isNativeTouchEvent = function(e) {
                return eventSource(e) === "touch"
            };
        var isPointerEvent = function(e) {
                return eventSource(e) === "pointer"
            };
        var isMouseEvent = function(e) {
                return isNativeMouseEvent(e) || (isPointerEvent(e) || isDxEvent(e)) && e.pointerType === "mouse"
            };
        var isTouchEvent = function(e) {
                return isNativeTouchEvent(e) || (isPointerEvent(e) || isDxEvent(e)) && e.pointerType === "touch"
            };
        var isKeyboardEvent = function(e) {
                return eventSource(e) === "keyboard"
            };
        var eventData = function(e) {
                return {
                        x: e.pageX,
                        y: e.pageY,
                        time: e.timeStamp
                    }
            };
        var eventDelta = function(from, to) {
                return {
                        x: to.x - from.x,
                        y: to.y - from.y,
                        time: to.time - from.time || 1
                    }
            };
        var hasTouches = function(e) {
                if (isNativeTouchEvent(e))
                    return (e.originalEvent.touches || []).length;
                if (isDxEvent(e))
                    return (e.pointers || []).length;
                return 0
            };
        var needSkipEvent = function(e) {
                var $target = $(e.target),
                    touchInInput = $target.is("input, textarea, select");
                if (isMouseEvent(e))
                    return touchInInput || e.which > 1;
                if (isTouchEvent(e))
                    return touchInInput && $target.is(":focus")
            };
        var createEvent = function(originalEvent, args) {
                var event = $.Event(originalEvent),
                    fixHook = hooksNS[originalEvent.type] || eventNS.mouseHooks;
                var props = fixHook.props ? eventNS.props.concat(fixHook.props) : eventNS.props,
                    propIndex = props.length;
                while (propIndex--) {
                    var prop = props[propIndex];
                    event[prop] = originalEvent[prop]
                }
                if (args)
                    $.extend(event, args);
                return fixHook.filter ? fixHook.filter(event, originalEvent) : event
            };
        var fireEvent = function(props) {
                var event = createEvent(props.originalEvent, props);
                eventNS.trigger(event, null, props.delegateTarget || event.target);
                return event
            };
        var addNamespace = function(eventNames, namespace) {
                if (!namespace)
                    throw DX.Error("E0017");
                if (typeof eventNames === "string")
                    return addNamespace(eventNames.split(/\s+/g), namespace);
                $.each(eventNames, function(index, eventName) {
                    eventNames[index] = eventName + "." + namespace
                });
                return eventNames.join(" ")
            };
        var dxEventHook = {props: eventNS.mouseHooks.props.concat(["pointerType", "pointerId", "pointers"])};
        var registerEvent = function(eventName, eventObject) {
                var strategy = {};
                if ("noBubble" in eventObject)
                    strategy.noBubble = eventObject.noBubble;
                if ("bindType" in eventObject)
                    strategy.bindType = eventObject.bindType;
                if ("delegateType" in eventObject)
                    strategy.delegateType = eventObject.delegateType;
                $.each(["setup", "teardown", "add", "remove", "trigger", "handle", "_default", "dispose"], function(_, methodName) {
                    if (!eventObject[methodName])
                        return;
                    strategy[methodName] = function() {
                        var args = $.makeArray(arguments);
                        args.unshift(this);
                        return eventObject[methodName].apply(eventObject, args)
                    }
                });
                hooksNS[eventName] = dxEventHook;
                specialNS[eventName] = strategy
            };
        ui.events = {
            eventSource: eventSource,
            isPointerEvent: isPointerEvent,
            isMouseEvent: isMouseEvent,
            isTouchEvent: isTouchEvent,
            isKeyboardEvent: isKeyboardEvent,
            hasTouches: hasTouches,
            eventData: eventData,
            eventDelta: eventDelta,
            needSkipEvent: needSkipEvent,
            createEvent: createEvent,
            fireEvent: fireEvent,
            addNamespace: addNamespace,
            registerEvent: registerEvent
        }
    })(jQuery, DevExpress);
    /*! Module core, file ko.events.js */
    (function($, DX, undefined) {
        if (!DX.support.hasKo)
            return;
        var ko = window.ko,
            events = DX.ui.events;
        var originalRegisterEvent = events.registerEvent;
        var registerKoEvent = function(eventName, eventObject) {
                originalRegisterEvent(eventName, eventObject);
                var koBindingEventName = events.addNamespace(eventName, eventName + "Binding");
                ko.bindingHandlers[eventName] = {update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                        var $element = $(element),
                            unwrappedValue = ko.utils.unwrapObservable(valueAccessor()),
                            eventSource = unwrappedValue.execute ? unwrappedValue.execute : unwrappedValue;
                        $element.off(koBindingEventName).on(koBindingEventName, $.isPlainObject(unwrappedValue) ? unwrappedValue : {}, function(e) {
                            eventSource.call(viewModel, viewModel, e)
                        })
                    }}
            };
        $.extend(events, {registerEvent: registerKoEvent})
    })(jQuery, DevExpress);
    /*! Module core, file ng.events.js */
    (function($, DX, undefined) {
        if (!DX.support.hasNg)
            return;
        var events = DX.ui.events;
        var originalRegisterEvent = events.registerEvent;
        var registerNgEvent = function(eventName, eventObject) {
                originalRegisterEvent(eventName, eventObject);
                var ngEventName = eventName.slice(0, 2) + eventName.charAt(2).toUpperCase() + eventName.slice(3);
                DX.ng.module.directive(ngEventName, ['$parse', function($parse) {
                        return function(scope, element, attr) {
                                var attrValue = $.trim(attr[ngEventName]),
                                    handler,
                                    eventOptions = {};
                                if (attrValue.charAt(0) === "{") {
                                    eventOptions = scope.$eval(attrValue);
                                    handler = $parse(eventOptions.execute)
                                }
                                else
                                    handler = $parse(attr[ngEventName]);
                                element.on(eventName, eventOptions, function(e) {
                                    scope.$apply(function() {
                                        handler(scope, {$event: e})
                                    })
                                })
                            }
                    }])
            };
        $.extend(events, {registerEvent: registerNgEvent})
    })(jQuery, DevExpress);
    /*! Module core, file ui.keyboardProcessor.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        ui.KeyboardProcessor = DX.Class.inherit({
            _keydown: events.addNamespace("keydown", "KeyboardProcessor"),
            codes: {
                "8": "backspace",
                "9": "tab",
                "13": "enter",
                "27": "escape",
                "33": "pageUp",
                "34": "pageDown",
                "35": "end",
                "36": "home",
                "37": "leftArrow",
                "38": "upArrow",
                "39": "rightArrow",
                "40": "downArrow",
                "32": "space",
                "70": "F",
                "65": "A"
            },
            ctor: function(options) {
                var _this = this;
                options = options || {};
                if (options.element)
                    this._element = $(options.element);
                this._handler = options.handler;
                this._context = options.context;
                this._childProcessors = [];
                if (this._element)
                    this._element.on(this._keydown, function(e) {
                        _this.process(e)
                    })
            },
            dispose: function() {
                if (this._element)
                    this._element.off(this._keydown);
                this._element = undefined;
                this._handler = undefined;
                this._context = undefined;
                this._childProcessors = undefined
            },
            push: function(child) {
                if (!this._childProcessors)
                    this._childProcessors = [];
                this._childProcessors.push(child);
                return child
            },
            attachChildProcessor: function() {
                var childProcessor = new ui.KeyboardProcessor;
                this._childProcessors.push(childProcessor);
                return childProcessor
            },
            reinitialize: function(childHandler, childContext) {
                this._context = childContext;
                this._handler = childHandler;
                return this
            },
            process: function(e) {
                var args = {
                        key: this.codes[e.which],
                        ctrl: e.ctrlKey,
                        shift: e.shiftKey,
                        alt: e.altKey,
                        originalEvent: e
                    };
                if (this.codes[e.which] && this._handler && this._handler.call(this._context, args) && this._childProcessors)
                    $.each(this._childProcessors, function(index, childProcessor) {
                        childProcessor.process(e)
                    })
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.dialog.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils;
        var DEFAULT_BUTTON = {
                text: "OK",
                onClick: function() {
                    return true
                }
            };
        var DX_DIALOG_CLASSNAME = "dx-dialog",
            DX_DIALOG_WRAPPER_CLASSNAME = DX_DIALOG_CLASSNAME + "-wrapper",
            DX_DIALOG_ROOT_CLASSNAME = DX_DIALOG_CLASSNAME + "-root",
            DX_DIALOG_CONTENT_CLASSNAME = DX_DIALOG_CLASSNAME + "-content",
            DX_DIALOG_MESSAGE_CLASSNAME = DX_DIALOG_CLASSNAME + "-message",
            DX_DIALOG_BUTTONS_CLASSNAME = DX_DIALOG_CLASSNAME + "-buttons",
            DX_DIALOG_BUTTON_CLASSNAME = DX_DIALOG_CLASSNAME + "-button";
        var FakeDialogComponent = DX.Component.inherit({
                NAME: "dxDialog",
                ctor: function(element, options) {
                    this.callBase(options)
                },
                _defaultOptionsRules: function() {
                    return this.callBase().concat([{
                                device: {platform: "ios"},
                                options: {width: 276}
                            }, {
                                device: {platform: "android"},
                                options: {
                                    lWidth: "60%",
                                    pWidth: "80%"
                                }
                            }, {
                                device: {
                                    platform: "win8",
                                    phone: false
                                },
                                options: {width: function() {
                                        return $(window).width()
                                    }}
                            }, {
                                device: {
                                    platform: "win8",
                                    phone: true
                                },
                                options: {position: {
                                        my: "top center",
                                        at: "top center",
                                        of: window,
                                        offset: "0 0"
                                    }}
                            }])
                }
            });
        var dialog = function(options) {
                if (!ui.dxPopup)
                    throw DX.Error("E0018");
                var deferred = $.Deferred();
                var defaultOptions = (new FakeDialogComponent).option();
                options = $.extend(defaultOptions, options);
                var $element = $("<div>").addClass(DX_DIALOG_CLASSNAME).appendTo(DX.viewPort());
                var $message = $("<div>").addClass(DX_DIALOG_MESSAGE_CLASSNAME).html(String(options.message));
                var $buttons = $("<div>").addClass(DX_DIALOG_BUTTONS_CLASSNAME);
                var popupInstance = $element.dxPopup({
                        title: options.title || this.title,
                        height: "auto",
                        width: function() {
                            var isPortrait = $(window).height() > $(window).width(),
                                key = (isPortrait ? "p" : "l") + "Width",
                                widthOption = options.hasOwnProperty(key) ? options[key] : options["width"];
                            return $.isFunction(widthOption) ? widthOption() : widthOption
                        },
                        focusStateEnabled: false,
                        onContentReady: function(args) {
                            args.component.content().addClass(DX_DIALOG_CONTENT_CLASSNAME).append($message).append($buttons)
                        },
                        onShown: function() {
                            $buttons.children().first().focus()
                        },
                        animation: {
                            show: {
                                type: "pop",
                                duration: 400
                            },
                            hide: {
                                type: "pop",
                                duration: 400,
                                to: {
                                    opacity: 0,
                                    scale: 0
                                },
                                from: {
                                    opacity: 1,
                                    scale: 1
                                }
                            }
                        },
                        rtlEnabled: DX.rtlEnabled
                    }).dxPopup("instance");
                popupInstance._wrapper().addClass(DX_DIALOG_WRAPPER_CLASSNAME);
                if (options.position)
                    popupInstance.option("position", options.position);
                $.each(options.buttons || [$.extend({}, DEFAULT_BUTTON)], function(_, buttonConfig) {
                    var $button = $("<div>").addClass(DX_DIALOG_BUTTON_CLASSNAME).appendTo($buttons);
                    if (buttonConfig.clickAction) {
                        DX.log("W0001", "Dialog", "clickAction", "14.2", "Use 'onClick' option instead");
                        buttonConfig.onClick = buttonConfig.clickAction
                    }
                    var clickHandler = buttonConfig.onClick;
                    $button.dxButton($.extend(buttonConfig, {onClick: function() {
                            var action = new DX.Action(clickHandler, {context: popupInstance});
                            var result = action.execute(arguments);
                            hide(result)
                        }}))
                });
                popupInstance._wrapper().addClass(DX_DIALOG_ROOT_CLASSNAME);
                function show() {
                    popupInstance.show();
                    utils.resetActiveElement();
                    return deferred.promise()
                }
                function hide(value) {
                    popupInstance.hide().done(function() {
                        popupInstance.element().remove()
                    });
                    deferred.resolve(value)
                }
                return {
                        show: show,
                        hide: hide
                    }
            };
        var alert = function(message, title) {
                var dialogInstance,
                    options = $.isPlainObject(message) ? message : {
                        title: title,
                        message: message
                    };
                dialogInstance = ui.dialog.custom(options);
                return dialogInstance.show()
            };
        var confirm = function(message, title) {
                var dialogInstance,
                    options = $.isPlainObject(message) ? message : {
                        title: title,
                        message: message,
                        buttons: [{
                                text: Globalize.localize("Yes"),
                                onClick: function() {
                                    return true
                                }
                            }, {
                                text: Globalize.localize("No"),
                                onClick: function() {
                                    return false
                                }
                            }]
                    };
                dialogInstance = ui.dialog.custom(options);
                return dialogInstance.show()
            };
        var $notify = null;
        var notify = function(message, type, displayTime) {
                var options = $.isPlainObject(message) ? message : {message: message};
                if (!ui.dxToast) {
                    alert(options.message);
                    return
                }
                if (options.hiddenAction) {
                    DX.log("W0001", "Dialog", "hiddenAction", "14.2", "Use 'onHidden' option instead");
                    options.onHidden = options.hiddenAction
                }
                var userHiddenAction = options.onHidden;
                $.extend(options, {
                    type: type,
                    displayTime: displayTime,
                    onHidden: function(args) {
                        args.element.remove();
                        $notify = null;
                        new DX.Action(userHiddenAction, {context: args.model}).execute(arguments)
                    }
                });
                if ($notify) {
                    $notify.remove();
                    $notify = null
                }
                $notify = $("<div>").appendTo(DX.viewPort()).dxToast(options);
                $notify.dxToast("instance").show()
            };
        $.extend(ui, {
            notify: notify,
            dialog: {
                custom: dialog,
                alert: alert,
                confirm: confirm,
                FakeDialogComponent: FakeDialogComponent
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.dataHelper.js */
    (function($, DX, undefined) {
        var data = DX.data;
        var DATA_SOURCE_OPTIONS_METHOD = "_dataSourceOptions",
            DATA_SOURCE_CHANGED_METHOD = "_dataSourceChangedHandler",
            DATA_SOURCE_LOAD_ERROR_METHOD = "_dataSourceLoadErrorHandler",
            DATA_SOURCE_LOADING_CHANGED_METHOD = "_dataSourceLoadingChangedHandler";
        DX.ui.DataHelperMixin = {
            postCtor: function() {
                this.on("disposing", function() {
                    this._disposeDataSource()
                })
            },
            _refreshDataSource: function() {
                this._initDataSource();
                this._loadDataSource()
            },
            _initDataSource: function() {
                var dataSourceOptions = this.option("dataSource"),
                    widgetDataSourceOptions,
                    dataSourceType;
                this._disposeDataSource();
                if (dataSourceOptions) {
                    if (dataSourceOptions instanceof data.DataSource) {
                        this._isSharedDataSource = true;
                        this._dataSource = dataSourceOptions
                    }
                    else {
                        widgetDataSourceOptions = DATA_SOURCE_OPTIONS_METHOD in this ? this[DATA_SOURCE_OPTIONS_METHOD]() : {};
                        dataSourceType = this._dataSourceType ? this._dataSourceType() : data.DataSource;
                        this._dataSource = new dataSourceType($.extend(true, {}, widgetDataSourceOptions, data.utils.normalizeDataSourceOptions(dataSourceOptions)))
                    }
                    this._addDataSourceHandlers()
                }
            },
            _addDataSourceHandlers: function() {
                if (DATA_SOURCE_CHANGED_METHOD in this)
                    this._addDataSourceChangeHandler();
                if (DATA_SOURCE_LOAD_ERROR_METHOD in this)
                    this._addDataSourceLoadErrorHandler();
                if (DATA_SOURCE_LOADING_CHANGED_METHOD in this)
                    this._addDataSourceLoadingChangedHandler()
            },
            _addDataSourceChangeHandler: function() {
                var dataSource = this._dataSource;
                this._proxiedDataSourceChangedHandler = $.proxy(function() {
                    this[DATA_SOURCE_CHANGED_METHOD](dataSource.items())
                }, this);
                dataSource.on("changed", this._proxiedDataSourceChangedHandler)
            },
            _addDataSourceLoadErrorHandler: function() {
                this._proxiedDataSourceLoadErrorHandler = $.proxy(this[DATA_SOURCE_LOAD_ERROR_METHOD], this);
                this._dataSource.on("loadError", this._proxiedDataSourceLoadErrorHandler)
            },
            _addDataSourceLoadingChangedHandler: function() {
                this._proxiedDataSourceLoadingChangedHandler = $.proxy(this[DATA_SOURCE_LOADING_CHANGED_METHOD], this);
                this._dataSource.on("loadingChanged", this._proxiedDataSourceLoadingChangedHandler)
            },
            _loadDataSource: function() {
                if (this._dataSource) {
                    var dataSource = this._dataSource;
                    if (dataSource.isLoaded())
                        this._proxiedDataSourceChangedHandler && this._proxiedDataSourceChangedHandler();
                    else
                        dataSource.load()
                }
            },
            _loadSingle: function(key, value) {
                key = key === "this" ? this._dataSource.key() || "this" : key;
                return this._dataSource.loadSingle(key, value)
            },
            _disposeDataSource: function() {
                if (this._dataSource) {
                    if (this._isSharedDataSource) {
                        delete this._isSharedDataSource;
                        this._dataSource.off("changed", this._proxiedDataSourceChangedHandler);
                        this._dataSource.off("loadError", this._proxiedDataSourceLoadErrorHandler);
                        this._dataSource.off("loadingChanged", this._proxiedDataSourceLoadingChangedHandler)
                    }
                    else
                        this._dataSource.dispose();
                    delete this._dataSource;
                    delete this._proxiedDataSourceChangedHandler;
                    delete this._proxiedDataSourceLoadErrorHandler;
                    delete this._proxiedDataSourceLoadingChangedHandler
                }
            }
        }
    })(jQuery, DevExpress);
    /*! Module core, file ui.dataExpression.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils;
        ui.DataExpressionMixin = $.extend(ui.DataHelperMixin, {
            _dataExpressionDeprecatedOptions: function() {
                return {itemRender: {
                            since: "14.2",
                            alias: "itemTemplate"
                        }}
            },
            _dataExpressionDefaultOptions: function() {
                return {
                        items: [],
                        dataSource: null,
                        itemTemplate: "item",
                        value: undefined,
                        valueExpr: "this",
                        displayExpr: undefined
                    }
            },
            _initDataExpressions: function() {
                this._compileValueGetter();
                this._compileDisplayGetter();
                this._initDynamicTemplates();
                this._initDataSource();
                this._itemsToDataSource()
            },
            _itemsToDataSource: function() {
                if (!this.option("dataSource"))
                    this._dataSource = new DevExpress.data.DataSource({
                        store: new DevExpress.data.ArrayStore(this.option("items")),
                        pageSize: 0
                    })
            },
            _compileDisplayGetter: function() {
                this._displayGetter = DX.data.utils.compileGetter(this.option("displayExpr"))
            },
            _compileValueGetter: function() {
                this._valueGetter = DX.data.utils.compileGetter(this._valueGetterExpr())
            },
            _valueGetterExpr: function() {
                return this.option("valueExpr") || "this"
            },
            _loadValue: function(value) {
                var deferred = $.Deferred();
                value = this._unwrappedValue(value);
                if (!utils.isDefined(value))
                    return deferred.reject().promise();
                this._loadSingle(this._valueGetterExpr(), value).done($.proxy(function(item) {
                    this._valueEquals(this._valueGetter(item), value) ? deferred.resolve(item) : deferred.reject()
                }, this)).fail(function() {
                    deferred.reject()
                });
                return deferred.promise()
            },
            _unwrappedValue: function(value) {
                value = DX.utils.isDefined(value) ? value : this.option("value");
                if (this._dataSource && this._valueGetterExpr() === "this") {
                    var key = this._dataSource.key();
                    if (key && typeof value === "object")
                        value = value[key]
                }
                return utils.unwrapObservable(value)
            },
            _valueEquals: function(value1, value2) {
                var dataSourceKey = this._dataSource && this._dataSource.key();
                var result = value1 === value2;
                if (!result && value1 && value2 && dataSourceKey) {
                    var valueKey1 = utils.unwrapObservable(value1[dataSourceKey]) || value1;
                    var valueKey2 = utils.unwrapObservable(value2[dataSourceKey]) || value2;
                    result = valueKey1 === valueKey2
                }
                return result
            },
            _initDynamicTemplates: function() {
                if (this.option("displayExpr"))
                    this._dynamicTemplates["item"] = new ui.DefaultTemplate($.proxy(function(data) {
                        return this._displayGetter(data)
                    }, this));
                else
                    delete this._dynamicTemplates["item"]
            },
            _setCollectionWidgetItemTemplate: function() {
                this._initDynamicTemplates();
                this._setCollectionWidgetOption("itemTemplate", this._getTemplateByOption("itemTemplate"))
            },
            _dataExpressionOptionChanged: function(args) {
                switch (args.name) {
                    case"items":
                        this._itemsToDataSource();
                        this._setCollectionWidgetOption("items");
                        break;
                    case"dataSource":
                        this._initDataSource();
                        break;
                    case"itemTemplate":
                        this._setCollectionWidgetItemTemplate();
                        break;
                    case"valueExpr":
                        this._compileValueGetter();
                        break;
                    case"displayExpr":
                        this._compileDisplayGetter();
                        this._setCollectionWidgetItemTemplate();
                        break
                }
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.pointer.touchHooks.js */
    (function($, DX, undefined) {
        var touchEventHook = {
                filter: function(event, originalEvent) {
                    var touches = originalEvent.touches.length ? originalEvent.touches : originalEvent.changedTouches;
                    $.each(["pageX", "pageY", "screenX", "screenY", "clientX", "clientY"], function() {
                        event[this] = touches[0][this]
                    });
                    return event
                },
                props: $.event.mouseHooks.props.concat(["touches", "changedTouches", "targetTouches", "detail", "result", "originalTarget", "charCode", "prevValue"])
            };
        $.each(["touchstart", "touchmove", "touchend", "touchcancel"], function() {
            $.event.fixHooks[this] = touchEventHook
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.pointer.mspointerHooks.js */
    (function($, DX, undefined) {
        var POINTER_TYPE_MAP = {
                2: "touch",
                3: "pen",
                4: "mouse"
            };
        var pointerEventHook = {
                filter: function(event, originalEvent) {
                    var pointerType = originalEvent.pointerType;
                    if ($.isNumeric(pointerType))
                        event.pointerType = POINTER_TYPE_MAP[pointerType];
                    return event
                },
                props: $.event.mouseHooks.props.concat(["pointerId", "pointerType", "originalTarget", "width", "height", "pressure", "result", "tiltX", "charCode", "tiltY", "detail", "isPrimary", "prevValue"])
            };
        $.each(["MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel", "MSPointerOver", "MSPointerOut", "mouseenter", "mouseleave", "pointerdown", "pointermove", "pointerup", "pointercancel", "pointerover", "pointerout", "pointerenter", "pointerleave"], function() {
            $.event.fixHooks[this] = pointerEventHook
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.pointer.base.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var POINTER_EVENTS_NAMESPACE = "dxPointerEvents";
        var BaseStrategy = DX.Class.inherit({
                ctor: function(eventName, originalEvents) {
                    this._eventName = eventName;
                    this._eventNamespace = [POINTER_EVENTS_NAMESPACE, ".", this._eventName].join("");
                    this._originalEvents = originalEvents;
                    this._handlerCount = 0;
                    this.noBubble = this._isNoBubble()
                },
                _isNoBubble: function() {
                    var eventName = this._eventName;
                    return eventName === "dxpointerenter" || eventName === "dxpointerleave"
                },
                _handler: function(e) {
                    var delegateTarget = this._getDelegateTarget(e);
                    return this._fireEvent({
                            type: this._eventName,
                            pointerType: e.pointerType || events.eventSource(e),
                            originalEvent: e,
                            delegateTarget: delegateTarget
                        })
                },
                _getDelegateTarget: function(e) {
                    var delegateTarget = undefined;
                    if (this.noBubble)
                        delegateTarget = e.delegateTarget;
                    return delegateTarget
                },
                _fireEvent: function(args) {
                    return events.fireEvent(args)
                },
                add: function(element, handleObj) {
                    if (this._handlerCount <= 0 || this.noBubble) {
                        this._selector = handleObj.selector;
                        element = this.noBubble ? element : document;
                        $(element).on(events.addNamespace(this._originalEvents, this._eventNamespace), this._selector, $.proxy(this._handler, this))
                    }
                    if (!this.noBubble)
                        this._handlerCount++
                },
                remove: function(element) {
                    if (!this.noBubble)
                        this._handlerCount--
                },
                teardown: function(element) {
                    if (this._handlerCount && !this.noBubble)
                        return;
                    element = this.noBubble ? element : document;
                    $(element).off("." + this._eventNamespace, this._selector)
                },
                dispose: function(element) {
                    element = this.noBubble ? element : document;
                    $(element).off("." + this._eventNamespace)
                }
            });
        events.pointer = {};
        events.pointer.BaseStrategy = BaseStrategy
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.pointer.mouse.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            pointer = events.pointer;
        var MouseStrategyEventMap = {
                dxpointerdown: "mousedown",
                dxpointermove: "mousemove",
                dxpointerup: "mouseup",
                dxpointercancel: "",
                dxpointerover: "mouseover",
                dxpointerout: "mouseout",
                dxpointerenter: "mouseenter",
                dxpointerleave: "mouseleave"
            };
        var normalizeMouseEvent = function(e) {
                var pointers = [];
                e.pointerId = 1;
                if (e.type !== "mouseup")
                    pointers.push(e);
                return {
                        pointers: pointers,
                        pointerId: 1
                    }
            };
        var MouseStrategy = pointer.BaseStrategy.inherit({_fireEvent: function(args) {
                    return this.callBase($.extend(normalizeMouseEvent(args.originalEvent), args))
                }});
        pointer.mouse = {
            strategy: MouseStrategy,
            map: MouseStrategyEventMap,
            normalize: normalizeMouseEvent
        }
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.pointer.touch.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            device = $.proxy(DX.devices.real, DX.devices),
            events = ui.events,
            pointer = events.pointer;
        var TouchStrategyEventMap = {
                dxpointerdown: "touchstart",
                dxpointermove: "touchmove",
                dxpointerup: "touchend",
                dxpointercancel: "touchcancel"
            };
        var normalizeTouchEvent = function(e) {
                var pointers = [];
                $.each(e.touches, function(_, touch) {
                    pointers.push($.extend({pointerId: touch.identifier}, touch))
                });
                return {
                        pointers: pointers,
                        pointerId: e.changedTouches[0].identifier
                    }
            };
        var skipTouchWithSameIdentifier = function(pointerEvent) {
                return device().platform === "ios" && (pointerEvent === "dxpointerdown" || pointerEvent === "dxpointerup")
            };
        var TouchStrategy = pointer.BaseStrategy.inherit({
                ctor: function() {
                    this.callBase.apply(this, arguments);
                    this._pointerId = 0
                },
                _handler: function(e) {
                    if (skipTouchWithSameIdentifier(this._eventName)) {
                        var touch = e.changedTouches[0];
                        if (this._pointerId === touch.identifier && this._pointerId !== 0)
                            return;
                        this._pointerId = touch.identifier
                    }
                    return this.callBase.apply(this, arguments)
                },
                _fireEvent: function(args) {
                    return this.callBase($.extend(normalizeTouchEvent(args.originalEvent), args))
                }
            });
        pointer.touch = {
            strategy: TouchStrategy,
            map: TouchStrategyEventMap,
            normalize: normalizeTouchEvent
        }
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.pointer.mouseAndTouch.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            pointer = events.pointer;
        var MouseAndTouchStrategyEventMap = {
                dxpointerdown: "touchstart mousedown",
                dxpointermove: "touchmove mousemove",
                dxpointerup: "touchend mouseup",
                dxpointercancel: "touchcancel",
                dxpointerover: "mouseover",
                dxpointerout: "mouseout",
                dxpointerenter: "mouseenter",
                dxpointerleave: "mouseleave"
            };
        var MouseAndTouchStrategy = pointer.BaseStrategy.inherit({
                EVENT_LOCK_TIMEOUT: 100,
                _handler: function(e) {
                    var isMouseEvent = events.isMouseEvent(e);
                    if (!isMouseEvent)
                        this._skipNextEvents = true;
                    if (isMouseEvent && this._mouseLocked)
                        return;
                    if (isMouseEvent && this._skipNextEvents) {
                        this._skipNextEvents = false;
                        this._mouseLocked = true;
                        clearTimeout(this._unlockMouseTimer);
                        this._unlockMouseTimer = setTimeout($.proxy(function() {
                            this._mouseLocked = false
                        }, this), this.EVENT_LOCK_TIMEOUT);
                        return
                    }
                    return this.callBase(e)
                },
                _fireEvent: function(args) {
                    var isMouseEvent = events.isMouseEvent(args.originalEvent),
                        normalizer = isMouseEvent ? pointer.mouse.normalize : pointer.touch.normalize;
                    return this.callBase($.extend(normalizer(args.originalEvent), args))
                },
                dispose: function() {
                    this.callBase();
                    this._skipNextEvents = false;
                    this._mouseLocked = false;
                    clearTimeout(this._unlockMouseTimer)
                }
            });
        pointer.mouseAndTouch = {
            strategy: MouseAndTouchStrategy,
            map: MouseAndTouchStrategyEventMap
        }
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.pointer.mspointer.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            support = DX.support,
            events = ui.events,
            pointer = events.pointer;
        var MsPointerStrategyEventMap = {
                dxpointerdown: "MSPointerDown pointerdown",
                dxpointermove: "MSPointerMove pointermove",
                dxpointerup: "MSPointerUp pointerup",
                dxpointercancel: "MSPointerCancel pointercancel",
                dxpointerover: "MSPointerOver pointerover",
                dxpointerout: "MSPointerOut pointerout",
                dxpointerenter: "mouseenter pointerenter",
                dxpointerleave: "mouseleave pointerleave"
            };
        var pointers = [];
        var getPointerIndex = function(e) {
                var index = -1;
                $.each(pointers, function(i, pointer) {
                    if (e.pointerId == pointer.pointerId) {
                        index = i;
                        return true
                    }
                });
                return index
            };
        var addPointer = function(e) {
                if (getPointerIndex(e) === -1)
                    pointers.push(e)
            };
        var removePointer = function(e) {
                pointers.splice(getPointerIndex(e), 1)
            };
        var updatePointer = function(e) {
                pointers[getPointerIndex(e)] = e
            };
        var addEventsListner = function(events, handler) {
                events = events.split(" ");
                $.each(events, function(_, event) {
                    document.addEventListener(event, handler, true)
                })
            };
        var activateMspointerStrategy = function() {
                var eventMap = MsPointerStrategyEventMap;
                addEventsListner(eventMap.dxpointerdown, addPointer);
                addEventsListner(eventMap.dxpointermove, updatePointer);
                addEventsListner(eventMap.dxpointerup, removePointer);
                addEventsListner(eventMap.dxpointercancel, removePointer);
                activateMspointerStrategy = $.noop
            };
        var MsPointerStrategy = pointer.BaseStrategy.inherit({
                ctor: function() {
                    this.callBase.apply(this, arguments);
                    activateMspointerStrategy()
                },
                _fireEvent: function(args) {
                    return this.callBase($.extend({
                            pointers: pointers,
                            pointerId: args.originalEvent.pointerId
                        }, args))
                }
            });
        pointer.msPointer = {
            strategy: MsPointerStrategy,
            map: MsPointerStrategyEventMap
        };
        DX.ui.events.__internals = DX.ui.events.__internals || {};
        $.extend(DX.ui.events.__internals, {cleanMsPointers: function() {
                pointers = []
            }})
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.pointer.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            support = DX.support,
            device = $.proxy(DX.devices.real, DX.devices),
            events = ui.events,
            pointer = events.pointer;
        var eventType = function() {
                if (support.touch && !(device().tablet || device().phone))
                    return pointer.mouseAndTouch;
                if (support.pointer)
                    return pointer.msPointer;
                if (support.touch)
                    return pointer.touch;
                return pointer.mouse
            }();
        $.each(eventType.map, function(pointerEvent, originalEvents) {
            events.registerEvent(pointerEvent, new eventType.strategy(pointerEvent, originalEvents))
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.wheel.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var EVENT_NAME = "dxmousewheel",
            EVENT_NAMESPACE = "dxWheel";
        var WHEEL_DISTANCE = 10;
        $.event.fixHooks["wheel"] = $.event.mouseHooks;
        var wheelEvent = document.onmousewheel !== undefined ? "mousewheel" : "wheel";
        var wheel = {
                setup: function(element, data) {
                    var $element = $(element);
                    $element.on(events.addNamespace(wheelEvent, EVENT_NAMESPACE), $.proxy(wheel._wheelHandler, wheel))
                },
                teardown: function(element) {
                    var $element = $(element);
                    $element.off("." + EVENT_NAMESPACE)
                },
                _wheelHandler: function(e) {
                    var delta = this._getWheelDelta(e.originalEvent);
                    events.fireEvent({
                        type: EVENT_NAME,
                        originalEvent: e,
                        delta: delta
                    });
                    e.stopPropagation()
                },
                _getWheelDelta: function(event) {
                    return event.wheelDelta / 60 || -event.deltaY
                }
            };
        events.registerEvent(EVENT_NAME, wheel)
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.hover.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var HOVERSTART_NAMESPACE = "dxHoverStart",
            HOVERSTART = "dxhoverstart",
            POINTERENTER_NAMESPACED_EVENT_NAME = events.addNamespace("dxpointerenter", HOVERSTART_NAMESPACE),
            HOVEREND_NAMESPACE = "dxHoverEnd",
            HOVEREND = "dxhoverend",
            POINTERLEAVE_NAMESPACED_EVENT_NAME = events.addNamespace("dxpointerleave", HOVEREND_NAMESPACE);
        var Hover = DX.Class.inherit({
                noBubble: true,
                add: function(element, handleObj) {
                    var $element = $(element);
                    $element.off("." + this._namespace).on(this._originalEventName, handleObj.selector, $.proxy(this._handler, this))
                },
                _handler: function(e) {
                    if (events.isTouchEvent(e))
                        return;
                    events.fireEvent({
                        type: this._eventName,
                        originalEvent: e,
                        delegateTarget: e.delegateTarget
                    })
                },
                teardown: function(element) {
                    $(element).off("." + this._namespace)
                }
            });
        var HoverStart = Hover.inherit({ctor: function() {
                    this._eventName = HOVERSTART;
                    this._originalEventName = POINTERENTER_NAMESPACED_EVENT_NAME;
                    this._namespace = HOVERSTART_NAMESPACE
                }});
        var HoverEnd = Hover.inherit({ctor: function() {
                    this._eventName = HOVEREND;
                    this._originalEventName = POINTERLEAVE_NAMESPACED_EVENT_NAME;
                    this._namespace = HOVEREND_NAMESPACE
                }});
        events.registerEvent(HOVERSTART, new HoverStart);
        events.registerEvent(HOVEREND, new HoverEnd)
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.manager.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils,
            abs = Math.abs;
        var MANAGER_EVENT = "dxEventManager",
            EMITTER_DATA = "dxEmitter";
        var EventManager = DX.Class.inherit({
                ctor: function() {
                    this._attachHandlers();
                    this.reset()
                },
                _attachHandlers: function() {
                    $(document).on(events.addNamespace("dxpointerdown", MANAGER_EVENT), $.proxy(this._pointerDownHandler, this)).on(events.addNamespace("dxpointermove", MANAGER_EVENT), $.proxy(this._pointerMoveHandler, this)).on(events.addNamespace("dxpointerup dxpointercancel", MANAGER_EVENT), $.proxy(this._pointerUpHandler, this)).on(events.addNamespace("dxmousewheel", MANAGER_EVENT), $.proxy(this._mouseWheelHandler, this))
                },
                _eachEmitter: function(callback) {
                    var activeEmitters = this._activeEmitters || [];
                    var i = 0;
                    while (activeEmitters.length > i) {
                        var emitter = activeEmitters[i];
                        if (callback(emitter) === false)
                            break;
                        if (activeEmitters[i] === emitter)
                            i++
                    }
                },
                _applyToEmitters: function(method) {
                    var args = $.makeArray(arguments).slice(1);
                    this._eachEmitter(function(emitter) {
                        emitter[method].apply(emitter, args)
                    })
                },
                reset: function() {
                    this._eachEmitter($.proxy(this._cancelEmitter, this));
                    this._activeEmitters = []
                },
                _pointerDownHandler: function(e) {
                    if (events.isMouseEvent(e) && e.which > 1)
                        return;
                    this._updateEmitters(e)
                },
                _updateEmitters: function(e) {
                    if (!this._isSetChanged(e))
                        return;
                    this._cleanEmitters(e);
                    this._fetchEmitters(e)
                },
                _isSetChanged: function(e) {
                    var currentSet = this._closestEmitter(e);
                    var previousSet = this._emittersSet || [];
                    var setChanged = currentSet.length !== previousSet.length;
                    $.each(currentSet, function(index, emitter) {
                        setChanged = setChanged || previousSet[index] !== emitter;
                        return !setChanged
                    });
                    this._emittersSet = currentSet;
                    return setChanged
                },
                _closestEmitter: function(e) {
                    var result = [],
                        $element = $(e.target),
                        touchesCount = events.hasTouches(e);
                    while ($element.length) {
                        var emitters = $element.data(EMITTER_DATA) || [];
                        $.each(emitters, $.proxy(function(_, emitter) {
                            if (!!emitter && emitter.validatePointers(e) && emitter.validate(e)) {
                                emitter.addCancelCallback($.proxy(this._cancelHandler, this, emitter));
                                emitter.addAcceptCallback($.proxy(this._acceptHandler, this, emitter));
                                result.push(emitter)
                            }
                        }, this));
                        $element = $element.parent()
                    }
                    return result
                },
                _acceptHandler: function(acceptedEmitter, e) {
                    var that = this;
                    this._eachEmitter(function(emitter) {
                        if (emitter !== acceptedEmitter)
                            that._cancelEmitter(emitter, e)
                    })
                },
                _cancelHandler: function(canceledEmitter, e) {
                    this._cancelEmitter(canceledEmitter, e)
                },
                _cancelEmitter: function(emitter, event) {
                    var activeEmitters = this._activeEmitters;
                    emitter.removeCancelCallback();
                    emitter.removeAcceptCallback();
                    if (event)
                        emitter.cancel(event);
                    activeEmitters.splice($.inArray(emitter, activeEmitters), 1)
                },
                _cleanEmitters: function(e) {
                    this._applyToEmitters("end", e);
                    this.reset(e)
                },
                _fetchEmitters: function(e) {
                    this._activeEmitters = this._emittersSet.slice();
                    this._applyToEmitters("start", e)
                },
                _pointerMoveHandler: function(e) {
                    this._applyToEmitters("move", e)
                },
                _pointerUpHandler: function(e) {
                    this._updateEmitters(e)
                },
                _mouseWheelHandler: function(e) {
                    e.pointers = [null];
                    this._pointerDownHandler(e);
                    this._eachEmitter(function(emitter) {
                        var direction = emitter.getDirection ? emitter.getDirection(e) : "",
                            prop = direction !== "horizontal" ? "pageY" : "pageX";
                        if (direction)
                            e[prop] += e.delta;
                        return !direction
                    });
                    this._pointerMoveHandler(e);
                    e.pointers = [];
                    this._pointerUpHandler(e)
                },
                isActive: function(element) {
                    var result = false;
                    this._eachEmitter(function(emitter) {
                        result = result || emitter.getElement().is(element)
                    });
                    return result
                }
            });
        var EMITTER_SUBSCRIPTION_DATA = "dxEmitterSubscription";
        var eventManager = new EventManager;
        var registerEmitter = function(emitterConfig) {
                var emitterClass = emitterConfig.emitter,
                    emitterName = emitterConfig.events[0],
                    emitterEvents = emitterConfig.events;
                $.each(emitterEvents, function(_, eventName) {
                    events.registerEvent(eventName, {
                        noBubble: !emitterConfig.bubble,
                        setup: function(element, data) {
                            var $element = $(element),
                                subscriptions = $element.data(EMITTER_SUBSCRIPTION_DATA) || {},
                                emitters = $element.data(EMITTER_DATA) || {},
                                emitter = emitters[emitterName] || new emitterClass(element);
                            subscriptions[eventName] = true;
                            emitters[emitterName] = emitter;
                            $element.data(EMITTER_DATA, emitters);
                            $element.data(EMITTER_SUBSCRIPTION_DATA, subscriptions)
                        },
                        add: function(element, handleObj) {
                            var $element = $(element),
                                emitters = $element.data(EMITTER_DATA),
                                emitter = emitters[emitterName];
                            emitter.configurate($.extend({delegateSelector: handleObj.selector}, handleObj.data), handleObj.type)
                        },
                        teardown: function(element) {
                            var $element = $(element),
                                subscriptions = $element.data(EMITTER_SUBSCRIPTION_DATA),
                                emitters = $element.data(EMITTER_DATA),
                                emitter = emitters[emitterName];
                            delete subscriptions[eventName];
                            var disposeEmitter = true;
                            $.each(emitterEvents, function(_, eventName) {
                                disposeEmitter = disposeEmitter && !subscriptions[eventName];
                                return disposeEmitter
                            });
                            if (disposeEmitter) {
                                if (eventManager.isActive(element))
                                    eventManager.reset();
                                emitter && emitter.dispose();
                                delete emitters[emitterName]
                            }
                        }
                    })
                })
            };
        $.extend(events, {registerEmitter: registerEmitter})
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.emitter.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var Emitter = DX.Class.inherit({
                ctor: function(element) {
                    this._$element = $(element);
                    this._cancelCallback = $.Callbacks();
                    this._acceptCallback = $.Callbacks()
                },
                getElement: function() {
                    return this._$element
                },
                validate: function(e) {
                    return e.type !== "dxmousewheel"
                },
                validatePointers: function(e) {
                    return events.hasTouches(e) === 1
                },
                configurate: function(data) {
                    $.extend(this, data)
                },
                addCancelCallback: function(callback) {
                    this._cancelCallback.add(callback)
                },
                removeCancelCallback: function() {
                    this._cancelCallback.empty()
                },
                _cancel: function(e) {
                    this._cancelCallback.fire(e)
                },
                addAcceptCallback: function(callback) {
                    this._acceptCallback.add(callback)
                },
                removeAcceptCallback: function() {
                    this._acceptCallback.empty()
                },
                _accept: function(e) {
                    this._acceptCallback.fire(e)
                },
                start: $.noop,
                move: $.noop,
                end: $.noop,
                cancel: $.noop,
                _fireEvent: function(eventName, e, params) {
                    var eventData = $.extend({
                            type: eventName,
                            originalEvent: e,
                            target: this._getEmitterTarget(e),
                            delegateTarget: this.getElement().get(0)
                        }, params);
                    e = events.fireEvent(eventData);
                    if (e.cancel)
                        this._cancel(e);
                    return e
                },
                _getEmitterTarget: function(e) {
                    return (this.delegateSelector ? $(e.target).closest(this.delegateSelector) : this.getElement()).get(0)
                },
                dispose: $.noop
            });
        $.extend(events, {Emitter: Emitter})
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.emitter.feedback.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            ACTIVE_EVENT_NAME = "dxactive",
            INACTIVE_EVENT_NAME = "dxinactive",
            ACTIVE_TIMEOUT = 30,
            INACTIVE_TIMEOUT = 400;
        var activeEmitter;
        var FeedbackEmitter = events.Emitter.inherit({
                configurate: function(data, eventName) {
                    switch (eventName) {
                        case ACTIVE_EVENT_NAME:
                            data.activeTimeout = data.timeout;
                            break;
                        case INACTIVE_EVENT_NAME:
                            data.inactiveTimeout = data.timeout;
                            break
                    }
                    this.callBase(data)
                },
                start: function(e) {
                    var element = this.getElement().get(0),
                        activeElement = activeEmitter && activeEmitter.getElement().get(0);
                    if ($.contains(element, activeElement))
                        this._cancel(e);
                    else {
                        if (activeEmitter)
                            activeEmitter._forceInctiveTimer();
                        activeEmitter = this;
                        this._startActiveTimer(e)
                    }
                    this._eventTarget = this._getEmitterTarget(e)
                },
                cancel: function(e) {
                    this.end(e)
                },
                end: function(e) {
                    var skipTimers = e.type !== "dxpointerup";
                    if (skipTimers)
                        this._stopActiveTimer();
                    else
                        this._forceActiveTimer();
                    this._startInactiveTimer(e);
                    if (skipTimers)
                        this._forceInctiveTimer()
                },
                _startActiveTimer: function(e) {
                    var activeTimeout = "activeTimeout" in this ? this.activeTimeout : ACTIVE_TIMEOUT;
                    this._forceActiveTimer = $.proxy(this._fireActive, this, e);
                    this._activeTimer = window.setTimeout(this._forceActiveTimer, activeTimeout)
                },
                _fireActive: function(e) {
                    if (this._activeTimer) {
                        this._stopActiveTimer();
                        this._fireEvent(ACTIVE_EVENT_NAME, e, {target: this._eventTarget})
                    }
                },
                _stopActiveTimer: function() {
                    clearTimeout(this._activeTimer);
                    delete this._activeTimer
                },
                _forceActiveTimer: $.noop,
                _startInactiveTimer: function(e) {
                    var inactiveTimeout = "inactiveTimeout" in this ? this.inactiveTimeout : INACTIVE_TIMEOUT;
                    this._forceInctiveTimer = $.proxy(this._fireInctive, this, e);
                    this._inactiveTimer = window.setTimeout(this._forceInctiveTimer, inactiveTimeout)
                },
                _fireInctive: function(e) {
                    if (this._inactiveTimer) {
                        this._stopInactiveTimer();
                        this._fireEvent(INACTIVE_EVENT_NAME, e, {target: this._eventTarget})
                    }
                },
                _stopInactiveTimer: function() {
                    clearTimeout(this._inactiveTimer);
                    delete this._inactiveTimer;
                    activeEmitter = null
                },
                _forceInctiveTimer: $.noop
            });
        events.registerEmitter({
            emitter: FeedbackEmitter,
            events: [ACTIVE_EVENT_NAME, INACTIVE_EVENT_NAME]
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.emitter.click.js */
    (function($, DX, wnd, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            abs = Math.abs,
            CLICK_EVENT_NAME = "dxclick",
            TOUCH_BOUNDARY = 10;
        var isInput = function(element) {
                return $(element).is("input, textarea, select, button, :focus, :focus *")
            };
        var ClickEmitter = events.Emitter.inherit({
                ctor: function(element) {
                    this.callBase(element);
                    this._makeElementClickable($(element))
                },
                _makeElementClickable: function($element) {
                    if (!$element.attr("onclick"))
                        $element.attr("onclick", "void(0)")
                },
                start: function(e) {
                    this._$startTarget = $(e.target);
                    this._startEventData = events.eventData(e)
                },
                end: function(e) {
                    if (this._eventOutOfElement(e, this.getElement().get(0)) || e.type === "dxpointercancel") {
                        this._cancel(e);
                        return
                    }
                    this._accept(e);
                    this._fireClickEvent(e)
                },
                _eventOutOfElement: function(e, element) {
                    var target = e.target,
                        targetChanged = !$.contains(element, target) && element !== target,
                        gestureDelta = events.eventDelta(events.eventData(e), this._startEventData),
                        boundsExceeded = abs(gestureDelta.x) > TOUCH_BOUNDARY || abs(gestureDelta.y) > TOUCH_BOUNDARY;
                    return targetChanged || boundsExceeded
                },
                _fireClickEvent: function(e) {
                    e = this._fireEvent(CLICK_EVENT_NAME, e, {target: this._getClickTarget(this._$startTarget, $(e.target))});
                    if (!isInput(e.target) && !e.dxPreventBlur)
                        utils.resetActiveElement()
                },
                _getClickTarget: function($startTarget, $endTarget) {
                    var $startParents = $startTarget.parents().addBack(),
                        $endParents = $endTarget.parents().addBack(),
                        startingParent = Math.min($startParents.length, $endParents.length) - 1;
                    for (var i = startingParent; i >= 0; i--)
                        if ($startParents.eq(i).is($endParents.eq(i)))
                            return $startParents.get(i)
                }
            });
        (function() {
            var useNativeClick = DX.devices.real().generic;
            if (useNativeClick) {
                var passed = null,
                    prevented = null;
                ClickEmitter = ClickEmitter.inherit({
                    start: function() {
                        passed = null;
                        prevented = null
                    },
                    end: $.noop,
                    _fireClickEvent: function() {
                        passed = true
                    },
                    cancel: function() {
                        prevented = true
                    }
                });
                var clickHandler = function(e) {
                        if ((!e.which || e.which == 1) && (!prevented || passed))
                            events.fireEvent({
                                type: CLICK_EVENT_NAME,
                                originalEvent: e
                            })
                    };
                $(document).on(events.addNamespace("click", "NATIVE_DXCLICK_STRATEGY"), clickHandler)
            }
            $.extend(events.__internals, {useNativeClick: useNativeClick})
        })();
        (function() {
            var fixBuggyInertia = function() {
                    var device = DX.devices.real(),
                        iOS7 = device.platform === "ios" && device.version[0] === 7;
                    return iOS7
                }();
            if (fixBuggyInertia)
                ClickEmitter = ClickEmitter.inherit({_fireClickEvent: function(e) {
                        var $element = $(e.target),
                            callBase = this.callBase,
                            args = arguments;
                        DX.requestAnimationFrame($.proxy(function() {
                            while ($element.length) {
                                if ($element.data("dxGestureLock"))
                                    return;
                                $element = $element.parent()
                            }
                            callBase.apply(this, args)
                        }, this))
                    }});
            $.extend(events.__internals, {fixBuggyInertia: fixBuggyInertia})
        })();
        (function() {
            var startTarget = null;
            var pointerDownHandler = function(e) {
                    startTarget = e.target
                };
            var clickHandler = function(e) {
                    var $target = $(e.target);
                    if (startTarget && !$target.is(startTarget) && !$(startTarget).is("label") && isInput($target))
                        utils.resetActiveElement();
                    startTarget = null
                };
            var NATIVE_CLICK_FIXER_NAMESPACE = "NATIVE_CLICK_FIXER";
            $(document).on(events.addNamespace("dxpointerdown", NATIVE_CLICK_FIXER_NAMESPACE), pointerDownHandler).on(events.addNamespace("click", NATIVE_CLICK_FIXER_NAMESPACE), clickHandler)
        })();
        events.registerEmitter({
            emitter: ClickEmitter,
            bubble: true,
            events: [CLICK_EVENT_NAME]
        });
        $.extend(events.__internals, {useFastClick: !events.__internals.useNativeClick && !events.__internals.fixBuggyInertia})
    })(jQuery, DevExpress, window);
    /*! Module core, file ui.events.emitter.hold.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            abs = Math.abs,
            HOLD_EVENT_NAME = "dxhold",
            HOLD_TIMEOUT = 750,
            TOUCH_BOUNDARY = 5;
        var HoldEmitter = events.Emitter.inherit({
                start: function(e) {
                    this._startEventData = events.eventData(e);
                    this._startTimer(e)
                },
                _startTimer: function(e) {
                    var holdTimeout = "timeout" in this ? this.timeout : HOLD_TIMEOUT;
                    this._holdTimer = setTimeout($.proxy(function() {
                        this._accept(e);
                        events.fireEvent({
                            type: HOLD_EVENT_NAME,
                            originalEvent: e
                        })
                    }, this), holdTimeout)
                },
                move: function(e) {
                    if (this._touchWasMoved(e))
                        this._cancel(e)
                },
                _touchWasMoved: function(e) {
                    var delta = events.eventDelta(this._startEventData, events.eventData(e));
                    return abs(delta.x) > TOUCH_BOUNDARY || abs(delta.y) > TOUCH_BOUNDARY
                },
                end: function() {
                    this._stopTimer()
                },
                _stopTimer: function() {
                    clearTimeout(this._holdTimer)
                },
                cancel: function() {
                    this._stopTimer()
                }
            });
        events.registerEmitter({
            emitter: HoldEmitter,
            bubble: true,
            events: [HOLD_EVENT_NAME]
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.emitter.gesture.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            devices = DX.devices,
            abs = Math.abs;
        var SLEEP = 0,
            INITED = 1,
            STARTED = 2,
            TOUCH_BOUNDARY = 10,
            IMMEDIATE_TOUCH_BOUNDARY = 0,
            IMMEDIATE_TIMEOUT = 180;
        var GestureEmitter = events.Emitter.inherit({
                getDirection: function() {
                    return this.direction
                },
                _cancel: function(e) {
                    this.callBase(e);
                    this._togglePointerEvents(true);
                    this._stage = SLEEP
                },
                start: function(e) {
                    if (events.needSkipEvent(e)) {
                        this._cancel(e);
                        return
                    }
                    this._startEvent = events.createEvent(e);
                    this._startEventData = events.eventData(e);
                    this._prevEventData = this._startEventData;
                    this._stage = INITED;
                    this._init(e);
                    this._setupImmediateTimer()
                },
                _setupImmediateTimer: function() {
                    clearTimeout(this._immediateTimer);
                    this._immedeateAccepted = false;
                    if (!this.immediate)
                        return;
                    this._immediateTimer = setTimeout($.proxy(function() {
                        this._immedeateAccepted = true
                    }, this), IMMEDIATE_TIMEOUT)
                },
                move: function(e) {
                    if (this._stage === INITED && this._directionConfirmed(e)) {
                        this._accept(e);
                        this._resetActiveElement();
                        this._togglePointerEvents(false);
                        this._clearSelection(e);
                        this._stage = STARTED;
                        this._adjustStartEvent(e);
                        this._start(this._startEvent);
                        this._prevEventData = events.eventData(this._startEvent)
                    }
                    if (this._stage === STARTED)
                        this._move(e);
                    this._prevEventData = events.eventData(e)
                },
                _directionConfirmed: function(e) {
                    var touchBoundary = this._getTouchBoundary(e),
                        delta = events.eventDelta(this._startEventData, events.eventData(e)),
                        deltaX = abs(delta.x),
                        deltaY = abs(delta.y);
                    var horizontalMove = this._validateMove(touchBoundary, deltaX, deltaY),
                        verticalMove = this._validateMove(touchBoundary, deltaY, deltaX);
                    var direction = this.getDirection(e),
                        bothAccepted = direction === "both" && (horizontalMove || verticalMove),
                        horizontalAccepted = direction === "horizontal" && horizontalMove,
                        verticalAccepted = direction === "vertical" && verticalMove;
                    return bothAccepted || horizontalAccepted || verticalAccepted || this._immedeateAccepted
                },
                _validateMove: function(touchBoundary, mainAxis, crossAxis) {
                    return mainAxis && mainAxis >= touchBoundary && (this.immediate ? mainAxis >= crossAxis : true)
                },
                _getTouchBoundary: function(e) {
                    return this.immediate || e.type === "dxmousewheel" ? IMMEDIATE_TOUCH_BOUNDARY : TOUCH_BOUNDARY
                },
                _adjustStartEvent: function(e) {
                    var touchBoundary = this._getTouchBoundary(e),
                        delta = events.eventDelta(this._startEventData, events.eventData(e));
                    this._startEvent.pageX += utils.sign(delta.x) * touchBoundary;
                    this._startEvent.pageY += utils.sign(delta.y) * touchBoundary
                },
                _resetActiveElement: function() {
                    if (devices.real().platform === "ios" && $(":focus", this.getElement()).length)
                        utils.resetActiveElement()
                },
                _togglePointerEvents: function(toggle) {
                    if (devices.real().platform === "generic")
                        $("body").css("pointer-events", toggle ? "" : "none")
                },
                _clearSelection: function(e) {
                    if (e.type === "dxmousewheel" || events.isTouchEvent(e))
                        return;
                    utils.clearSelection()
                },
                end: function(e) {
                    this._togglePointerEvents(true);
                    if (this._stage === STARTED)
                        this._end(e);
                    else if (this._stage === INITED)
                        this._stop(e);
                    this._stage = SLEEP
                },
                _init: $.noop,
                _start: $.noop,
                _move: $.noop,
                _stop: $.noop,
                _end: $.noop
            });
        $.extend(events, {GestureEmitter: GestureEmitter});
        var ORIG_TOUCH_BOUNDARY = TOUCH_BOUNDARY;
        $.extend(DX.ui.events.__internals, {
            GESTURE_TOUCH_BOUNDARY: ORIG_TOUCH_BOUNDARY,
            resetTouchBoundary: function() {
                TOUCH_BOUNDARY = ORIG_TOUCH_BOUNDARY;
                events.__internals.GESTURE_TOUCH_BOUNDARY = ORIG_TOUCH_BOUNDARY
            },
            cleanTouchBoundary: function() {
                TOUCH_BOUNDARY = 0
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.emitter.gesture.scroll.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var SCROLL_INIT_EVENT = "dxscrollinit",
            SCROLL_START_EVENT = "dxscrollstart",
            SCROLL_MOVE_EVENT = "dxscroll",
            SCROLL_END_EVENT = "dxscrollend",
            SCROLL_STOP_EVENT = "dxscrollstop",
            SCROLL_CANCEL_EVENT = "dxscrollcancel",
            INERTIA_TIMEOUT = 100,
            VELOCITY_CALC_TIMEOUT = 200,
            FRAME_DURATION = Math.round(1000 / 60),
            GESTURE_LOCK_KEY = "dxGestureLock",
            GESTURE_LOCK_TIMEOUT = 200;
        var ScrollEmitter = events.GestureEmitter.inherit({
                ctor: function(element) {
                    this.callBase(element);
                    this.direction = "both";
                    $(element).on("scroll", $.proxy(this._treatScroll, this))
                },
                _treatScroll: function() {
                    this._prepareGesture();
                    this._forgetGesture()
                },
                _prepareGesture: function() {
                    if (this._gestureEndTimer) {
                        clearTimeout(this._gestureEndTimer);
                        this._gestureEndTimer = null
                    }
                    else
                        this.getElement().data(GESTURE_LOCK_KEY, true)
                },
                _forgetGesture: function() {
                    this._gestureEndTimer = setTimeout($.proxy(function() {
                        this.getElement().data(GESTURE_LOCK_KEY, false);
                        this._gestureEndTimer = null
                    }, this), GESTURE_LOCK_TIMEOUT)
                },
                _init: function(e) {
                    if (this.getElement().data(GESTURE_LOCK_KEY))
                        this._accept(e);
                    this._fireEvent(SCROLL_INIT_EVENT, e)
                },
                move: function(e) {
                    this.callBase.apply(this, arguments);
                    e.isScrollingEvent = this.isNative
                },
                _start: function(e) {
                    this._savedEventData = events.eventData(e);
                    this._fireEvent(SCROLL_START_EVENT, e, {delta: events.eventDelta(this._savedEventData, events.eventData(e))})
                },
                _move: function(e) {
                    var currentEventData = events.eventData(e);
                    this._fireEvent(SCROLL_MOVE_EVENT, e, {delta: events.eventDelta(this._prevEventData, currentEventData)});
                    var eventDelta = events.eventDelta(this._savedEventData, currentEventData);
                    if (eventDelta.time > VELOCITY_CALC_TIMEOUT)
                        this._savedEventData = this._prevEventData
                },
                _end: function(e) {
                    var endEventDelta = events.eventDelta(this._prevEventData, events.eventData(e));
                    var velocity = {
                            x: 0,
                            y: 0
                        };
                    if (endEventDelta.time < INERTIA_TIMEOUT) {
                        var deltaEventData = events.eventDelta(this._savedEventData, this._prevEventData);
                        velocity = {
                            x: deltaEventData.x * FRAME_DURATION / deltaEventData.time,
                            y: deltaEventData.y * FRAME_DURATION / deltaEventData.time
                        }
                    }
                    this._fireEvent(SCROLL_END_EVENT, e, {velocity: velocity})
                },
                _stop: function(e) {
                    this._fireEvent(SCROLL_STOP_EVENT, e)
                },
                cancel: function(e) {
                    this._fireEvent(SCROLL_CANCEL_EVENT, e)
                },
                dispose: function() {
                    this.getElement().off("scroll")
                }
            });
        events.registerEmitter({
            emitter: ScrollEmitter,
            events: [SCROLL_INIT_EVENT, SCROLL_START_EVENT, SCROLL_MOVE_EVENT, SCROLL_END_EVENT, SCROLL_STOP_EVENT, SCROLL_CANCEL_EVENT]
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.emitter.gesture.swipe.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            SWIPE_START_EVENT = "dxswipestart",
            SWIPE_EVENT = "dxswipe",
            SWIPE_END_EVENT = "dxswipeend";
        var HorizontalStrategy = {
                defaultItemSizeFunc: function() {
                    return this.getElement().width()
                },
                getBounds: function() {
                    return [this._maxLeftOffset, this._maxRightOffset]
                },
                calcOffsetRatio: function(e) {
                    var endEventData = events.eventData(e);
                    return (endEventData.x - (this._savedEventData && this._savedEventData.x || 0)) / this._itemSizeFunc().call(this, e)
                },
                isFastSwipe: function(e) {
                    var endEventData = events.eventData(e);
                    return this.FAST_SWIPE_SPEED_LIMIT * Math.abs(endEventData.x - this._tickData.x) >= endEventData.time - this._tickData.time
                }
            };
        var VerticalStrategy = {
                defaultItemSizeFunc: function() {
                    return this.getElement().height()
                },
                getBounds: function() {
                    return [this._maxTopOffset, this._maxBottomOffset]
                },
                calcOffsetRatio: function(e) {
                    var endEventData = events.eventData(e);
                    return (endEventData.y - (this._savedEventData && this._savedEventData.y || 0)) / this._itemSizeFunc().call(this, e)
                },
                isFastSwipe: function(e) {
                    var endEventData = events.eventData(e);
                    return this.FAST_SWIPE_SPEED_LIMIT * Math.abs(endEventData.y - this._tickData.y) >= endEventData.time - this._tickData.time
                }
            };
        var STRATEGIES = {
                horizontal: HorizontalStrategy,
                vertical: VerticalStrategy
            };
        var SwipeEmitter = events.GestureEmitter.inherit({
                TICK_INTERVAL: 300,
                FAST_SWIPE_SPEED_LIMIT: 5,
                ctor: function(element) {
                    this.callBase(element);
                    this.direction = "horizontal";
                    this.elastic = true
                },
                _getStrategy: function() {
                    return STRATEGIES[this.direction]
                },
                _defaultItemSizeFunc: function() {
                    return this._getStrategy().defaultItemSizeFunc.call(this)
                },
                _itemSizeFunc: function() {
                    return this.itemSizeFunc || this._defaultItemSizeFunc
                },
                _start: function(e) {
                    this._savedEventData = events.eventData(e);
                    this._tickData = {time: 0};
                    e = this._fireEvent(SWIPE_START_EVENT, e);
                    if (!e.cancel) {
                        this._maxLeftOffset = e.maxLeftOffset;
                        this._maxRightOffset = e.maxRightOffset;
                        this._maxTopOffset = e.maxTopOffset;
                        this._maxBottomOffset = e.maxBottomOffset
                    }
                },
                _move: function(e) {
                    var strategy = this._getStrategy(),
                        moveEventData = events.eventData(e),
                        offset = strategy.calcOffsetRatio.call(this, e);
                    offset = this._fitOffset(offset, this.elastic);
                    if (moveEventData.time - this._tickData.time > this.TICK_INTERVAL)
                        this._tickData = moveEventData;
                    this._fireEvent(SWIPE_EVENT, e, {offset: offset});
                    e.preventDefault()
                },
                _end: function(e) {
                    var strategy = this._getStrategy(),
                        offsetRatio = strategy.calcOffsetRatio.call(this, e),
                        isFast = strategy.isFastSwipe.call(this, e),
                        startOffset = offsetRatio,
                        targetOffset = this._calcTargetOffset(offsetRatio, isFast);
                    startOffset = this._fitOffset(startOffset, this.elastic);
                    targetOffset = this._fitOffset(targetOffset, false);
                    this._fireEvent(SWIPE_END_EVENT, e, {
                        offset: startOffset,
                        targetOffset: targetOffset
                    })
                },
                _fitOffset: function(offset, elastic) {
                    var strategy = this._getStrategy(),
                        bounds = strategy.getBounds.call(this);
                    if (offset < -bounds[0])
                        return elastic ? (-2 * bounds[0] + offset) / 3 : -bounds[0];
                    if (offset > bounds[1])
                        return elastic ? (2 * bounds[1] + offset) / 3 : bounds[1];
                    return offset
                },
                _calcTargetOffset: function(offsetRatio, isFast) {
                    var result;
                    if (isFast) {
                        result = Math.ceil(Math.abs(offsetRatio));
                        if (offsetRatio < 0)
                            result = -result
                    }
                    else
                        result = Math.round(offsetRatio);
                    return result
                }
            });
        events.registerEmitter({
            emitter: SwipeEmitter,
            events: [SWIPE_START_EVENT, SWIPE_EVENT, SWIPE_END_EVENT]
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.emitter.gesture.drag.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            wrapToArray = utils.wrapToArray;
        var DRAG_START_EVENT = "dxdragstart",
            DRAG_EVENT = "dxdrag",
            DRAG_END_EVENT = "dxdragend",
            DRAG_ENTER_EVENT = "dxdragenter",
            DRAG_LEAVE_EVENT = "dxdragleave",
            DROP_EVENT = "dxdrop";
        var knownDropTargets = [],
            knownDropTargetConfigs = [];
        var dropTargetRegistration = {
                setup: function(element, data) {
                    var knownDropTarget = $.inArray(element, knownDropTargets) !== -1;
                    if (!knownDropTarget) {
                        knownDropTargets.push(element);
                        knownDropTargetConfigs.push(data || {})
                    }
                },
                teardown: function(element, data) {
                    var elementEvents = $._data(element, "events"),
                        handlersCount = 0;
                    $.each([DRAG_ENTER_EVENT, DRAG_LEAVE_EVENT, DROP_EVENT], function(_, eventName) {
                        var eventHandlers = elementEvents[eventName];
                        if (eventHandlers)
                            handlersCount += eventHandlers.length
                    });
                    if (!handlersCount) {
                        var index = $.inArray(element, knownDropTargets);
                        knownDropTargets.splice(index, 1);
                        knownDropTargetConfigs.splice(index, 1)
                    }
                }
            };
        events.registerEvent(DRAG_ENTER_EVENT, dropTargetRegistration);
        events.registerEvent(DRAG_LEAVE_EVENT, dropTargetRegistration);
        events.registerEvent(DROP_EVENT, dropTargetRegistration);
        var getItemConfig = function($element) {
                var dropTargetIndex = $.inArray($element.get(0), knownDropTargets);
                return knownDropTargetConfigs[dropTargetIndex]
            };
        var getItemPosition = function($element) {
                var dropTargetConfig = getItemConfig($element);
                if (dropTargetConfig.itemPositionFunc)
                    return dropTargetConfig.itemPositionFunc();
                else
                    return $element.offset()
            };
        var getItemSize = function($element) {
                var dropTargetConfig = getItemConfig($element);
                if (dropTargetConfig.itemSizeFunc)
                    return dropTargetConfig.itemSizeFunc();
                else
                    return {
                            width: $element.width(),
                            height: $element.height()
                        }
            };
        var DragEmitter = events.GestureEmitter.inherit({
                ctor: function(element) {
                    this.callBase(element);
                    this.direction = "both"
                },
                _init: function(e) {
                    this._initEvent = e
                },
                _start: function(e) {
                    e = this._fireEvent(DRAG_START_EVENT, this._initEvent);
                    this._maxLeftOffset = e.maxLeftOffset;
                    this._maxRightOffset = e.maxRightOffset;
                    this._maxTopOffset = e.maxTopOffset;
                    this._maxBottomOffset = e.maxBottomOffset;
                    var dropTargets = wrapToArray(e.targetElements || knownDropTargets);
                    this._$dropTargetElements = $.map(dropTargets, function(element) {
                        return $(element)
                    })
                },
                _move: function(e) {
                    var eventData = events.eventData(e),
                        dragOffset = this._calculateOffset(eventData);
                    this._fireEvent(DRAG_EVENT, e, {offset: dragOffset});
                    this._processDropTargets(e, dragOffset);
                    e.preventDefault()
                },
                _calculateOffset: function(eventData) {
                    return {
                            x: this._calculateXOffset(eventData),
                            y: this._calculateYOffset(eventData)
                        }
                },
                _calculateXOffset: function(eventData) {
                    if (this.direction !== "vertical") {
                        var offset = eventData.x - this._startEventData.x;
                        return this._fitOffset(offset, this._maxLeftOffset, this._maxRightOffset)
                    }
                    return 0
                },
                _calculateYOffset: function(eventData) {
                    if (this.direction !== "horizontal") {
                        var offset = eventData.y - this._startEventData.y;
                        return this._fitOffset(offset, this._maxTopOffset, this._maxBottomOffset)
                    }
                    return 0
                },
                _fitOffset: function(offset, minOffset, maxOffset) {
                    if (minOffset != null)
                        offset = Math.max(offset, -minOffset);
                    if (maxOffset != null)
                        offset = Math.min(offset, maxOffset);
                    return offset
                },
                _processDropTargets: function(e, dragOffset) {
                    var target = this._findDropTarget(e),
                        sameTarget = target === this._$currentDropTarget;
                    if (!sameTarget) {
                        this._fireDropTargetEvent(e, DRAG_LEAVE_EVENT);
                        this._$currentDropTarget = target;
                        this._fireDropTargetEvent(e, DRAG_ENTER_EVENT)
                    }
                },
                _fireDropTargetEvent: function(event, eventName) {
                    if (!this._$currentDropTarget)
                        return;
                    var eventData = {
                            type: eventName,
                            originalEvent: event,
                            draggingElement: this._$element.get(0),
                            target: this._$currentDropTarget.get(0)
                        };
                    events.fireEvent(eventData)
                },
                _findDropTarget: function(e) {
                    var that = this,
                        $result;
                    $.each(this._$dropTargetElements, function(_, $target) {
                        if (that._checkDropTarget($target, e)) {
                            $result = $target;
                            return false
                        }
                    });
                    return $result
                },
                _checkDropTarget: function($target, e) {
                    var isDraggingElement = $target.get(0) === this._$element.get(0);
                    if (isDraggingElement)
                        return false;
                    var targetPosition = getItemPosition($target);
                    if (e.pageX < targetPosition.left)
                        return false;
                    if (e.pageY < targetPosition.top)
                        return false;
                    var targetSize = getItemSize($target);
                    if (e.pageX > targetPosition.left + targetSize.width)
                        return false;
                    if (e.pageY > targetPosition.top + targetSize.height)
                        return false;
                    return $target
                },
                _end: function(e) {
                    var eventData = events.eventData(e);
                    this._fireEvent(DRAG_END_EVENT, e, {offset: this._calculateOffset(eventData)});
                    this._fireDropTargetEvent(e, DROP_EVENT);
                    delete this._$currentDropTarget
                }
            });
        events.registerEmitter({
            emitter: DragEmitter,
            events: [DRAG_START_EVENT, DRAG_EVENT, DRAG_END_EVENT]
        });
        DX.ui.events.__internals = DX.ui.events.__internals || {};
        $.extend(DX.ui.events.__internals, {dropTargets: knownDropTargets})
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.emitter.transform.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            fitIntoRange = utils.fitIntoRange;
        var DX_PREFIX = "dx",
            TRANSFORM = "transform",
            TRANSLATE = "translate",
            ZOOM = "zoom",
            ROTATE = "rotate",
            START_POSTFIX = "start",
            UPDATE_POSTFIX = "",
            END_POSTFIX = "end";
        var eventAliases = [];
        var addAlias = function(eventName, eventArgs) {
                eventAliases.push({
                    name: eventName,
                    args: eventArgs
                })
            };
        addAlias(TRANSFORM, {
            scale: true,
            deltaScale: true,
            rotation: true,
            deltaRotation: true,
            translation: true,
            deltaTranslation: true
        });
        addAlias(TRANSLATE, {
            translation: true,
            deltaTranslation: true
        });
        addAlias(ZOOM, {
            scale: true,
            deltaScale: true
        });
        addAlias(ROTATE, {
            rotation: true,
            deltaRotation: true
        });
        var getVector = function(first, second) {
                return {
                        x: second.pageX - first.pageX,
                        y: -second.pageY + first.pageY,
                        centerX: (second.pageX + first.pageX) * 0.5,
                        centerY: (second.pageY + first.pageY) * 0.5
                    }
            };
        var getEventVector = function(e) {
                var pointers = e.pointers;
                return getVector(pointers[0], pointers[1])
            };
        var getDistance = function(vector) {
                return Math.sqrt(vector.x * vector.x + vector.y * vector.y)
            };
        var getScale = function(firstVector, secondVector) {
                return getDistance(firstVector) / getDistance(secondVector)
            };
        var getRotation = function(firstVector, secondVector) {
                var scalarProduct = firstVector.x * secondVector.x + firstVector.y * secondVector.y;
                var distanceProduct = getDistance(firstVector) * getDistance(secondVector);
                if (distanceProduct === 0)
                    return 0;
                var sign = utils.sign(firstVector.x * secondVector.y - secondVector.x * firstVector.y);
                var angle = Math.acos(fitIntoRange(scalarProduct / distanceProduct, -1, 1));
                return sign * angle
            };
        var getTranslation = function(firstVector, secondVector) {
                return {
                        x: firstVector.centerX - secondVector.centerX,
                        y: firstVector.centerY - secondVector.centerY
                    }
            };
        var TransformEmitter = events.Emitter.inherit({
                ctor: function(element) {
                    this.callBase(element)
                },
                validatePointers: function(e) {
                    return events.hasTouches(e) > 1
                },
                start: function(e) {
                    this._accept();
                    var startVector = getEventVector(e);
                    this._startVector = startVector;
                    this._prevVector = startVector;
                    this._fireEventAliases(START_POSTFIX, e)
                },
                move: function(e) {
                    var currentVector = getEventVector(e),
                        eventArgs = this._getEventArgs(currentVector);
                    this._fireEventAliases(UPDATE_POSTFIX, e, eventArgs);
                    this._prevVector = currentVector
                },
                end: function(e) {
                    var eventArgs = this._getEventArgs(this._prevVector);
                    this._fireEventAliases(END_POSTFIX, e, eventArgs)
                },
                _getEventArgs: function(vector) {
                    return {
                            scale: getScale(vector, this._startVector),
                            deltaScale: getScale(vector, this._prevVector),
                            rotation: getRotation(vector, this._startVector),
                            deltaRotation: getRotation(vector, this._prevVector),
                            translation: getTranslation(vector, this._startVector),
                            deltaTranslation: getTranslation(vector, this._prevVector)
                        }
                },
                _fireEventAliases: function(eventPostfix, originalEvent, eventArgs) {
                    eventArgs = eventArgs || {};
                    $.each(eventAliases, $.proxy(function(_, eventAlias) {
                        var args = {};
                        $.each(eventAlias.args, function(name) {
                            if (name in eventArgs)
                                args[name] = eventArgs[name]
                        });
                        this._fireEvent(DX_PREFIX + eventAlias.name + eventPostfix, originalEvent, args)
                    }, this))
                }
            });
        events.registerEmitter({
            emitter: TransformEmitter,
            events: $.map(eventAliases, function(eventAlias) {
                var eventNames = [];
                $.each([START_POSTFIX, UPDATE_POSTFIX, END_POSTFIX], function(_, eventPostfix) {
                    eventNames.push(DX_PREFIX + eventAlias.name + eventPostfix)
                });
                return eventNames
            })
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.events.contextmenu.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            support = DX.support,
            CONTEXTMENU_NAMESPACE = "dxContexMenu",
            CONTEXTMENU_NAMESPACED_EVENT_NAME = events.addNamespace("contextmenu", CONTEXTMENU_NAMESPACE),
            HOLD_NAMESPACED_EVENT_NAME = events.addNamespace("dxhold", CONTEXTMENU_NAMESPACE),
            CONTEXTMENU_EVENT_NAME = "dxcontextmenu";
        var ContextMenu = DX.Class.inherit({
                setup: function(element, data) {
                    var $element = $(element);
                    $element.on(CONTEXTMENU_NAMESPACED_EVENT_NAME, $.proxy(this._contextMenuHandler, this));
                    if (support.touch || DX.devices.isSimulator())
                        $element.on(HOLD_NAMESPACED_EVENT_NAME, $.proxy(this._holdHandler, this))
                },
                _holdHandler: function(e) {
                    if (events.isMouseEvent(e) && !DX.devices.isSimulator())
                        return;
                    this._fireContextMenu(e)
                },
                _contextMenuHandler: function(e) {
                    e.preventDefault();
                    this._fireContextMenu(e)
                },
                _fireContextMenu: function(e) {
                    events.fireEvent({
                        type: CONTEXTMENU_EVENT_NAME,
                        originalEvent: e
                    })
                },
                teardown: function(element) {
                    $(element).off("." + CONTEXTMENU_NAMESPACE)
                }
            });
        events.registerEvent(CONTEXTMENU_EVENT_NAME, new ContextMenu)
    })(jQuery, DevExpress);
    /*! Module core, file ui.widget.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            UI_FEEDBACK = "UIFeedback",
            WIDGET_CLASS = "dx-widget",
            ACTIVE_STATE_CLASS = "dx-state-active",
            DISABLED_STATE_CLASS = "dx-state-disabled",
            INVISIBLE_STATE_CLASS = "dx-state-invisible",
            HOVER_STATE_CLASS = "dx-state-hover",
            FOCUSED_STATE_CLASS = "dx-state-focused",
            FEEDBACK_SHOW_TIMEOUT = 30,
            FEEDBACK_HIDE_TIMEOUT = 400,
            HOVER_START = "dxhoverstart",
            HOVER_END = "dxhoverend",
            ANONYMOUS_TEMPLATE_NAME = "template",
            TEMPLATE_SELECTOR = "[data-options*='dxTemplate']",
            TEMPLATES_DATA_KEY = "dxTemplates";
        var DynamicTemplate = ui.TemplateBase.inherit({
                ctor: function(compile, owner) {
                    this.callBase($("<div>"), owner);
                    this._compile = compile
                },
                _renderCore: function(data, index, container) {
                    if (data === undefined && index === undefined) {
                        data = container;
                        container = undefined
                    }
                    var compiled = index == undefined ? this._compile(data, container) : this._compile(data, index, container);
                    return compiled.render(data, container, index)
                },
                _shouldAppend: false
            });
        var EmptyTemplate = ui.TemplateBase.inherit({
                ctor: function() {
                    this.callBase($("<div>"))
                },
                _renderCore: function(data, index, container) {
                    return $()
                }
            });
        ui.Widget = DX.DOMComponent.inherit({
            NAME: "Widget",
            _supportedKeys: function() {
                return {}
            },
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {contentReadyAction: {
                        since: "14.2",
                        alias: "onContentReady"
                    }})
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    disabled: false,
                    visible: true,
                    hint: undefined,
                    activeStateEnabled: false,
                    width: undefined,
                    height: undefined,
                    onContentReady: null,
                    hoverStateEnabled: false,
                    focusStateEnabled: false,
                    tabIndex: 0,
                    _keyboardProcessor: undefined,
                    _focusEventPropagation: false
                })
            },
            _init: function() {
                this.callBase();
                this._feedbackShowTimeout = FEEDBACK_SHOW_TIMEOUT;
                this._feedbackHideTimeout = FEEDBACK_HIDE_TIMEOUT;
                if (this._templatesSupported()) {
                    this._initTemplates();
                    this._dynamicTemplates = {};
                    this._initContentReadyAction()
                }
            },
            _eventBindingTarget: function() {
                return this.element()
            },
            _templatesSupported: function() {
                return this._renderContentImpl !== DX.abstract
            },
            _initTemplates: function() {
                var templates = {},
                    dataTemplateElements = this.element().data(TEMPLATES_DATA_KEY),
                    templateElements = dataTemplateElements || this.element().contents().filter(TEMPLATE_SELECTOR);
                this._templateProvider = this.option("templateProvider") || new ui.TemplateProvider;
                if (templateElements.length) {
                    var templatesMap = {};
                    templateElements.each(function() {
                        var templateOptions = utils.getElementOptions(this).dxTemplate;
                        if (!templateOptions)
                            return;
                        if (!templateOptions.name)
                            throw DX.Error("E0023");
                        templatesMap[templateOptions.name] = templatesMap[templateOptions.name] || [];
                        templatesMap[templateOptions.name].push(this)
                    });
                    $.each(templatesMap, $.proxy(function(templateName, value) {
                        var deviceTemplate = this._findTemplateByDevice(value);
                        if (deviceTemplate)
                            templates[templateName] = this._createTemplate(deviceTemplate)
                    }, this))
                }
                else
                    templates[this._getAnonimousTemplateName()] = this._createTemplate(this.element().contents());
                this.option("_templates", templates)
            },
            _getAnonimousTemplateName: function() {
                return ANONYMOUS_TEMPLATE_NAME
            },
            _getTemplateByOption: function(optionName) {
                return this._getTemplate(this.option(optionName))
            },
            _getTemplate: function(templateSource) {
                if ($.isFunction(templateSource))
                    return new DynamicTemplate($.proxy(function() {
                            var templateSourceResult = templateSource.apply(this, arguments);
                            if (utils.isDefined(templateSourceResult))
                                return this._acquireTemplate(templateSourceResult);
                            else
                                return new EmptyTemplate
                        }, this));
                return this._acquireTemplate(templateSource)
            },
            _acquireTemplate: function(templateSource) {
                if (templateSource == null)
                    return this._createTemplate(utils.stringToJquery(templateSource));
                if (templateSource instanceof ui.TemplateBase)
                    return templateSource;
                if (templateSource.nodeType || templateSource.jquery) {
                    templateSource = $(templateSource);
                    return this._createTemplate(templateSource)
                }
                if (typeof templateSource === "string") {
                    var userTemplate = this.option("_templates")[templateSource];
                    if (userTemplate)
                        return userTemplate;
                    var dynamicTemplate = this._dynamicTemplates[templateSource];
                    if (dynamicTemplate)
                        return dynamicTemplate;
                    var defaultTemplate = this._templateProvider.getTemplates(this)[templateSource];
                    if (defaultTemplate)
                        return defaultTemplate;
                    return this._createTemplate(utils.stringToJquery(templateSource))
                }
                return this._acquireTemplate(templateSource.toString())
            },
            _createTemplate: function(element) {
                return this._templateProvider.createTemplate(element, this)
            },
            _findTemplateByDevice: function(templates) {
                var suitableTemplate = DX.utils.findBestMatches(DX.devices.current(), templates, function(template) {
                        return utils.getElementOptions(template).dxTemplate
                    })[0];
                $.each(templates, function(index, template) {
                    if (template !== suitableTemplate)
                        $(template).remove()
                });
                return suitableTemplate
            },
            _cleanTemplates: function() {
                var that = this;
                $.each(this.option("_templates"), function(templateName, template) {
                    if (that === template.owner())
                        template.dispose()
                })
            },
            _initContentReadyAction: function() {
                this._contentReadyAction = this._createActionByOption("onContentReady", {excludeValidators: ["designMode", "disabled"]})
            },
            _render: function() {
                this.callBase();
                this.element().addClass(WIDGET_CLASS);
                this._toggleDisabledState(this.option("disabled"));
                this._toggleVisibility(this.option("visible"));
                this._renderHint();
                this._renderDimensions();
                if (this._templatesSupported())
                    this._renderContent();
                this._renderFocusState();
                this._attachFeedbackEvents();
                this._attachHoverEvents()
            },
            _renderHint: function() {
                if (this.option("hint"))
                    this.element().attr("title", this.option("hint"));
                else
                    this.element().removeAttr("title")
            },
            _renderContent: function() {
                this._renderContentImpl();
                this._fireContentReadyAction()
            },
            _renderContentImpl: DX.abstract,
            _fireContentReadyAction: function() {
                this._contentReadyAction({excludeValidators: ["disabled"]})
            },
            _dispose: function() {
                if (this._templatesSupported())
                    this._cleanTemplates();
                this._contentReadyAction = null;
                this.callBase()
            },
            _clean: function() {
                this._cleanFocusState();
                this.callBase();
                this.element().empty()
            },
            _toggleVisibility: function(visible) {
                this.element().toggleClass(INVISIBLE_STATE_CLASS, !visible)
            },
            _renderFocusState: function() {
                if (!this.option("focusStateEnabled") || this.option("disabled"))
                    return;
                this._renderFocusTarget();
                this._attachFocusEvents();
                this._attachKeyboardEvents()
            },
            _focusTarget: function() {
                return this._getActiveElement()
            },
            _getActiveElement: function() {
                var activeElement = this._eventBindingTarget();
                if (this._activeStateUnit)
                    activeElement = activeElement.find(this._activeStateUnit).not("." + DISABLED_STATE_CLASS);
                return activeElement
            },
            _renderFocusTarget: function() {
                this._focusTarget().attr("tabindex", this.option("tabIndex"))
            },
            _attachFocusEvents: function() {
                var $element = this._focusTarget(),
                    that = this;
                var focusAction = new DX.Action(function(args) {
                        var value = args.value;
                        var event = args.event;
                        value ? that._focusInHandler(event) : that._focusOutHandler(event)
                    });
                $element.on("focusin", function(e) {
                    focusAction.execute({
                        element: $(e.target),
                        event: e,
                        value: true
                    })
                }).on("focusout", function(e) {
                    focusAction.execute({
                        element: $(e.target),
                        event: e,
                        value: false
                    })
                })
            },
            _focusInHandler: function(e) {
                if (!this.option("_focusEventPropagation"))
                    e.stopPropagation();
                $(e.currentTarget).addClass(FOCUSED_STATE_CLASS)
            },
            _focusOutHandler: function(e) {
                if (!this.option("_focusEventPropagation"))
                    e.stopPropagation();
                $(e.currentTarget).removeClass(FOCUSED_STATE_CLASS)
            },
            _attachKeyboardEvents: function() {
                var processor = this.option("_keyboardProcessor") || new ui.KeyboardProcessor({element: this._eventBindingTarget()});
                this._keyboardProcessor = processor.reinitialize(this._keyboardHandler, this)
            },
            _keyboardHandler: function(options) {
                var e = options.originalEvent,
                    key = options.key;
                var keys = this._supportedKeys(),
                    func = keys[key];
                if (func !== undefined) {
                    var handler = $.proxy(func, this);
                    return handler(e) || false
                }
                else
                    return true
            },
            _refreshFocusState: function() {
                this._cleanFocusState();
                this._renderFocusState()
            },
            _cleanFocusState: function() {
                var $element = this._focusTarget();
                $element.off("focusin").off("focusout");
                $element.removeClass(FOCUSED_STATE_CLASS);
                $element.removeAttr("tabindex");
                if (this._keyboardProcessor)
                    this._keyboardProcessor.dispose()
            },
            _attachHoverEvents: function() {
                var that = this,
                    hoverableSelector = that._activeStateUnit,
                    nameStart = events.addNamespace(HOVER_START, UI_FEEDBACK),
                    nameEnd = events.addNamespace(HOVER_END, UI_FEEDBACK);
                that._eventBindingTarget().off(nameStart, hoverableSelector).off(nameEnd, hoverableSelector);
                if (that.option("hoverStateEnabled")) {
                    var startAction = new DX.Action(function(args) {
                            var $target = args.element;
                            that._refreshHoveredElement($target)
                        });
                    that._eventBindingTarget().on(nameStart, hoverableSelector, function(e) {
                        startAction.execute({element: $(e.target)})
                    }).on(nameEnd, hoverableSelector, function(e) {
                        that._forgetHoveredElement()
                    })
                }
                else
                    that._toggleHoverClass(false)
            },
            _attachFeedbackEvents: function() {
                var that = this,
                    feedbackSelector = that._activeStateUnit,
                    activeEventName = events.addNamespace("dxactive", UI_FEEDBACK),
                    inactiveEventName = events.addNamespace("dxinactive", UI_FEEDBACK);
                that._eventBindingTarget().off(activeEventName, feedbackSelector).off(inactiveEventName, feedbackSelector);
                if (that.option("activeStateEnabled")) {
                    var feedbackActionHandler = function(args) {
                            var $element = args.element,
                                value = args.value;
                            that._toggleActiveState($element, value)
                        };
                    var feedbackAction = new DX.Action(function(args) {
                            feedbackActionHandler(args)
                        }),
                        feedbackActionDisabled = new DX.Action(function(args) {
                            feedbackActionHandler(args)
                        }, {excludeValidators: ["disabled"]});
                    that._eventBindingTarget().on(activeEventName, feedbackSelector, {timeout: that._feedbackShowTimeout}, function(e) {
                        feedbackAction.execute({
                            element: $(e.currentTarget),
                            value: true
                        })
                    }).on(inactiveEventName, feedbackSelector, {timeout: that._feedbackHideTimeout}, function(e) {
                        feedbackActionDisabled.execute({
                            element: $(e.currentTarget),
                            value: false
                        })
                    })
                }
            },
            _toggleActiveState: function($element, value) {
                this._toggleHoverClass(!value);
                $element.toggleClass(ACTIVE_STATE_CLASS, value)
            },
            _refreshHoveredElement: function(hoveredElement) {
                var selector = this._activeStateUnit || this.element();
                this._forgetHoveredElement();
                this._hoveredElement = hoveredElement.closest(selector);
                this._toggleHoverClass(true)
            },
            _forgetHoveredElement: function() {
                this._toggleHoverClass(false);
                delete this._hoveredElement
            },
            _toggleHoverClass: function(value) {
                if (this._hoveredElement)
                    this._hoveredElement.toggleClass(HOVER_STATE_CLASS, value && this.option("hoverStateEnabled"))
            },
            _renderDimensions: function() {
                var width = this.option("width"),
                    height = this.option("height"),
                    $element = this.element();
                $element.outerWidth(width);
                $element.outerHeight(height)
            },
            _toggleDisabledState: function(value) {
                this.element().toggleClass(DISABLED_STATE_CLASS, Boolean(value));
                this._toggleHoverClass(!value)
            },
            _setWidgetOption: function(widgetName, args) {
                if (!this[widgetName])
                    return;
                if ($.isPlainObject(args[0])) {
                    $.each(args[0], $.proxy(function(option, value) {
                        this._setWidgetOption(widgetName, [option, value])
                    }, this));
                    return
                }
                var optionName = args[0];
                var value = args[1];
                if (args.length === 1)
                    value = this.option(optionName);
                var widgetOptionMap = this[widgetName + "OptionMap"];
                this[widgetName].option(widgetOptionMap ? widgetOptionMap(optionName) : optionName, value)
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"disabled":
                        this._toggleDisabledState(args.value);
                        this._attachFeedbackEvents();
                        this._refreshFocusState();
                        break;
                    case"hint":
                        this._renderHint();
                        break;
                    case"activeStateEnabled":
                        this._attachFeedbackEvents();
                        break;
                    case"hoverStateEnabled":
                        this._attachHoverEvents();
                        break;
                    case"tabIndex":
                    case"_keyboardProcessor":
                    case"focusStateEnabled":
                        this._refreshFocusState();
                        break;
                    case"visible":
                        this._toggleVisibility(args.value);
                        break;
                    case"width":
                    case"height":
                        this._renderDimensions();
                        break;
                    case"onContentReady":
                        this._initContentReadyAction();
                        break;
                    case"_templates":
                        this._refresh();
                        break;
                    case"_focusEventPropagation":
                        break;
                    default:
                        this.callBase(args)
                }
            },
            repaint: function() {
                this._refresh()
            },
            focus: function() {
                this._focusTarget().focus()
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.editor.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            READONLY_STATE_CLASS = "dx-state-readonly",
            INVALID_CLASS = "dx-invalid",
            INVALID_MESSAGE = "dx-invalid-message",
            INVALID_MESSAGE_AUTO = "dx-invalid-message-auto",
            INVALID_MESSAGE_ALWAYS = "dx-invalid-message-always";
        ui.validation = ui.validation || {};
        ui.validation.findGroup = function() {
            var group = this.option("validationGroup"),
                $dxGroup;
            if (!group) {
                $dxGroup = this.element().parents(".dx-validation-group:first");
                if ($dxGroup.length)
                    group = $dxGroup.dxValidationGroup("instance");
                else
                    group = this._modelByElement(this.element())
            }
            return group
        };
        ui.Editor = ui.Widget.inherit({
            _init: function() {
                this.callBase();
                this.validationRequest = $.Callbacks();
                var $element = this.element();
                if ($element) {
                    $element.data("dx-validation-target", this);
                    this.on("disposing", function() {
                        $element.data("dx-validation-target", null)
                    })
                }
            },
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {valueChangeAction: {
                        since: "14.2",
                        alias: "onValueChanged"
                    }})
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    value: undefined,
                    onValueChanged: null,
                    activeStateEnabled: true,
                    readOnly: false,
                    isValid: true,
                    validationError: undefined,
                    validationMessageMode: "auto",
                    validationTooltipOffset: {
                        h: 9,
                        v: -1
                    }
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return device.platform === "android" && device.version[0] > 4
                            },
                            options: {invalidTooltipOffset: {
                                    h: 9,
                                    v: -7
                                }}
                        }, {
                            device: {platform: "win8"},
                            options: {invalidTooltipOffset: {
                                    h: 9,
                                    v: -4
                                }}
                        }])
            },
            _createValueChangeAction: function() {
                this._valueChangeAction = this._createActionByOption("onValueChanged")
            },
            _suppressValueChangeAction: function() {
                this._valueChangeActionSuppressed = true
            },
            _resumeValueChangeAction: function() {
                this._valueChangeActionSuppressed = false
            },
            _render: function() {
                this._createValueChangeAction();
                this._renderValidationState();
                this._toggleReadOnlyState();
                this.callBase()
            },
            _raiseValueChangeAction: function(value, previousValue, extraArguments) {
                this._valueChangeAction(this._valueChangeArgs(value, previousValue))
            },
            _valueChangeArgs: function(value, previousValue) {
                return {
                        value: value,
                        previousValue: previousValue,
                        jQueryEvent: this._valueChangeEventInstance
                    }
            },
            _renderValidationState: function() {
                var isValid = this.option("isValid"),
                    validationError = this.option("validationError"),
                    validationMessageMode = this.option("validationMessageMode"),
                    $element = this.element();
                $element.toggleClass(INVALID_CLASS, !isValid);
                if (this._$validationMessage) {
                    this._$validationMessage.remove();
                    this._$validationMessage = null
                }
                if (!isValid && validationError) {
                    this._$validationMessage = $("<div/>", {"class": INVALID_MESSAGE}).text(validationError.message).appendTo($element).dxTooltip({
                        target: $element,
                        container: $element,
                        position: this._getValidationTooltipPosition("below"),
                        closeOnOutsideClick: false,
                        closeOnTargetScroll: false,
                        animation: null,
                        visible: true,
                        rtlEnabled: this.option("rtlEnabled")
                    });
                    this._$validationMessage.toggleClass(INVALID_MESSAGE_AUTO, validationMessageMode === "auto").toggleClass(INVALID_MESSAGE_ALWAYS, validationMessageMode === "always")
                }
            },
            _getValidationTooltipPosition: function(positionRequest) {
                var rtlEnabled = this.option("rtlEnabled"),
                    tooltipPositionSide = rtlEnabled ? "right" : "left",
                    tooltipOriginalOffset = this.option("validationTooltipOffset"),
                    tooltipOffset = {
                        h: tooltipOriginalOffset.h,
                        v: tooltipOriginalOffset.v
                    },
                    verticalPositions = positionRequest === "below" ? [" top", " bottom"] : [" bottom", " top"];
                if (rtlEnabled)
                    tooltipOffset.h = -tooltipOffset.h;
                if (positionRequest !== "below")
                    tooltipOffset.v = -tooltipOffset.v;
                return {
                        offset: tooltipOffset,
                        my: tooltipPositionSide + verticalPositions[0],
                        at: tooltipPositionSide + verticalPositions[1]
                    }
            },
            _toggleReadOnlyState: function() {
                this.element().toggleClass(READONLY_STATE_CLASS, this.option("readOnly"))
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"onValueChanged":
                        this._createValueChangeAction();
                        break;
                    case"isValid":
                    case"validationError":
                    case"validationMessageMode":
                        this._renderValidationState();
                        break;
                    case"readOnly":
                        this._toggleReadOnlyState();
                        break;
                    case"value":
                        if (!this._valueChangeActionSuppressed)
                            this._raiseValueChangeAction(args.value, args.previousValue);
                        this._valueChangeEventInstance = undefined;
                        if (this.validationRequest)
                            this.validationRequest.fire({
                                value: args.value,
                                editor: this
                            });
                        break;
                    default:
                        this.callBase(args)
                }
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.CollectionWidget.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events;
        var COLLECTION_CLASS = "dx-collection",
            ITEM_CLASS = "dx-item",
            CONTENT_CLASS_POSTFIX = "-content",
            ITEM_CONTENT_PLACEHOLDER_CLASS = "dx-item-content-placeholder",
            ITEM_DATA_KEY = "dxItemData",
            ITEM_TEMPLATE_ID_PREFIX = "tmpl-",
            ITEMS_SELECTOR = "[data-options*='dxItem']",
            SELECTED_ITEM_CLASS = "dx-item-selected",
            FOCUSED_STATE_CLASS = "dx-state-focused",
            ITEM_RESPONSE_WAIT_CLASS = "dx-item-response-wait",
            EMPTY_COLLECTION = "dx-empty-collection";
        var FOCUS_UP = "up",
            FOCUS_DOWN = "down",
            FOCUS_LEFT = "left",
            FOCUS_RIGHT = "right",
            FOCUS_PAGE_UP = "pageup",
            FOCUS_PAGE_DOWN = "pagedown",
            FOCUS_LAST = "last",
            FOCUS_FIRST = "first";
        var CollectionWidget = ui.Widget.inherit({
                NAME: "CollectionWidget",
                _activeStateUnit: "." + ITEM_CLASS,
                _supportedKeys: function() {
                    var click = function(e) {
                            var $itemElement = this._$focusedItem;
                            if (!$itemElement)
                                return;
                            e.target = $itemElement;
                            e.currentTarget = $itemElement;
                            this._itemClickHandler(e)
                        },
                        move = function(location, e) {
                            e.preventDefault();
                            e.stopPropagation();
                            this._moveFocus(location)
                        };
                    return $.extend(this.callBase(), {
                            space: click,
                            enter: click,
                            leftArrow: $.proxy(move, this, FOCUS_LEFT),
                            rightArrow: $.proxy(move, this, FOCUS_RIGHT),
                            upArrow: $.proxy(move, this, FOCUS_UP),
                            downArrow: $.proxy(move, this, FOCUS_DOWN),
                            pageUp: $.proxy(move, this, FOCUS_UP),
                            pageDown: $.proxy(move, this, FOCUS_DOWN),
                            home: $.proxy(move, this, FOCUS_FIRST),
                            end: $.proxy(move, this, FOCUS_LAST)
                        })
                },
                _setDeprecatedOptions: function() {
                    this.callBase();
                    $.extend(this._deprecatedOptions, {
                        itemClickAction: {
                            since: "14.2",
                            alias: "onItemClick"
                        },
                        itemHoldAction: {
                            since: "14.2",
                            alias: "onItemHold"
                        },
                        itemRenderedAction: {
                            since: "14.2",
                            alias: "onItemRendered"
                        },
                        itemRender: {
                            since: "14.2",
                            alias: "itemTemplate"
                        }
                    })
                },
                _setDefaultOptions: function() {
                    this.callBase();
                    this.option({
                        selectOnFocus: false,
                        loopItemFocus: true,
                        items: [],
                        itemTemplate: "item",
                        onItemRendered: null,
                        onItemClick: null,
                        onItemHold: null,
                        itemHoldTimeout: 750,
                        onItemContextMenu: null,
                        noDataText: Globalize.localize("dxCollectionWidget-noDataText"),
                        dataSource: null,
                        itemTemplateProperty: "template"
                    })
                },
                _init: function() {
                    this.callBase();
                    this._cleanRenderedItems();
                    this._refreshDataSource()
                },
                _initTemplates: function() {
                    this._initItemsFromMarkup();
                    this.callBase()
                },
                _initItemsFromMarkup: function() {
                    var $items = this.element().contents().filter(ITEMS_SELECTOR);
                    if (!$items.length || this.option("items").length)
                        return;
                    var items = $.map($items, $.proxy(function(item) {
                            var $item = $(item);
                            var result = utils.getElementOptions(item).dxItem;
                            var isTemplateRequired = $.trim($item.html()) && !result.template;
                            if (isTemplateRequired)
                                result.template = this._prepareItemTemplate($item);
                            else
                                $item.remove();
                            return result
                        }, this));
                    this.option("items", items)
                },
                _prepareItemTemplate: function($item) {
                    var templateId = ITEM_TEMPLATE_ID_PREFIX + new DX.data.Guid;
                    var templateOptions = "dxTemplate: { name: '" + templateId + "' }";
                    $item.attr("data-options", templateOptions).data("options", templateOptions);
                    return templateId
                },
                _dataSourceOptions: function() {
                    var options = {
                            paginate: false,
                            _preferSync: false
                        };
                    if ($.isArray(this.option("dataSource")))
                        options._preferSync = true;
                    return options
                },
                _cleanRenderedItems: function() {
                    this._renderedItemsCount = 0
                },
                _focusTarget: function() {
                    return this.element()
                },
                _focusElementClass: function() {
                    return this._itemClass()
                },
                _focusInHandler: function(e) {
                    this.callBase.apply(this, arguments);
                    var elementClass = this._focusElementClass(),
                        $target = $(e.target).closest("." + elementClass);
                    if ($target.hasClass(elementClass)) {
                        this._resetFocusedItem($target);
                        return
                    }
                    var $activeItem = this._getActiveItem();
                    this._setFocusedItem($activeItem.closest("." + elementClass))
                },
                _focusOutHandler: function(e) {
                    this.callBase.apply(this, arguments);
                    var $target = this._$focusedItem;
                    if ($target)
                        $target.removeClass(FOCUSED_STATE_CLASS)
                },
                _getActiveItem: function(last) {
                    var index = this.option("selectedIndex"),
                        activeElements = this._getActiveElement(),
                        lastIndex = activeElements.length - 1;
                    if (index < 0)
                        index = last ? lastIndex : 0;
                    return this._$focusedItem || activeElements.eq(index)
                },
                _renderFocusTarget: function() {
                    this.callBase.apply(this, arguments);
                    var activeElements = this._getActiveElement();
                    activeElements.attr('tabindex', -1);
                    this.element().attr('aria-activedescendant', 'active')
                },
                _moveFocus: function(location) {
                    var $items = this._itemElements().filter(':visible').not(".dx-state-disabled"),
                        $newTarget;
                    switch (location) {
                        case FOCUS_PAGE_UP:
                        case FOCUS_UP:
                            $newTarget = this._prevItem($items);
                            break;
                        case FOCUS_PAGE_DOWN:
                        case FOCUS_DOWN:
                            $newTarget = this._nextItem($items);
                            break;
                        case FOCUS_RIGHT:
                            $newTarget = this.option("rtlEnabled") ? this._prevItem($items) : this._nextItem($items);
                            break;
                        case FOCUS_LEFT:
                            $newTarget = this.option("rtlEnabled") ? this._nextItem($items) : this._prevItem($items);
                            break;
                        case FOCUS_FIRST:
                            $newTarget = $items.first();
                            break;
                        case FOCUS_LAST:
                            $newTarget = $items.last();
                            break;
                        default:
                            return false
                    }
                    this._resetFocusedItem($newTarget, true)
                },
                _prevItem: function($items) {
                    var $target = this._getActiveItem(),
                        targetIndex = $items.index($target),
                        $last = $items.last(),
                        $item = $($items[targetIndex - 1]),
                        loop = this.option("loopItemFocus");
                    if ($item.length === 0 && loop)
                        $item = $last;
                    return $item
                },
                _nextItem: function($items) {
                    var $target = this._getActiveItem(true),
                        targetIndex = $items.index($target),
                        $first = $items.first(),
                        $item = $($items[targetIndex + 1]),
                        loop = this.option("loopItemFocus");
                    if ($item.length === 0 && loop)
                        $item = $first;
                    return $item
                },
                _setFocusedItem: function($target, isKeyboard) {
                    if (!$target || !$target.length)
                        return;
                    this._$focusedItem = $target;
                    $target.attr('id', 'active');
                    $target.addClass(FOCUSED_STATE_CLASS);
                    if (this.option("selectOnFocus") && isKeyboard)
                        this._selectFocusedItem($target)
                },
                _selectFocusedItem: function($target) {
                    this.selectItem($target)
                },
                _removeFocusedItem: function() {
                    var $target = this._$focusedItem;
                    if ($target) {
                        $target.removeClass(FOCUSED_STATE_CLASS);
                        $target.removeAttr('id')
                    }
                },
                _resetFocusedItem: function($target, isKeyboard) {
                    if ($target.length) {
                        this._removeFocusedItem();
                        this._setFocusedItem($target, isKeyboard)
                    }
                },
                _optionChanged: function(args) {
                    switch (args.name) {
                        case"items":
                        case"itemTemplateProperty":
                            this._cleanRenderedItems();
                            this._invalidate();
                            break;
                        case"dataSource":
                            this._refreshDataSource();
                            if (!this._dataSource)
                                this.option("items", []);
                            this._renderEmptyMessage();
                            break;
                        case"noDataText":
                            this._renderEmptyMessage();
                            break;
                        case"itemTemplate":
                            this._invalidate();
                            break;
                        case"onItemRendered":
                            this._createItemRenderAction();
                            break;
                        case"onItemClick":
                            break;
                        case"onItemHold":
                        case"itemHoldTimeout":
                            this._attachHoldEvent();
                            break;
                        case"onItemContextMenu":
                            this._attachContextMenuEvent();
                            break;
                        case"selectOnFocus":
                        case"loopItemFocus":
                            break;
                        default:
                            this.callBase(args)
                    }
                },
                _expectNextPageLoading: function() {
                    this._startIndexForAppendedItems = 0
                },
                _expectLastItemLoading: function() {
                    this._startIndexForAppendedItems = -1
                },
                _forgetNextPageLoading: function() {
                    this._startIndexForAppendedItems = null
                },
                _dataSourceChangedHandler: function(newItems) {
                    var items = this.option("items");
                    if (this._initialized && items && this._shouldAppendItems()) {
                        this._renderedItemsCount = items.length;
                        if (!this._dataSource.isLastPage() || this._startIndexForAppendedItems !== -1)
                            this.option().items = items.concat(newItems.slice(this._startIndexForAppendedItems));
                        this._renderContent();
                        this._renderFocusTarget()
                    }
                    else
                        this.option("items", newItems)
                },
                _dataSourceLoadErrorHandler: function() {
                    this._forgetNextPageLoading()
                },
                _shouldAppendItems: function() {
                    return this._startIndexForAppendedItems != null && this._allowDinamicItemsAppend()
                },
                _allowDinamicItemsAppend: function() {
                    return false
                },
                _clean: function() {
                    this._cleanFocusState();
                    this._itemContainer().empty()
                },
                _refresh: function() {
                    this._cleanRenderedItems();
                    this.callBase.apply(this, arguments)
                },
                _itemContainer: function() {
                    return this.element()
                },
                _itemClass: function() {
                    return ITEM_CLASS
                },
                _selectedItemClass: function() {
                    return SELECTED_ITEM_CLASS
                },
                _itemResponseWaitClass: function() {
                    return ITEM_RESPONSE_WAIT_CLASS
                },
                _itemSelector: function() {
                    return "." + this._itemClass()
                },
                _itemDataKey: function() {
                    return ITEM_DATA_KEY
                },
                _itemElements: function() {
                    return this._itemContainer().find(this._itemSelector())
                },
                _render: function() {
                    this.callBase();
                    this.element().addClass(COLLECTION_CLASS);
                    this._attachClickEvent();
                    this._attachHoldEvent();
                    this._attachContextMenuEvent()
                },
                _attachClickEvent: function() {
                    var itemSelector = this._itemSelector(),
                        eventName = events.addNamespace("dxclick", this.NAME);
                    this._itemContainer().off(eventName, itemSelector).on(eventName, itemSelector, $.proxy(this._itemClickHandler, this))
                },
                _itemClickHandler: function(e) {
                    this._itemJQueryEventHandler(e, "onItemClick")
                },
                _attachHoldEvent: function() {
                    var $itemContainer = this._itemContainer(),
                        itemSelector = this._itemSelector(),
                        eventName = events.addNamespace("dxhold", this.NAME);
                    $itemContainer.off(eventName, itemSelector);
                    if (this._shouldAttachHoldEvent())
                        $itemContainer.on(eventName, itemSelector, {timeout: this._getHoldTimeout()}, $.proxy(this._itemHoldHandler, this))
                },
                _getHoldTimeout: function() {
                    return this.option("itemHoldTimeout")
                },
                _shouldAttachHoldEvent: function() {
                    return this.option("onItemHold")
                },
                _itemHoldHandler: function(e) {
                    this._itemJQueryEventHandler(e, "onItemHold")
                },
                _attachContextMenuEvent: function() {
                    var $itemContainer = this._itemContainer(),
                        itemSelector = this._itemSelector(),
                        eventName = events.addNamespace("dxcontextmenu", this.NAME);
                    $itemContainer.off(eventName, itemSelector);
                    if (this._shouldAttachContextMenuEvent())
                        $itemContainer.on(eventName, itemSelector, $.proxy(this._itemContextMenuHandler, this))
                },
                _shouldAttachContextMenuEvent: function() {
                    return this.option("onItemContextMenu")
                },
                _itemContextMenuHandler: function(e) {
                    this._itemJQueryEventHandler(e, "onItemContextMenu")
                },
                _renderContentImpl: function() {
                    var items = this.option("items") || [];
                    if (this._renderedItemsCount)
                        this._renderItems(items.slice(this._renderedItemsCount));
                    else
                        this._renderItems(items)
                },
                _renderItems: function(items) {
                    if (items.length)
                        $.each(items, $.proxy(this._renderItem, this));
                    this._renderEmptyMessage()
                },
                _renderItem: function(index, itemData, $container) {
                    $container = $container || this._itemContainer();
                    var $itemFrame = this._renderItemFrame(index, itemData, $container);
                    this._setElementData($itemFrame, itemData);
                    var $itemContent = $itemFrame.find("." + ITEM_CONTENT_PLACEHOLDER_CLASS);
                    $itemContent.removeClass(ITEM_CONTENT_PLACEHOLDER_CLASS);
                    $itemContent = this._renderItemContent(index, itemData, $itemContent);
                    this._postprocessRenderItem({
                        itemElement: $itemFrame,
                        itemContent: $itemContent,
                        itemData: itemData,
                        itemIndex: index
                    });
                    this._executeItemRenderAction(itemData, $itemFrame);
                    return $itemFrame
                },
                _renderItemContent: function(index, itemData, $container) {
                    var $itemNode = itemData && itemData.node;
                    var itemTemplateName = this._getItemTemplateName(itemData);
                    var itemTemplate = this._getTemplate(itemTemplateName, itemData, index, $container);
                    var renderArgs = {
                            index: index,
                            item: itemData,
                            container: $container
                        };
                    if ($itemNode) {
                        $container.replaceWith($itemNode);
                        $container = $itemNode;
                        this._addItemContentClasses($container, itemData)
                    }
                    else {
                        this._addItemContentClasses($container, itemData);
                        var $result = this._createItemByTemplate(itemTemplate, renderArgs);
                        if ($result.length) {
                            $container.replaceWith($result);
                            $container = $result;
                            this._addItemContentClasses($container, itemData)
                        }
                    }
                    return $container
                },
                _addItemContentClasses: function($container) {
                    $container.addClass(ITEM_CLASS + CONTENT_CLASS_POSTFIX);
                    $container.addClass(this._itemClass() + CONTENT_CLASS_POSTFIX)
                },
                _renderItemFrame: function(index, itemData, $container) {
                    var itemFrameTemplate = this._templateProvider.getTemplates(this)["itemFrame"],
                        $itemFrame = itemFrameTemplate.render(utils.isDefined(itemData) ? itemData : {}, $container, index);
                    $itemFrame.appendTo($container);
                    return $itemFrame
                },
                _postprocessRenderItem: $.noop,
                _executeItemRenderAction: function(itemData, itemElement) {
                    this._getItemRenderAction()({
                        itemElement: itemElement,
                        itemData: itemData
                    })
                },
                _setElementData: function(element, data) {
                    element.addClass(ITEM_CLASS).addClass(this._itemClass()).data(this._itemDataKey(), data)
                },
                _createItemRenderAction: function() {
                    return this._itemRenderAction = this._createActionByOption("onItemRendered", {
                            element: this.element(),
                            excludeValidators: ["designMode", "disabled"]
                        })
                },
                _getItemRenderAction: function() {
                    return this._itemRenderAction || this._createItemRenderAction()
                },
                _getItemTemplateName: function(itemData) {
                    var templateProperty = this.option("itemTemplateProperty");
                    return itemData && itemData[templateProperty] || this.option("itemTemplate")
                },
                _createItemByTemplate: function(itemTemplate, renderArgs) {
                    var result = itemTemplate.render(renderArgs.item, renderArgs.container, renderArgs.index, "ignoreTarget");
                    if (typeof result === "string")
                        result = DX.utils.htmlToJQuery(result);
                    return result
                },
                _renderEmptyMessage: function() {
                    var noDataText = this.option("noDataText"),
                        items = this.option("items"),
                        dataSourceLoading = this._dataSource && this._dataSource.isLoading(),
                        hideNoData = !noDataText || items && items.length || dataSourceLoading;
                    if (hideNoData && this._$nodata) {
                        this._$nodata.remove();
                        this._$nodata = null
                    }
                    if (!hideNoData) {
                        this._$nodata = this._$nodata || $("<div>").addClass("dx-empty-message");
                        this._$nodata.appendTo(this._itemContainer()).html(noDataText)
                    }
                    this.element().toggleClass(EMPTY_COLLECTION, !hideNoData)
                },
                _itemJQueryEventHandler: function(jQueryEvent, handlerOptionName, actionArgs, actionConfig) {
                    this._itemEventHandler(jQueryEvent.target, handlerOptionName, $.extend(actionArgs, {jQueryEvent: jQueryEvent}), actionConfig)
                },
                _itemEventHandler: function(initiator, handlerOptionName, actionArgs, actionConfig) {
                    var action = this._createActionByOption(handlerOptionName, $.extend({validatingTargetName: "itemElement"}, actionConfig));
                    return this._itemEventHandlerImpl(initiator, action, actionArgs)
                },
                _itemEventHandlerByHandler: function(initiator, handler, actionArgs, actionConfig) {
                    var action = this._createAction(handler, $.extend({validatingTargetName: "itemElement"}, actionConfig));
                    return this._itemEventHandlerImpl(initiator, action, actionArgs)
                },
                _itemEventHandlerImpl: function(initiator, action, actionArgs) {
                    var $itemElement = this._closestItemElement($(initiator));
                    return action($.extend(this._extendActionArgs($itemElement), actionArgs))
                },
                _extendActionArgs: function($itemElement) {
                    return {
                            itemElement: $itemElement,
                            itemIndex: $itemElement.index(this._itemSelector()),
                            itemData: this._getItemData($itemElement)
                        }
                },
                _closestItemElement: function($element) {
                    return $($element).closest(this._itemSelector())
                },
                _getItemData: function(itemElement) {
                    return $(itemElement).data(this._itemDataKey())
                },
                _isLastPage: function() {
                    return !this._dataSource || this._dataSource.isLastPage() || !this._dataSource._pageSize
                },
                itemElements: function() {
                    return this._itemElements()
                },
                itemsContainer: function() {
                    return this._itemContainer()
                }
            }).include(ui.DataHelperMixin);
        ui.CollectionWidget = CollectionWidget
    })(jQuery, DevExpress);
    /*! Module core, file ui.CollectionWidget.edit.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events;
        var ITEM_DELETING_DATA_KEY = "dxItemDeleting";
        var CollectionWidget = ui.CollectionWidget.inherit({
                _setOptionsByReference: function() {
                    this.callBase();
                    $.extend(this._optionsByReference, {selectedItem: true})
                },
                _setDeprecatedOptions: function() {
                    this.callBase();
                    $.extend(this._deprecatedOptions, {itemSelectAction: {
                            since: "14.2",
                            message: "Use the 'onSelectionChanged' option instead"
                        }})
                },
                _setDefaultOptions: function() {
                    this.callBase();
                    this.option({
                        selectionMode: 'none',
                        selectionRequired: false,
                        selectionByClick: true,
                        selectedItems: [],
                        selectedIndex: -1,
                        selectedItem: null,
                        onSelectionChanged: null,
                        onItemReordered: null,
                        onItemDeleting: null,
                        onItemDeleted: null
                    })
                },
                _init: function() {
                    this.callBase();
                    this._initEditStrategy();
                    this._selectedItemIndices = []
                },
                _initEditStrategy: function() {
                    var strategy = ui.CollectionWidget.PlainEditStrategy;
                    this._editStrategy = new strategy(this)
                },
                _render: function() {
                    this._syncSelectionOptions();
                    this._normalizeSelectedItems();
                    this._initSelectedItems();
                    this.callBase();
                    this._renderSelection(this._selectedItemIndices, [])
                },
                _syncSelectionOptions: function(byOption) {
                    var items = this.option("items") || [],
                        selectedItems = this.option("selectedItems") || [],
                        selectedItem = this.option("selectedItem"),
                        selectedIndex = this.option("selectedIndex");
                    byOption = byOption || this._chooseSelectOption();
                    switch (byOption) {
                        case"selectedItems":
                            this._setOptionSilent("selectedItem", selectedItems[0]);
                            this._setOptionSilent("selectedIndex", $.inArray(selectedItems[0], items));
                            break;
                        case"selectedItem":
                            if (utils.isDefined(selectedItem)) {
                                this._setOptionSilent("selectedItems", [selectedItem]);
                                this._setOptionSilent("selectedIndex", $.inArray(selectedItem, items))
                            }
                            else {
                                this._setOptionSilent("selectedItems", []);
                                this._setOptionSilent("selectedIndex", -1)
                            }
                            break;
                        case"selectedIndex":
                            if (utils.isDefined(items[selectedIndex])) {
                                this._setOptionSilent("selectedItems", [items[selectedIndex]]);
                                this._setOptionSilent("selectedItem", items[selectedIndex])
                            }
                            else {
                                this._setOptionSilent("selectedItems", []);
                                this._setOptionSilent("selectedItem", null)
                            }
                            break
                    }
                },
                _chooseSelectOption: function() {
                    var optionName = "selectedIndex";
                    if (this.option("selectedItems").length)
                        optionName = "selectedItems";
                    else if (utils.isDefined(this.option("selectedItem")))
                        optionName = "selectedItem";
                    return optionName
                },
                _normalizeSelectedItems: function() {
                    if (this.option("selectionMode") === "none") {
                        this._setOptionSilent("selectedItems", []);
                        this._syncSelectionOptions("selectedItems")
                    }
                    else if (this.option("selectionMode") === "single") {
                        var newSelection = this._editStrategy.selectedItemIndices(this.option("selectedItems"));
                        if (newSelection.length > 1 || !newSelection.length && this.option("selectionRequired") && this.option("items") && this.option("items").length) {
                            var normalizedSelection = [newSelection[0] || this._selectedItemIndices[0] || 0];
                            this._setOptionSilent("selectedItems", this._editStrategy.fetchSelectedItems(normalizedSelection));
                            this._syncSelectionOptions("selectedItems")
                        }
                    }
                },
                _initSelectedItems: function() {
                    this._selectedItemIndices = this._editStrategy.selectedItemIndices(this.option("selectedItems"))
                },
                _renderSelection: $.noop,
                _itemClickHandler: function(e) {
                    this._createAction($.proxy(function(e) {
                        this._itemSelectHandler(e.jQueryEvent)
                    }, this), {validatingTargetName: "itemElement"})({
                        itemElement: $(e.currentTarget),
                        jQueryEvent: e
                    });
                    this.callBase.apply(this, arguments)
                },
                _itemSelectHandler: function(e) {
                    if (!this.option("selectionByClick"))
                        return;
                    var $itemElement = e.currentTarget;
                    if (this.isItemSelected($itemElement))
                        this.unselectItem(e.currentTarget);
                    else
                        this.selectItem(e.currentTarget)
                },
                _selectedItemElement: function(index) {
                    return this._itemElements().eq(index)
                },
                _postprocessRenderItem: function(args) {
                    var $itemElement = $(args.itemElement);
                    if (this._isItemSelected(this._editStrategy.getNormalizedIndex($itemElement)))
                        $itemElement.addClass(this._selectedItemClass())
                },
                _updateSelectedItems: function() {
                    var oldSelection = this._selectedItemIndices.slice(),
                        newSelection = this._editStrategy.selectedItemIndices(),
                        addedSelection = utils.removeDublicates(newSelection, oldSelection),
                        removedSelection = utils.removeDublicates(oldSelection, newSelection);
                    $.each(removedSelection, $.proxy(function(_, normalizedIndex) {
                        this._removeSelection(normalizedIndex)
                    }, this));
                    $.each(addedSelection, $.proxy(function(_, normalizedIndex) {
                        this._addSelection(normalizedIndex)
                    }, this));
                    if (removedSelection.length || addedSelection.length) {
                        var selectionChangePromise = this._selectionChangePromise;
                        this._updateSelection(addedSelection, removedSelection);
                        $.when(selectionChangePromise).done($.proxy(function() {
                            this._fireSelectItemEvent(addedSelection, removedSelection);
                            this._fireSelectionChangeEvent(addedSelection, removedSelection)
                        }, this))
                    }
                },
                _fireSelectionChangeEvent: function(addedSelection, removedSelection) {
                    this._createActionByOption("onSelectionChanged", {excludeValidators: ["disabled"]})({
                        addedItems: this._editStrategy.fetchSelectedItems(addedSelection),
                        removedItems: this._editStrategy.fetchSelectedItems(removedSelection)
                    })
                },
                _fireSelectItemEvent: function(addedSelection, removedSelection) {
                    if (this.NAME === "dxList" && this.option("selectionMode") !== "single")
                        return;
                    this._itemEventHandler(this._selectedItemElement(addedSelection[0]), "itemSelectAction", {
                        selectedIndex: addedSelection[0],
                        previousIndex: removedSelection[0]
                    }, {excludeValidators: ["disabled"]})
                },
                _updateSelection: function() {
                    this._renderSelection.apply(this, arguments)
                },
                _removeSelection: function(normalizedIndex) {
                    var $itemElement = this._editStrategy.getItemElement(normalizedIndex),
                        itemSelectionIndex = $.inArray(normalizedIndex, this._selectedItemIndices);
                    if (itemSelectionIndex > -1) {
                        $itemElement.removeClass(this._selectedItemClass());
                        this._selectedItemIndices.splice(itemSelectionIndex, 1);
                        $itemElement.triggerHandler("stateChanged");
                        if (this.NAME === "dxList")
                            this._itemEventHandler($itemElement, "itemUnselectAction", {}, {excludeValidators: ["disabled"]})
                    }
                },
                _addSelection: function(normalizedIndex) {
                    var $itemElement = this._editStrategy.getItemElement(normalizedIndex);
                    if (normalizedIndex > -1 && !this._isItemSelected(normalizedIndex)) {
                        $itemElement.addClass(this._selectedItemClass());
                        this._selectedItemIndices.push(normalizedIndex);
                        $itemElement.triggerHandler("stateChanged");
                        if (this.NAME === "dxList")
                            this._itemEventHandler($itemElement, "itemSelectAction", {}, {excludeValidators: ["disabled"]})
                    }
                },
                _isItemSelected: function(index) {
                    return $.inArray(index, this._selectedItemIndices) > -1
                },
                _selectAllItems: function() {
                    this.option("selectedItems", this.option("items").slice())
                },
                _unselectAllItems: function() {
                    this.option("selectedItems", [])
                },
                _optionChanged: function(args) {
                    if (this._cancelOptionChange)
                        return;
                    switch (args.name) {
                        case"items":
                            if (args.previousValue && args.previousValue.length > 0)
                                this._clearSelectedItems();
                            this.callBase(args);
                            break;
                        case"selectionMode":
                            this._invalidate();
                            break;
                        case"selectedIndex":
                        case"selectedItem":
                        case"selectedItems":
                            this._syncSelectionOptions(args.name);
                            this._normalizeSelectedItems();
                            this._updateSelectedItems();
                            break;
                        case"selectionByClick":
                        case"selectionRequired":
                        case"onSelectionChanged":
                        case"onItemDeleting":
                        case"onItemDeleted":
                        case"onItemReordered":
                        case"itemSelectAction":
                        case"itemUnselectAction":
                            break;
                        default:
                            this.callBase(args)
                    }
                },
                _clearSelectedItems: function() {
                    this._selectedItemIndices = [];
                    this.option("selectedItems", [])
                },
                _setOptionSilent: function(name, value) {
                    this._cancelOptionChange = true;
                    this.option(name, value);
                    this._cancelOptionChange = false
                },
                _waitDeletingPrepare: function($itemElement) {
                    if ($itemElement.data(ITEM_DELETING_DATA_KEY))
                        return $.Deferred().resolve().promise();
                    $itemElement.data(ITEM_DELETING_DATA_KEY, true);
                    var deferred = $.Deferred(),
                        deletePromise = this._itemEventHandler($itemElement, "onItemDeleting", {}, {excludeValidators: ["disabled"]});
                    $.when(deletePromise).always($.proxy(function(value) {
                        var deletePromiseExists = !deletePromise,
                            deletePromiseResolved = !deletePromiseExists && deletePromise.state() === "resolved",
                            argumentsSpecified = !!arguments.length,
                            shouldDelete = deletePromiseExists || deletePromiseResolved && !argumentsSpecified || deletePromiseResolved && value;
                        $itemElement.data(ITEM_DELETING_DATA_KEY, false);
                        shouldDelete ? deferred.resolve() : deferred.reject()
                    }, this));
                    return deferred.promise()
                },
                _deleteItemFromDS: function($item) {
                    if (!this._dataSource)
                        return $.Deferred().resolve().promise();
                    var that = this,
                        deferred = $.Deferred(),
                        disabledState = this.option("disabled"),
                        dataStore = this._dataSource.store();
                    this.option("disabled", true);
                    if (!dataStore.remove)
                        throw DX.Error("E1011");
                    dataStore.remove(dataStore.keyOf(this._getItemData($item))).done(function(key) {
                        if (key !== undefined)
                            deferred.resolve();
                        else
                            deferred.reject()
                    }).fail(function() {
                        deferred.reject()
                    });
                    deferred.always($.proxy(function() {
                        this.option("disabled", disabledState)
                    }, this));
                    return deferred
                },
                _tryRefreshLastPage: function() {
                    var deferred = $.Deferred();
                    if (this._isLastPage() || this.option("grouped"))
                        deferred.resolve();
                    else
                        this._refreshLastPage().done(function() {
                            deferred.resolve()
                        });
                    return deferred.promise()
                },
                _refreshLastPage: function() {
                    this._expectLastItemLoading();
                    return this._dataSource.load()
                },
                _updateSelectionAfterDelete: function(fromIndex) {
                    var itemIndex = $.inArray(fromIndex, this._selectedItemIndices);
                    if (itemIndex > -1)
                        this._selectedItemIndices.splice(itemIndex, 1);
                    this._editStrategy.updateSelectionAfterDelete(fromIndex);
                    this.option("selectedItems", this._editStrategy.fetchSelectedItems())
                },
                _simulateOptionChange: function(optionName) {
                    var optionValue = this.option(optionName);
                    if (optionValue instanceof DX.data.DataSource)
                        return;
                    this.fireEvent("optionChanged", [{
                            name: optionName,
                            fullName: optionName,
                            value: optionValue
                        }])
                },
                isItemSelected: function(itemElement) {
                    return this._isItemSelected(this._editStrategy.getNormalizedIndex(itemElement))
                },
                selectItem: function(itemElement) {
                    var itemIndex = this._editStrategy.getNormalizedIndex(itemElement);
                    if (itemIndex === -1)
                        return;
                    var itemSelectionIndex = $.inArray(itemIndex, this._selectedItemIndices);
                    if (itemSelectionIndex !== -1)
                        return;
                    if (this.option("selectionMode") === "single")
                        this.option("selectedItems", this._editStrategy.fetchSelectedItems([itemIndex]));
                    else {
                        var newSelectedIndices = this._selectedItemIndices.slice();
                        newSelectedIndices.push(itemIndex);
                        this.option("selectedItems", this._editStrategy.fetchSelectedItems(newSelectedIndices))
                    }
                },
                unselectItem: function(itemElement) {
                    var itemIndex = this._editStrategy.getNormalizedIndex(itemElement);
                    if (itemIndex === -1)
                        return;
                    var itemSelectionIndex = $.inArray(itemIndex, this._selectedItemIndices);
                    if (itemSelectionIndex === -1)
                        return;
                    var newSelectedIndices = this._selectedItemIndices.slice();
                    newSelectedIndices.splice(itemSelectionIndex, 1);
                    if (this.option("selectionRequired") && newSelectedIndices.length === 0)
                        return;
                    this.option("selectedItems", this._editStrategy.fetchSelectedItems(newSelectedIndices))
                },
                deleteItem: function(itemElement) {
                    var that = this,
                        deferred = $.Deferred(),
                        $item = this._editStrategy.getItemElement(itemElement),
                        index = this._editStrategy.getNormalizedIndex(itemElement),
                        changingOption = this._dataSource ? "dataSource" : "items",
                        itemResponseWaitClass = this._itemResponseWaitClass();
                    if (index > -1)
                        this._waitDeletingPrepare($item).done(function() {
                            $item.addClass(itemResponseWaitClass);
                            that._deleteItemFromDS($item).done(function() {
                                $item.detach();
                                that._editStrategy.deleteItemAtIndex(index);
                                that._simulateOptionChange(changingOption);
                                that._updateSelectionAfterDelete(index);
                                that._itemEventHandler($item, "onItemDeleted", {}, {excludeValidators: ["disabled"]});
                                that._renderEmptyMessage();
                                that._tryRefreshLastPage().done(function() {
                                    deferred.resolveWith(that)
                                })
                            }).fail(function() {
                                $item.removeClass(itemResponseWaitClass);
                                deferred.rejectWith(that)
                            })
                        }).fail(function() {
                            deferred.rejectWith(that)
                        });
                    else
                        deferred.rejectWith(that);
                    return deferred.promise()
                },
                reorderItem: function(itemElement, toItemElement) {
                    var deferred = $.Deferred(),
                        that = this,
                        strategy = this._editStrategy,
                        $movingItem = strategy.getItemElement(itemElement),
                        $destinationItem = strategy.getItemElement(toItemElement),
                        movingIndex = strategy.getNormalizedIndex(itemElement),
                        destinationIndex = strategy.getNormalizedIndex(toItemElement),
                        changingOption;
                    var canMoveItems = movingIndex > -1 && destinationIndex > -1 && movingIndex !== destinationIndex;
                    if (canMoveItems)
                        if (this._dataSource) {
                            changingOption = "dataSource";
                            deferred.resolveWith(this)
                        }
                        else {
                            changingOption = "items";
                            deferred.resolveWith(this)
                        }
                    else
                        deferred.rejectWith(this);
                    return deferred.promise().done(function() {
                            $destinationItem[strategy.itemPlacementFunc(movingIndex, destinationIndex)]($movingItem);
                            var newSelectedItems = strategy.getSelectedItemsAfterReorderItem(movingIndex, destinationIndex);
                            strategy.moveItemAtIndexToIndex(movingIndex, destinationIndex);
                            that._selectedItemIndices = strategy.selectedItemIndices(newSelectedItems);
                            that.option("selectedItems", strategy.fetchSelectedItems());
                            that._simulateOptionChange(changingOption);
                            that._itemEventHandler($movingItem, "onItemReordered", {
                                fromIndex: strategy.getIndex(movingIndex),
                                toIndex: strategy.getIndex(destinationIndex)
                            }, {excludeValidators: ["disabled"]})
                        })
                }
            });
        ui.CollectionWidget = CollectionWidget
    })(jQuery, DevExpress);
    /*! Module core, file ui.collectionWidget.edit.strategy.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        ui.CollectionWidget.EditStrategy = DX.Class.inherit({
            ctor: function(collectionWidget) {
                this._collectionWidget = collectionWidget
            },
            getNormalizedIndex: function(value) {
                if (this._isNormalisedItemIndex(value))
                    return value;
                if (this._isItemIndex(value))
                    return this._normalizeItemIndex(value);
                return this._getNormalizedItemIndex(value)
            },
            getIndex: function(value) {
                if (this._isNormalisedItemIndex(value))
                    return this._denormalizeItemIndex(value);
                if (this._isItemIndex(value))
                    return value;
                return this._denormalizeItemIndex(this._getNormalizedItemIndex(value))
            },
            getItemElement: function(value) {
                if (this._isNormalisedItemIndex(value))
                    return this._getItemByNormalizedIndex(value);
                if (this._isItemIndex(value))
                    return this._getItemByNormalizedIndex(this._normalizeItemIndex(value));
                return $(value)
            },
            deleteItemAtIndex: DX.abstract,
            updateSelectionAfterDelete: DX.abstract,
            fetchSelectedItems: DX.abstract,
            selectedItemIndices: DX.abstract,
            itemPlacementFunc: function(movingIndex, destinationIndex) {
                return this._itemsFromSameParent(movingIndex, destinationIndex) && movingIndex < destinationIndex ? "after" : "before"
            },
            moveItemAtIndexToIndex: DX.abstract,
            getSelectedItemsAfterReorderItem: function() {
                return this._collectionWidget.option("selectedItems")
            },
            _isNormalisedItemIndex: function(index) {
                return $.isNumeric(index)
            },
            _isItemIndex: DX.abstract,
            _getNormalizedItemIndex: DX.abstract,
            _normalizeItemIndex: DX.abstract,
            _denormalizeItemIndex: DX.abstract,
            _getItemByNormalizedIndex: DX.abstract,
            _itemsFromSameParent: DX.abstract
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.collectionWidget.edit.strategy.plain.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        ui.CollectionWidget.PlainEditStrategy = ui.CollectionWidget.EditStrategy.inherit({
            deleteItemAtIndex: function(index) {
                this._collectionWidget.option("items").splice(index, 1)
            },
            updateSelectionAfterDelete: function(fromIndex) {
                var selectedItemIndices = this._collectionWidget._selectedItemIndices;
                $.each(selectedItemIndices, function(i, index) {
                    if (index > fromIndex)
                        selectedItemIndices[i] -= 1
                })
            },
            fetchSelectedItems: function(indices) {
                indices = indices || this._collectionWidget._selectedItemIndices;
                var items = this._collectionWidget.option("items"),
                    selectedItems = [];
                $.each(indices, function(_, index) {
                    selectedItems.push(items[index])
                });
                return selectedItems
            },
            selectedItemIndices: function() {
                var selectedIndices = [],
                    items = this._collectionWidget.option("items"),
                    selected = this._collectionWidget.option("selectedItems");
                $.each(selected, function(_, selectedItem) {
                    var index = $.inArray(selectedItem, items);
                    if (index !== -1)
                        selectedIndices.push(index);
                    else
                        DX.log("W1002", selectedItem)
                });
                return selectedIndices
            },
            moveItemAtIndexToIndex: function(movingIndex, destinationIndex) {
                var items = this._collectionWidget.option("items"),
                    movedItemData = items[movingIndex];
                items.splice(movingIndex, 1);
                items.splice(destinationIndex, 0, movedItemData)
            },
            _isItemIndex: function(index) {
                return $.isNumeric(index)
            },
            _getNormalizedItemIndex: function(itemElement) {
                return this._collectionWidget._itemElements().index(itemElement)
            },
            _normalizeItemIndex: function(index) {
                return index
            },
            _denormalizeItemIndex: function(index) {
                return index
            },
            _getItemByNormalizedIndex: function(index) {
                return this._collectionWidget._itemElements().eq(index)
            },
            _itemsFromSameParent: function() {
                return true
            }
        })
    })(jQuery, DevExpress);
    /*! Module core, file ui.tooltip.js */
    (function($, DX, undefined) {
        var $tooltip = null;
        var createTooltip = function(options) {
                options = $.extend({position: "top"}, options);
                var content = options.content;
                delete options.content;
                return $("<div />").html(content).appendTo(DX.viewPort()).dxTooltip(options)
            };
        var removeTooltip = function() {
                if (!$tooltip)
                    return;
                $tooltip.remove();
                $tooltip = null
            };
        var tooltip = {
                show: function(options) {
                    removeTooltip();
                    $tooltip = createTooltip(options);
                    return $tooltip.dxTooltip("show")
                },
                hide: function() {
                    if (!$tooltip)
                        return $.when();
                    return $tooltip.dxTooltip("hide").done(removeTooltip).promise()
                }
            };
        DX.ui.tooltip = tooltip
    })(jQuery, DevExpress)
}