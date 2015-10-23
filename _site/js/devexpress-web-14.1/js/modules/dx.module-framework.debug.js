/*! 
* DevExtreme (Single Page App Framework)
* Version: 14.2.3
* Build date: Dec 3, 2014
*
* Copyright (c) 2012 - 2014 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
*/

"use strict";
if (!DevExpress.MOD_FRAMEWORK) {
    if (!window.DevExpress)
        throw Error('Required module is not referenced: core');
    /*! Module framework, file framework.js */
    (function($, DX, undefined) {
        var mergeWithReplace = function(targetArray, arrayToMerge, needReplaceFn) {
                var result = [];
                for (var i = 0, length = targetArray.length; i < length; i++)
                    if (!needReplaceFn(targetArray[i], arrayToMerge))
                        result.push(targetArray[i]);
                result.push.apply(result, arrayToMerge);
                return result
            };
        var prepareCommandToReplace = function(targetCommand, commandsToMerge) {
                var needToReplace = false;
                $.each(commandsToMerge, function(_, commandToMerge) {
                    var idEqual = targetCommand.option("id") === commandToMerge.option("id") && commandToMerge.option("id"),
                        behaviorEqual = targetCommand.option("behavior") === commandToMerge.option("behavior") && targetCommand.option("behavior");
                    needToReplace = idEqual || behaviorEqual;
                    if (behaviorEqual && commandToMerge.option("onExecute") === null)
                        commandToMerge.option("onExecute", targetCommand.option("onExecute"));
                    if (needToReplace) {
                        targetCommand.element().remove();
                        return false
                    }
                });
                return needToReplace
            };
        var mergeCommands = function(targetCommands, commandsToMerge) {
                return mergeWithReplace(targetCommands, commandsToMerge, prepareCommandToReplace)
            };
        var resolvePropertyValue = function(command, containerOptions, propertyName, defaultValue) {
                var containerOption = containerOptions ? containerOptions[propertyName] : undefined,
                    defaultOption = containerOption === undefined ? defaultValue : containerOption,
                    commandOption = command.option(propertyName);
                return commandOption === undefined || commandOption === defaultValue ? defaultOption : commandOption
            };
        var resolveTextValue = function(command, containerOptions) {
                var showText = resolvePropertyValue(command, containerOptions, "showText"),
                    hasIcon = !!command.option("icon") || command.option("iconSrc"),
                    titleValue = resolvePropertyValue(command, containerOptions, "title", "");
                return showText || !hasIcon ? titleValue : ""
            };
        var resolveIconValue = function(command, containerOptions, propertyName) {
                var showIcon = resolvePropertyValue(command, containerOptions, "showIcon"),
                    hasText = !!command.option("title"),
                    iconValue = resolvePropertyValue(command, containerOptions, propertyName, "");
                return showIcon || !hasText ? iconValue : ""
            };
        var resolveTypeValue = function(command, containerOptions) {
                return resolvePropertyValue(command, containerOptions, "type")
            };
        DX.framework = {
            utils: {
                mergeCommands: mergeCommands,
                commandToContainer: {
                    resolveTypeValue: resolveTypeValue,
                    resolveIconValue: resolveIconValue,
                    resolveTextValue: resolveTextValue,
                    resolvePropertyValue: resolvePropertyValue
                }
            },
            templateProvider: DX.ui.KoTemplateProvider ? new DX.ui.KoTemplateProvider : undefined
        }
    })(jQuery, DevExpress);
    /*! Module framework, file framework.errors.js */
    (function($, DX) {
        $.extend(DX.ERROR_MESSAGES, {
            E3001: "Routing rule is not found for the '{0}' URI.",
            E3002: "The passed object cannot be formatted into a URI string by the application's router. An appropriate route should be registered.",
            E3003: "Unable to navigate. Application is being initialized.",
            E3004: "Cannot execute the command: {0}.",
            E3005: "The '{0}' command {1} is not registered in the application's command mapping. Go to http://dxpr.es/1bTjfj1 for more details.",
            E3006: "Unknown navigation target: '{0}'. Use the 'current', 'back' or 'blank' values.",
            E3007: "Error while restoring the application state. The state has been cleared. Refresh the page.",
            E3008: "Unable to go back.",
            E3009: "Unable to go forward.",
            E3010: "The command's 'id' option should be specified.\r\nProcessed markup: {0}\n",
            E3011: "Layout controller cannot be resolved. There are no appropriate layout controllers for the current context. Check browser console for details.",
            E3012: "Layout controller cannot be resolved. Two or more layout controllers suit the current context. Check browser console for details.",
            E3013: "The '{0}' template with the '{1}' name is not found. Make sure the case is correct in the specified view name and the template fits the current context.",
            E3014: "All the children of the dxView element should be either of the dxCommand or dxContent type.\r\nProcessed markup: {0}",
            E3015: "The 'exec' method should be called before the 'finalize' method.",
            E3016: "Unknown transition type '{0}'.",
            E3018: "Unable to parse options.\nMessage: {0};\nOptions value: {1}.",
            E3019: "View templates should be updated according to the 13.1 changes. Go to http://dxpr.es/15ikrJA for more details.",
            E3020: "Concurrent templates are found:\r\n{0}Target device:\r\n{1}.",
            E3021: "Remote template cannot be loaded.\r\nUrl:{0}\r\nError:{1}.",
            E3022: "Cannot initialize the HtmlApplication component.",
            E3023: "Navigation item is not found",
            W3001: "A view with the '{0}' key doesn't exist.",
            W3002: "A view with the '{0}' key has already been released.",
            W3003: "Layout resolving context:\n{0}\nAvailable layout controller registrations:\n{1}\n",
            W3004: "Layout resolving context:\n{0}\nConcurent layout controller registrations for the context:\n{1}\n",
            W3005: "Direct hash-based navigation is detected. Use data-bind=\"dxAction: url\" instead of href=\"#url\".\nFound markup:\n{0}\n"
        })
    })(jQuery, DevExpress);
    /*! Module framework, file framework.routing.js */
    (function($, DX) {
        var JSON_URI_PREFIX = encodeURIComponent("json:");
        var Class = DX.Class;
        DX.framework.Route = Class.inherit({
            _trimSeparators: function(str) {
                return str.replace(/^[\/.]+|\/+$/g, "")
            },
            _escapeRe: function(str) {
                return str.replace(/\W/g, "\\$1")
            },
            _checkConstraint: function(param, constraint) {
                param = String(param);
                if (typeof constraint === "string")
                    constraint = new RegExp(constraint);
                var match = constraint.exec(param);
                if (!match || match[0] !== param)
                    return false;
                return true
            },
            _ensureReady: function() {
                var that = this;
                if (this._patternRe)
                    return false;
                this._pattern = this._trimSeparators(this._pattern);
                this._patternRe = "";
                this._params = [];
                this._segments = [];
                this._separators = [];
                this._pattern.replace(/[^\/]+/g, function(segment, index) {
                    that._segments.push(segment);
                    if (index)
                        that._separators.push(that._pattern.substr(index - 1, 1))
                });
                $.each(this._segments, function(index) {
                    var isStatic = true,
                        segment = this,
                        separator = index ? that._separators[index - 1] : "";
                    if (segment.charAt(0) === ":") {
                        isStatic = false;
                        segment = segment.substr(1);
                        that._params.push(segment);
                        that._patternRe += "(?:" + separator + "([^/]*))";
                        if (segment in that._defaults)
                            that._patternRe += "?"
                    }
                    else
                        that._patternRe += separator + that._escapeRe(segment)
                });
                this._patternRe = new RegExp("^" + this._patternRe + "$")
            },
            ctor: function(pattern, defaults, constraints) {
                this._pattern = pattern || "";
                this._defaults = defaults || {};
                this._constraints = constraints || {}
            },
            parse: function(uri) {
                var that = this;
                this._ensureReady();
                var matches = this._patternRe.exec(uri);
                if (!matches)
                    return false;
                var result = $.extend({}, this._defaults);
                $.each(this._params, function(i) {
                    var index = i + 1;
                    if (matches.length >= index && matches[index])
                        result[this] = that.parseSegment(matches[index])
                });
                $.each(this._constraints, function(key) {
                    if (!that._checkConstraint(result[key], that._constraints[key])) {
                        result = false;
                        return false
                    }
                });
                return result
            },
            format: function(routeValues) {
                var that = this,
                    query = "";
                this._ensureReady();
                var mergeValues = $.extend({}, this._defaults),
                    useStatic = 0,
                    ret = [],
                    dels = [],
                    unusedRouteValues = {};
                $.each(routeValues, function(paramName, paramValue) {
                    routeValues[paramName] = that.formatSegment(paramValue);
                    if (!(paramName in mergeValues))
                        unusedRouteValues[paramName] = true
                });
                $.each(this._segments, function(index, segment) {
                    ret[index] = index ? that._separators[index - 1] : '';
                    if (segment.charAt(0) === ':') {
                        var paramName = segment.substr(1);
                        if (!(paramName in routeValues) && !(paramName in that._defaults)) {
                            ret = null;
                            return false
                        }
                        if (paramName in that._constraints && !that._checkConstraint(routeValues[paramName], that._constraints[paramName])) {
                            ret = null;
                            return false
                        }
                        if (paramName in routeValues) {
                            if (routeValues[paramName] !== undefined) {
                                mergeValues[paramName] = routeValues[paramName];
                                ret[index] += routeValues[paramName];
                                useStatic = index
                            }
                            delete unusedRouteValues[paramName]
                        }
                        else if (paramName in mergeValues) {
                            ret[index] += mergeValues[paramName];
                            dels.push(index)
                        }
                    }
                    else {
                        ret[index] += segment;
                        useStatic = index
                    }
                });
                $.each(mergeValues, function(key, value) {
                    if (!!value && $.inArray(":" + key, that._segments) === -1 && routeValues[key] !== value) {
                        ret = null;
                        return false
                    }
                });
                var unusedCount = 0;
                if (!$.isEmptyObject(unusedRouteValues)) {
                    query = "?";
                    $.each(unusedRouteValues, function(key) {
                        query += key + "=" + routeValues[key] + "&";
                        unusedCount++
                    });
                    query = query.substr(0, query.length - 1)
                }
                if (ret === null)
                    return false;
                if (dels.length)
                    $.map(dels, function(i) {
                        if (i >= useStatic)
                            ret[i] = ''
                    });
                var path = ret.join('');
                path = path.replace(/\/+$/, "");
                return {
                        uri: path + query,
                        unusedCount: unusedCount
                    }
            },
            formatSegment: function(value) {
                if ($.isArray(value) || $.isPlainObject(value))
                    return JSON_URI_PREFIX + encodeURIComponent(JSON.stringify(value));
                return encodeURIComponent(value)
            },
            parseSegment: function(value) {
                if (value.substr(0, JSON_URI_PREFIX.length) === JSON_URI_PREFIX)
                    try {
                        return $.parseJSON(decodeURIComponent(value.substr(JSON_URI_PREFIX.length)))
                    }
                    catch(x) {}
                return decodeURIComponent(value)
            }
        });
        DX.framework.Router = DX.Class.inherit({
            ctor: function() {
                this._registry = []
            },
            _trimSeparators: function(str) {
                return str.replace(/^[\/.]+|\/+$/g, "")
            },
            _createRoute: function(pattern, defaults, constraints) {
                return new DX.framework.Route(pattern, defaults, constraints)
            },
            register: function(pattern, defaults, constraints) {
                this._registry.push(this._createRoute(pattern, defaults, constraints))
            },
            _parseQuery: function(query) {
                var result = {},
                    values = query.split("&");
                $.each(values, function(index, value) {
                    var keyValuePair = value.split("=");
                    result[keyValuePair[0]] = decodeURIComponent(keyValuePair[1])
                });
                return result
            },
            parse: function(uri) {
                var that = this,
                    ret;
                uri = this._trimSeparators(uri);
                var parts = uri.split("?", 2),
                    path = parts[0],
                    query = parts[1];
                $.each(this._registry, function() {
                    var result = this.parse(path);
                    if (result !== false) {
                        ret = result;
                        if (query)
                            ret = $.extend(ret, that._parseQuery(query));
                        return false
                    }
                });
                return ret ? ret : false
            },
            format: function(obj) {
                var ret = false,
                    minUnusedCount = 99999;
                obj = obj || {};
                $.each(this._registry, function() {
                    var toFormat = $.extend(true, {}, obj);
                    var result = this.format(toFormat);
                    if (result !== false)
                        if (minUnusedCount > result.unusedCount) {
                            minUnusedCount = result.unusedCount;
                            ret = result.uri
                        }
                });
                return ret
            }
        });
        DX.framework.Route.__internals = {JSON_URI_PREFIX: JSON_URI_PREFIX}
    })(jQuery, DevExpress);
    /*! Module framework, file framework.command.js */
    (function($, DX) {
        var ui = DX.ui;
        var Command = DX.DOMComponent.inherit({
                ctor: function(element, options) {
                    if ($.isPlainObject(element)) {
                        options = element;
                        element = $("<div />")
                    }
                    this.beforeExecute = $.Callbacks();
                    this.afterExecute = $.Callbacks();
                    this._callbacksToEvents("Command", ["beforeExecute", "afterExecute"]);
                    this.callBase(element, options)
                },
                _setDeprecatedOptions: function() {
                    this.callBase();
                    $.extend(this._deprecatedOptions, {action: {
                            since: "14.2",
                            alias: "onExecute"
                        }})
                },
                _setDefaultOptions: function() {
                    this.callBase();
                    this.option({
                        onExecute: null,
                        id: null,
                        title: "",
                        icon: "",
                        iconSrc: "",
                        visible: true,
                        disabled: false
                    })
                },
                execute: function() {
                    var isDisabled = this._options.disabled;
                    if ($.isFunction(isDisabled))
                        isDisabled = !!isDisabled.apply(this, arguments);
                    if (isDisabled)
                        throw DX.Error("E3004", this._options.id);
                    this.fireEvent("beforeExecute", arguments);
                    this._createActionByOption("onExecute").apply(this, arguments);
                    this.fireEvent("afterExecute", arguments)
                },
                _render: function() {
                    this.callBase();
                    this.element().addClass("dx-command")
                },
                _renderDisabledState: $.noop,
                _dispose: function() {
                    this.callBase();
                    this.element().removeData(this.NAME);
                    this.beforeExecute.empty();
                    this.afterExecute.empty()
                }
            });
        DX.registerComponent("dxCommand", DX.framework, Command)
    })(jQuery, DevExpress);
    /*! Module framework, file framework.commandMapping.js */
    (function($, DX) {
        DX.framework.CommandMapping = DX.Class.inherit({
            ctor: function() {
                this._commandMappings = {};
                this._containerDefaults = {}
            },
            setDefaults: function(containerId, defaults) {
                this._containerDefaults[containerId] = defaults;
                return this
            },
            mapCommands: function(containerId, commandMappings) {
                var that = this;
                $.each(commandMappings, function(index, commandMapping) {
                    if (typeof commandMapping === "string")
                        commandMapping = {id: commandMapping};
                    var commandId = commandMapping.id;
                    var mappings = that._commandMappings[containerId] || {};
                    mappings[commandId] = $.extend({
                        showIcon: true,
                        showText: true
                    }, that._containerDefaults[containerId] || {}, commandMapping);
                    that._commandMappings[containerId] = mappings
                });
                this._initExistingCommands();
                return this
            },
            unmapCommands: function(containerId, commandIds) {
                var that = this;
                $.each(commandIds, function(index, commandId) {
                    var mappings = that._commandMappings[containerId] || {};
                    if (mappings)
                        delete mappings[commandId]
                });
                this._initExistingCommands()
            },
            getCommandMappingForContainer: function(commandId, containerId) {
                return (this._commandMappings[containerId] || {})[commandId]
            },
            checkCommandsExist: function(commands) {
                var that = this,
                    result = $.grep(commands, function(commandName, index) {
                        return $.inArray(commandName, that._existingCommands) < 0 && $.inArray(commandName, commands) === index
                    });
                if (result.length !== 0)
                    throw DX.Error("E3005", result.join("', '"), result.length === 1 ? " is" : "s are");
            },
            load: function(config) {
                if (!config)
                    return;
                var that = this;
                $.each(config, function(name, container) {
                    that.setDefaults(name, container.defaults);
                    that.mapCommands(name, container.commands)
                });
                return this
            },
            _initExistingCommands: function() {
                var that = this;
                this._existingCommands = [];
                $.each(that._commandMappings, function(name, _commands) {
                    $.each(_commands, function(index, command) {
                        if ($.inArray(command.id, that._existingCommands) < 0)
                            that._existingCommands.push(command.id)
                    })
                })
            }
        });
        DX.framework.CommandMapping.defaultMapping = {
            "global-navigation": {
                defaults: {
                    showIcon: true,
                    showText: true
                },
                commands: []
            },
            "ios-header-toolbar": {
                defaults: {
                    showIcon: false,
                    showText: true,
                    location: "after"
                },
                commands: ["edit", "save", {
                        id: "back",
                        location: "before"
                    }, {
                        id: "cancel",
                        location: "before"
                    }, {
                        id: "create",
                        showIcon: true,
                        showText: false
                    }]
            },
            "ios-action-sheet": {
                defaults: {
                    showIcon: false,
                    showText: true
                },
                commands: []
            },
            "ios-view-footer": {
                defaults: {
                    showIcon: false,
                    showText: true
                },
                commands: [{
                        id: "delete",
                        type: "danger"
                    }]
            },
            "android-header-toolbar": {
                defaults: {
                    showIcon: true,
                    showText: false,
                    location: "after"
                },
                commands: [{
                        id: "back",
                        showIcon: false,
                        location: "before"
                    }, "create", "edit", "save", {
                        id: "cancel",
                        showText: true,
                        location: "menu"
                    }, {
                        id: "delete",
                        showText: true,
                        location: "menu"
                    }]
            },
            "android-simple-toolbar": {
                defaults: {
                    showIcon: true,
                    showText: false,
                    location: "after"
                },
                commands: [{
                        id: "back",
                        showIcon: false,
                        location: "before"
                    }, {id: "create"}, {
                        id: "save",
                        showText: true,
                        location: "before"
                    }, {
                        id: "edit",
                        showText: true,
                        location: "menu"
                    }, {
                        id: "cancel",
                        showText: true,
                        location: "menu"
                    }, {
                        id: "delete",
                        showText: true,
                        location: "menu"
                    }]
            },
            "android-footer-toolbar": {
                defaults: {location: "after"},
                commands: [{
                        id: "create",
                        showText: false,
                        location: "center"
                    }, {
                        id: "edit",
                        showText: false,
                        location: "before"
                    }, {
                        id: "delete",
                        location: "menu"
                    }, {
                        id: "save",
                        showIcon: false,
                        location: "before"
                    }]
            },
            "tizen-header-toolbar": {
                defaults: {
                    showIcon: true,
                    showText: false,
                    location: "after"
                },
                commands: [{
                        id: "back",
                        showIcon: false,
                        location: "before"
                    }, "create", "edit", "save", {
                        id: "cancel",
                        showText: true,
                        location: "menu"
                    }, {
                        id: "delete",
                        showText: true,
                        location: "menu"
                    }]
            },
            "tizen-footer-toolbar": {
                defaults: {location: "after"},
                commands: [{
                        id: "create",
                        showText: false
                    }, {
                        id: "edit",
                        showText: false,
                        location: "before"
                    }, {
                        id: "delete",
                        location: "menu"
                    }, {
                        id: "save",
                        showIcon: false,
                        location: "before"
                    }]
            },
            "tizen-simple-toolbar": {
                defaults: {
                    showIcon: true,
                    showText: false,
                    location: "after"
                },
                commands: [{
                        id: "back",
                        showIcon: false,
                        location: "before"
                    }, {id: "create"}, {
                        id: "save",
                        showText: true,
                        location: "before"
                    }, {
                        id: "edit",
                        showText: true,
                        location: "menu"
                    }, {
                        id: "cancel",
                        showText: true,
                        location: "menu"
                    }, {
                        id: "delete",
                        showText: true,
                        location: "menu"
                    }]
            },
            "generic-header-toolbar": {
                defaults: {
                    showIcon: false,
                    showText: true,
                    location: "after"
                },
                commands: ["edit", "save", {
                        id: "back",
                        location: "before"
                    }, {
                        id: "cancel",
                        location: "before"
                    }, {
                        id: "create",
                        showIcon: true,
                        showText: false
                    }]
            },
            "generic-view-footer": {
                defaults: {
                    showIcon: false,
                    showText: true
                },
                commands: [{
                        id: "delete",
                        type: "danger"
                    }]
            },
            "win8-appbar": {
                defaults: {location: "after"},
                commands: ["edit", "cancel", "save", "delete", {
                        id: "create",
                        location: "before"
                    }, {
                        id: "refresh",
                        location: "before"
                    }]
            },
            "win8-toolbar": {
                defaults: {
                    showText: false,
                    location: "before"
                },
                commands: [{id: "previousPage"}]
            },
            "win8-phone-appbar": {
                defaults: {location: "center"},
                commands: ["create", "edit", "cancel", "save", "refresh", {
                        id: "delete",
                        location: "menu"
                    }]
            },
            "win8-split-toolbar": {
                defaults: {
                    showIcon: true,
                    showText: false,
                    location: "after"
                },
                commands: [{
                        id: "back",
                        showIcon: false,
                        location: "before"
                    }, {id: "create"}, {
                        id: "save",
                        showText: true,
                        location: "before"
                    }, {
                        id: "edit",
                        showText: true,
                        location: "menu"
                    }, {
                        id: "cancel",
                        showText: true,
                        location: "menu"
                    }, {
                        id: "delete",
                        showText: true,
                        location: "menu"
                    }]
            },
            "win8-master-detail-toolbar": {
                defaults: {
                    showText: false,
                    location: "before"
                },
                commands: ["back"]
            },
            "desktop-toolbar": {
                defaults: {
                    showIcon: false,
                    showText: true,
                    location: "after"
                },
                commands: ["cancel", "create", "edit", "save", {
                        id: "delete",
                        type: "danger"
                    }]
            }
        }
    })(jQuery, DevExpress);
    /*! Module framework, file framework.viewCache.js */
    (function($, DX, undefined) {
        var Class = DX.Class;
        DX.framework.ViewCache = Class.inherit({
            ctor: function(options) {
                this._cache = {};
                this.viewRemoved = $.Callbacks();
                this._callbacksToEvents("ViewCache", ["viewRemoved"])
            },
            setView: function(key, viewInfo) {
                this._cache[key] = viewInfo
            },
            getView: function(key) {
                return this._cache[key]
            },
            removeView: function(key) {
                var result = this._cache[key];
                if (result) {
                    delete this._cache[key];
                    this.fireEvent("viewRemoved", [{viewInfo: result}])
                }
                return result
            },
            clear: function() {
                var that = this;
                $.each(this._cache, function(key) {
                    that.removeView(key)
                })
            },
            hasView: function(key) {
                return key in this._cache
            }
        }).include(DX.EventsMixin);
        DX.framework.NullViewCache = DX.framework.ViewCache.inherit({setView: function(key, viewInfo) {
                this.callBase(key, viewInfo);
                this.removeView(key)
            }});
        DX.framework.ConditionalViewCacheDecorator = Class.inherit({
            ctor: function(options) {
                this._filter = options.filter;
                this._viewCache = options.viewCache;
                this.viewRemoved = this._viewCache.viewRemoved;
                this._events = this._viewCache._events
            },
            setView: function(key, viewInfo) {
                this._viewCache.setView(key, viewInfo);
                if (!this._filter(key, viewInfo))
                    this._viewCache.removeView(key)
            },
            getView: function(key) {
                return this._viewCache.getView(key)
            },
            removeView: function(key) {
                return this._viewCache.removeView(key)
            },
            clear: function() {
                return this._viewCache.clear()
            },
            hasView: function(key) {
                return this._viewCache.hasView(key)
            }
        }).include(DX.EventsMixin);
        var DEFAULT_VIEW_CACHE_CAPACITY = 10;
        DX.framework.CapacityViewCacheDecorator = Class.inherit({
            ctor: function(options) {
                this._keys = [];
                this._size = options.size || DEFAULT_VIEW_CACHE_CAPACITY;
                this._viewCache = options.viewCache;
                this.viewRemoved = this._viewCache.viewRemoved;
                this._events = this._viewCache._events
            },
            setView: function(key, viewInfo) {
                if (!this.hasView(key)) {
                    if (this._keys.length == this._size)
                        this.removeView(this._keys[0]);
                    this._keys.push(key)
                }
                this._viewCache.setView(key, viewInfo)
            },
            getView: function(key) {
                var index = $.inArray(key, this._keys);
                if (index < 0)
                    return null;
                this._keys.push(key);
                this._keys.splice(index, 1);
                return this._viewCache.getView(key)
            },
            removeView: function(key) {
                var index = $.inArray(key, this._keys);
                if (index > -1)
                    this._keys.splice(index, 1);
                return this._viewCache.removeView(key)
            },
            clear: function() {
                this._keys = [];
                return this._viewCache.clear()
            },
            hasView: function(key) {
                return this._viewCache.hasView(key)
            }
        }).include(DX.EventsMixin);
        DX.framework.HistoryDependentViewCacheDecorator = Class.inherit({
            ctor: function(options) {
                this._viewCache = options.viewCache || new DX.framework.ViewCache;
                this._navigationManager = options.navigationManager;
                this._navigationManager.on("itemRemoved", $.proxy(this._onNavigationItemRemoved, this));
                this.viewRemoved = this._viewCache.viewRemoved;
                this._events = this._viewCache._events
            },
            _onNavigationItemRemoved: function(item) {
                this.removeView(item.key)
            },
            setView: function(key, viewInfo) {
                this._viewCache.setView(key, viewInfo)
            },
            getView: function(key) {
                return this._viewCache.getView(key)
            },
            removeView: function(key) {
                return this._viewCache.removeView(key)
            },
            clear: function() {
                return this._viewCache.clear()
            },
            hasView: function(key) {
                return this._viewCache.hasView(key)
            }
        }).include(DX.EventsMixin)
    })(jQuery, DevExpress);
    /*! Module framework, file framework.stateManager.js */
    (function($, DX, undefined) {
        var Class = DX.Class;
        DX.framework.MemoryKeyValueStorage = Class.inherit({
            ctor: function() {
                this.storage = {}
            },
            getItem: function(key) {
                return this.storage[key]
            },
            setItem: function(key, value) {
                this.storage[key] = value
            },
            removeItem: function(key) {
                delete this.storage[key]
            }
        });
        DX.framework.StateManager = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this.storage = options.storage || new DX.framework.MemoryKeyValueStorage;
                this.stateSources = options.stateSources || []
            },
            addStateSource: function(stateSource) {
                this.stateSources.push(stateSource)
            },
            removeStateSource: function(stateSource) {
                var index = $.inArray(stateSource, this.stateSources);
                if (index > -1) {
                    this.stateSources.splice(index, 1);
                    stateSource.removeState(this.storage)
                }
            },
            saveState: function() {
                var that = this;
                $.each(this.stateSources, function(index, stateSource) {
                    stateSource.saveState(that.storage)
                })
            },
            restoreState: function() {
                var that = this;
                $.each(this.stateSources, function(index, stateSource) {
                    stateSource.restoreState(that.storage)
                })
            },
            clearState: function() {
                var that = this;
                $.each(this.stateSources, function(index, stateSource) {
                    stateSource.removeState(that.storage)
                })
            }
        })
    })(jQuery, DevExpress);
    /*! Module framework, file framework.browserAdapters.js */
    (function($, DX, undefined) {
        var Class = DX.Class;
        var ROOT_PAGE_URL = "__root__",
            BUGGY_ANDROID_BUFFER_PAGE_URL = "__buffer__";
        DX.framework.DefaultBrowserAdapter = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this._window = options.window || window;
                this.popState = $.Callbacks();
                $(this._window).on("hashchange", $.proxy(this._onHashChange, this));
                this._tasks = DX.createQueue();
                this.canWorkInPureBrowser = true
            },
            replaceState: function(uri) {
                var that = this;
                return this._addTask(function() {
                        uri = that._normalizeUri(uri);
                        that._window.history.replaceState(null, null, "#" + uri);
                        that._currentTask.resolve()
                    })
            },
            pushState: function(uri) {
                var that = this;
                return this._addTask(function() {
                        uri = that._normalizeUri(uri);
                        that._window.history.pushState(null, null, "#" + uri);
                        that._currentTask.resolve()
                    })
            },
            createRootPage: function() {
                return this.replaceState(ROOT_PAGE_URL)
            },
            _onHashChange: function() {
                if (this._currentTask)
                    this._currentTask.resolve();
                this.popState.fire()
            },
            back: function() {
                var that = this;
                return this._addTask(function() {
                        that._window.history.back()
                    })
            },
            getHash: function() {
                return this._normalizeUri(this._window.location.hash)
            },
            isRootPage: function() {
                return this.getHash() === ROOT_PAGE_URL
            },
            _normalizeUri: function(uri) {
                return (uri || "").replace(/^#+/, "")
            },
            _addTask: function(task) {
                var that = this,
                    d = $.Deferred();
                this._tasks.add(function() {
                    that._currentTask = d;
                    task();
                    return d
                });
                return d.promise()
            }
        });
        DX.framework.OldBrowserAdapter = DX.framework.DefaultBrowserAdapter.inherit({
            ctor: function() {
                this._innerEventCount = 0;
                this.callBase.apply(this, arguments);
                this._skipNextEvent = false
            },
            replaceState: function(uri) {
                var that = this;
                uri = that._normalizeUri(uri);
                if (that.getHash() !== uri) {
                    that._addTask(function() {
                        that._skipNextEvent = true;
                        that._window.history.back()
                    });
                    return that._addTask(function() {
                            that._skipNextEvent = true;
                            that._window.location.hash = uri
                        })
                }
                return $.Deferred().resolve().promise()
            },
            pushState: function(uri) {
                var that = this;
                uri = this._normalizeUri(uri);
                if (this.getHash() !== uri)
                    return that._addTask(function() {
                            that._skipNextEvent = true;
                            that._window.location.hash = uri
                        });
                return $.Deferred().resolve().promise()
            },
            createRootPage: function() {
                return this.pushState(ROOT_PAGE_URL)
            },
            _onHashChange: function() {
                var currentTask = this._currentTask;
                this._currentTask = null;
                if (this._skipNextEvent)
                    this._skipNextEvent = false;
                else
                    this.popState.fire();
                if (currentTask)
                    currentTask.resolve()
            }
        });
        DX.framework.BuggyAndroidBrowserAdapter = DX.framework.OldBrowserAdapter.inherit({createRootPage: function() {
                this.pushState(BUGGY_ANDROID_BUFFER_PAGE_URL);
                return this.callBase()
            }});
        DX.framework.HistorylessBrowserAdapter = DX.framework.DefaultBrowserAdapter.inherit({
            ctor: function(options) {
                options = options || {};
                this._window = options.window || window;
                this.popState = $.Callbacks();
                $(this._window).on("dxback", $.proxy(this._onHashChange, this));
                this._currentHash = this._window.location.hash
            },
            replaceState: function(uri) {
                this._currentHash = this._normalizeUri(uri);
                return $.Deferred().resolve().promise()
            },
            pushState: function(uri) {
                return this.replaceState(uri)
            },
            createRootPage: function() {
                return this.replaceState(ROOT_PAGE_URL)
            },
            getHash: function() {
                return this._normalizeUri(this._currentHash)
            },
            back: function() {
                return this.replaceState(ROOT_PAGE_URL)
            },
            _onHashChange: function() {
                var promise = this.back();
                this.popState.fire();
                return promise
            }
        });
        DX.framework.BuggyCordovaWP81BrowserAdapter = DX.framework.DefaultBrowserAdapter.inherit({ctor: function(options) {
                this.callBase(options);
                this.canWorkInPureBrowser = false
            }})
    })(jQuery, DevExpress);
    /*! Module framework, file framework.navigationDevices.js */
    (function($, DX, undefined) {
        var Class = DX.Class;
        var SESSION_KEY = "dxPhoneJSApplication";
        DX.framework.HistoryBasedNavigationDevice = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this._browserAdapter = options.browserAdapter || this._createBrowserAdapter(options);
                this.uriChanged = $.Callbacks();
                this._browserAdapter.popState.add($.proxy(this._onPopState, this))
            },
            init: $.noop,
            getUri: function() {
                return this._browserAdapter.getHash()
            },
            setUri: function(uri, replaceCurrent) {
                if (replaceCurrent)
                    return this._browserAdapter.replaceState(uri);
                else if (uri !== this.getUri())
                    return this._browserAdapter.pushState(uri);
                else
                    return $.Deferred().resolve().promise()
            },
            back: function() {
                return this._browserAdapter.back()
            },
            _onPopState: function() {
                this.uriChanged.fire(this.getUri())
            },
            _isBuggyAndroid2: function() {
                var realDevice = DX.devices.real();
                var version = realDevice.version;
                return realDevice.platform === "android" && version.length > 1 && (version[0] === 2 && version[1] < 4 || version[0] < 2)
            },
            _isBuggyAndroid4: function() {
                var realDevice = DX.devices.real();
                var version = realDevice.version;
                return realDevice.platform === "android" && version.length > 1 && version[0] === 4 && version[1] === 0
            },
            _isWindowsPhone8: function() {
                var realDevice = DX.devices.real();
                return realDevice.platform === "win8" && realDevice.phone
            },
            _createBrowserAdapter: function(options) {
                var sourceWindow = options.window || window,
                    supportPushReplace = sourceWindow.history.replaceState && sourceWindow.history.pushState,
                    result;
                if (this._isWindowsPhone8())
                    result = new DX.framework.BuggyCordovaWP81BrowserAdapter(options);
                else if (sourceWindow !== sourceWindow.top)
                    result = new DX.framework.HistorylessBrowserAdapter(options);
                else if (this._isBuggyAndroid4())
                    result = new DX.framework.BuggyAndroidBrowserAdapter(options);
                else if (this._isBuggyAndroid2() || !supportPushReplace)
                    result = new DX.framework.OldBrowserAdapter(options);
                else
                    result = new DX.framework.DefaultBrowserAdapter(options);
                return result
            }
        });
        DX.framework.StackBasedNavigationDevice = DX.framework.HistoryBasedNavigationDevice.inherit({
            ctor: function(options) {
                this.callBase(options);
                this.backInitiated = $.Callbacks();
                this._deferredNavigate = null;
                $(window).on("unload", this._saveBrowserState)
            },
            init: function() {
                var that = this;
                if (that._browserAdapter.canWorkInPureBrowser)
                    return that._initRootPage().done(function() {
                            if (that._browserAdapter.isRootPage())
                                that._browserAdapter.pushState("")
                        });
                else
                    return $.Deferred().resolve().promise()
            },
            setUri: function(uri) {
                return this.callBase(uri, !this._browserAdapter.isRootPage())
            },
            _saveBrowserState: function() {
                if (window.sessionStorage)
                    sessionStorage.setItem(SESSION_KEY, true)
            },
            _initRootPage: function() {
                var hash = this.getUri();
                if (!window.sessionStorage || sessionStorage.getItem(SESSION_KEY))
                    return $.Deferred().resolve().promise();
                sessionStorage.removeItem(SESSION_KEY);
                this._browserAdapter.createRootPage();
                return this._browserAdapter.pushState(hash)
            },
            _onPopState: function() {
                var navigationPending = this._deferredNavigate && this._deferredNavigate.state() === "pending";
                if (this._browserAdapter.isRootPage())
                    if (navigationPending)
                        this._deferredNavigate.resolve();
                    else
                        this.backInitiated.fire();
                else {
                    if (!navigationPending)
                        this._deferredNavigate = $.Deferred().done($.proxy(this.callBase, this));
                    this.back()
                }
            }
        })
    })(jQuery, DevExpress);
    /*! Module framework, file framework.navigationManager.js */
    (function($, DX, undefined) {
        var Class = DX.Class;
        var NAVIGATION_TARGETS = {
                current: "current",
                blank: "blank",
                back: "back"
            },
            STORAGE_HISTORY_KEY = "__history";
        DX.framework.HistoryBasedNavigationManager = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this._currentItem = undefined;
                this._previousItem = undefined;
                this.navigating = $.Callbacks();
                this.navigated = $.Callbacks();
                this.navigationCanceled = $.Callbacks();
                this.navigatingBack = $.Callbacks();
                this.itemRemoved = $.Callbacks();
                this._callbacksToEvents("DefaultLayoutController", ["navigating", "navigated", "navigationCanceled", "navigatingBack", "itemRemoved"]);
                this._createNavigationDevice(options)
            },
            _createNavigationDevice: function(options) {
                this._navigationDevice = options.navigationDevice || new DX.framework.HistoryBasedNavigationDevice;
                this._navigationDevice.uriChanged.add($.proxy(this._uriChangedHandler, this))
            },
            _uriChangedHandler: function(uri) {
                while (DX.hideTopOverlayCallback.fire());
                this.navigate(uri, {target: "none"})
            },
            _cancelNavigation: function(args) {
                this.fireEvent("navigationCanceled", [args])
            },
            _getDefaultOptions: function() {
                return {
                        direction: "none",
                        target: NAVIGATION_TARGETS.blank
                    }
            },
            _updateHistory: function(uri, options) {
                this._previousItem = this._currentItem;
                this._currentItem = {
                    uri: uri,
                    key: uri
                };
                if (options.target !== "none")
                    this._navigationDevice.setUri(uri, options.target === "current")
            },
            _setCurrentItem: function(item) {
                this._currentItem = item
            },
            navigate: function(uri, options) {
                options = options || {};
                var that = this,
                    currentItem = that._currentItem || {},
                    targetItem = options.item || {},
                    currentUri = currentItem.uri,
                    currentKey = currentItem.key,
                    targetKey = targetItem.key,
                    args;
                if (uri === undefined)
                    uri = that._navigationDevice.getUri();
                if (/^_back$/.test(uri)) {
                    that.back();
                    return
                }
                options = $.extend(that._getDefaultOptions(), options || {});
                args = {
                    currentUri: currentUri,
                    uri: uri,
                    cancel: false,
                    navigateWhen: [],
                    options: options
                };
                that.fireEvent("navigating", [args]);
                uri = args.uri;
                if (args.cancel || currentUri === uri && (targetKey === undefined || targetKey === currentKey) && !that._forceNavigate)
                    that._cancelNavigation(args);
                else {
                    that._forceNavigate = false;
                    $.when.apply($, args.navigateWhen).done(function() {
                        DX.utils.executeAsync(function() {
                            that._updateHistory(uri, options);
                            that.fireEvent("navigated", [{
                                    uri: uri,
                                    previousUri: currentUri,
                                    options: options,
                                    item: that._currentItem
                                }])
                        })
                    })
                }
            },
            back: function() {
                return this._navigationDevice.back()
            },
            previousItem: function() {
                return this._previousItem
            },
            currentItem: function(item) {
                if (arguments.length > 0) {
                    if (!item)
                        throw DX.Error("E3023");
                    this._setCurrentItem(item)
                }
                else
                    return this._currentItem
            },
            rootUri: function() {
                return this._currentItem && this._currentItem.uri
            },
            canBack: function() {
                return true
            },
            saveState: $.noop,
            restoreState: $.noop,
            removeState: $.noop
        }).include(DX.EventsMixin);
        DX.framework.StackBasedNavigationManager = DX.framework.HistoryBasedNavigationManager.inherit({
            ctor: function(options) {
                options = options || {};
                this.callBase(options);
                this._createNavigationStacks(options);
                DX.hardwareBackButton.add($.proxy(this._deviceBackInitiated, this));
                this._stateStorageKey = options.stateStorageKey || STORAGE_HISTORY_KEY
            },
            init: function() {
                return this._navigationDevice.init()
            },
            _createNavigationDevice: function(options) {
                if (!options.navigationDevice)
                    options.navigationDevice = new DX.framework.StackBasedNavigationDevice;
                this.callBase(options);
                this._navigationDevice.backInitiated.add($.proxy(this._deviceBackInitiated, this))
            },
            _uriChangedHandler: function(uri) {
                this.navigate(uri)
            },
            _createNavigationStacks: function(options) {
                this.navigationStacks = {};
                this._keepPositionInStack = options.keepPositionInStack;
                this.currentStack = new DX.framework.NavigationStack
            },
            _deviceBackInitiated: function() {
                if (!DX.hideTopOverlayCallback.fire())
                    this.back({isHardwareButton: true});
                else
                    this._syncUriWithCurrentNavigationItem()
            },
            _syncUriWithCurrentNavigationItem: function() {
                var currentUri = this._currentItem && this._currentItem.uri;
                this._navigationDevice.setUri(currentUri)
            },
            _cancelNavigation: function(args) {
                this._syncUriWithCurrentNavigationItem();
                this.callBase(args)
            },
            _getDefaultOptions: function() {
                return {target: NAVIGATION_TARGETS.blank}
            },
            _createNavigationStack: function() {
                var result = new DX.framework.NavigationStack;
                result.itemsRemoved.add($.proxy(this._removeItems, this));
                return result
            },
            _setCurrentItem: function(item) {
                this._setCurrentStack(item.stack);
                this.currentStack.currentItem(item);
                this.callBase(item);
                this._syncUriWithCurrentNavigationItem()
            },
            _setCurrentStack: function(stackOrStackKey) {
                var stack,
                    stackKey;
                if (typeof stackOrStackKey === "string") {
                    stackKey = stackOrStackKey;
                    if (!(stackKey in this.navigationStacks))
                        this.navigationStacks[stackKey] = this._createNavigationStack();
                    stack = this.navigationStacks[stackKey]
                }
                else {
                    stack = stackOrStackKey;
                    stackKey = $.map(this.navigationStacks, function(stack, key) {
                        if (stack === stackOrStackKey)
                            return key;
                        return null
                    })[0]
                }
                this.currentStack = stack;
                this.currentStackKey = stackKey
            },
            _updateHistory: function(uri, options) {
                var isRoot = options.root,
                    forceIsRoot = isRoot,
                    forceToRoot = false,
                    stackKey = options.stack || (isRoot ? uri : this.currentStackKey || uri),
                    previousStack = this.currentStack,
                    keepPositionInStack = options.keepPositionInStack !== undefined ? options.keepPositionInStack : this._keepPositionInStack;
                this._setCurrentStack(stackKey);
                if (isRoot || !this.currentStack.items.length) {
                    forceToRoot = this.currentStack === previousStack;
                    forceIsRoot = true
                }
                if (isRoot && this.currentStack.items.length) {
                    if (!keepPositionInStack || forceToRoot) {
                        this.currentStack.currentIndex = 0;
                        if (this.currentItem().uri !== uri)
                            this.currentStack.navigate(uri, true)
                    }
                }
                else {
                    var prevIndex = this.currentStack.currentIndex,
                        prevItem = this.currentItem() || {};
                    switch (options.target) {
                        case NAVIGATION_TARGETS.blank:
                            this.currentStack.navigate(uri);
                            break;
                        case NAVIGATION_TARGETS.current:
                            this.currentStack.navigate(uri, true);
                            break;
                        case NAVIGATION_TARGETS.back:
                            if (this.currentStack.currentIndex > 0)
                                this.currentStack.back(uri);
                            else
                                this.currentStack.navigate(uri, true);
                            break;
                        default:
                            throw DX.Error("E3006", options.target);
                    }
                    if (options.direction === undefined) {
                        var indexDelta = this.currentStack.currentIndex - prevIndex;
                        if (indexDelta < 0)
                            options.direction = this.currentStack.currentItem().backDirection || "backward";
                        else if (indexDelta > 0 && this.currentStack.currentIndex > 0)
                            options.direction = "forward";
                        else
                            options.direction = "none"
                    }
                    prevItem.backDirection = options.direction === "forward" ? "backward" : "none"
                }
                options.root = forceIsRoot;
                this._currentItem = this.currentStack.currentItem();
                this._syncUriWithCurrentNavigationItem()
            },
            _removeItems: function(items) {
                var that = this;
                $.each(items, function(index, item) {
                    that.fireEvent("itemRemoved", [item])
                })
            },
            back: function(options) {
                options = options || {};
                var navigatingBackArgs = $.extend({cancel: false}, options);
                this.fireEvent("navigatingBack", [navigatingBackArgs]);
                if (navigatingBackArgs.cancel) {
                    this._syncUriWithCurrentNavigationItem();
                    return
                }
                var item = this.previousItem(navigatingBackArgs.stack);
                if (item)
                    this.navigate(item.uri, {
                        stack: navigatingBackArgs.stack,
                        target: NAVIGATION_TARGETS.back,
                        item: item
                    });
                else
                    this.callBase()
            },
            rootUri: function() {
                return this.currentStack.items.length ? this.currentStack.items[0].uri : this.callBase()
            },
            canBack: function(stackKey) {
                var stack = stackKey ? this.navigationStacks[stackKey] : this.currentStack;
                return stack.canBack()
            },
            saveState: function(storage) {
                if (this.currentStack.items.length) {
                    var state = {
                            items: $.map(this.currentStack.items, function(item) {
                                return {
                                        key: item.key,
                                        uri: item.uri
                                    }
                            }),
                            currentIndex: this.currentStack.currentIndex,
                            currentStackKey: this.currentStack.items[0].uri
                        };
                    var json = JSON.stringify(state);
                    storage.setItem(this._stateStorageKey, json)
                }
                else
                    this.removeState(storage)
            },
            restoreState: function(storage) {
                if (this.disableRestoreState)
                    return;
                var json = storage.getItem(this._stateStorageKey);
                if (json)
                    try {
                        var state = JSON.parse(json),
                            stack = this._createNavigationStack();
                        if (!state.items[0].uri)
                            throw DX.Error("E3007");
                        stack.items = $.map(state.items, function(item) {
                            item.stack = stack;
                            return item
                        });
                        stack.currentIndex = state.currentIndex;
                        this.navigationStacks[stack.items[0].uri] = stack;
                        this.currentStackKey = state.currentStackKey;
                        this.currentStack = this.navigationStacks[this.currentStackKey];
                        this._currentItem = this.currentStack.currentItem();
                        this._navigationDevice.setUri(this.currentItem().uri);
                        this._forceNavigate = true
                    }
                    catch(e) {
                        this.removeState(storage);
                        throw e;
                    }
            },
            removeState: function(storage) {
                storage.removeItem(this._stateStorageKey)
            },
            currentIndex: function() {
                return this.currentStack.currentIndex
            },
            previousItem: function(stackKey) {
                var stack = stackKey ? this.navigationStacks[stackKey] : this.currentStack;
                return stack.previousItem()
            },
            getItemByIndex: function(index) {
                return this.currentStack.items[index]
            },
            clearHistory: function() {
                this.currentStack.clear()
            },
            itemByKey: function(itemKey) {
                var result;
                $.each(this.navigationStacks, function(stackKey, stack) {
                    var item = stack.itemByKey(itemKey);
                    if (item) {
                        result = item;
                        return false
                    }
                });
                return result
            },
            currentItem: function(itemOrItemKey) {
                var item;
                if (arguments.length > 0) {
                    if (typeof itemOrItemKey === "string")
                        item = this.itemByKey(itemOrItemKey);
                    else if ($.isPlainObject(itemOrItemKey))
                        item = itemOrItemKey;
                    this.callBase(item)
                }
                else
                    return this.callBase()
            }
        });
        DX.framework.NavigationStack = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this.itemsRemoved = $.Callbacks();
                this.clear()
            },
            currentItem: function(item) {
                if (item) {
                    for (var i = 0; i < this.items.length; i++)
                        if (item === this.items[i]) {
                            this.currentIndex = i;
                            break
                        }
                }
                else
                    return this.items[this.currentIndex]
            },
            previousItem: function() {
                return this.items.length > 1 ? this.items[this.currentIndex - 1] : undefined
            },
            canBack: function() {
                return this.currentIndex > 0
            },
            clear: function() {
                this._deleteItems(this.items);
                this.items = [];
                this.currentIndex = -1
            },
            back: function(uri) {
                this.currentIndex--;
                if (this.currentIndex < 0)
                    throw DX.Error("E3008");
                var currentItem = this.currentItem();
                if (currentItem.uri !== uri)
                    this._updateItem(this.currentIndex, uri)
            },
            forward: function() {
                this.currentIndex++;
                if (this.currentIndex >= this.items.length)
                    throw DX.Error("E3009");
            },
            navigate: function(uri, replaceCurrent) {
                if (this.currentIndex < this.items.length && this.currentIndex > -1 && this.items[this.currentIndex].uri === uri)
                    return;
                if (replaceCurrent && this.currentIndex > -1)
                    this.currentIndex--;
                if (this.currentIndex + 1 < this.items.length && this.items[this.currentIndex + 1].uri === uri)
                    this.currentIndex++;
                else {
                    var toDelete = this.items.splice(this.currentIndex + 1, this.items.length - this.currentIndex - 1);
                    this.items.push({stack: this});
                    this.currentIndex++;
                    this._updateItem(this.currentIndex, uri);
                    this._deleteItems(toDelete)
                }
                return this.currentItem()
            },
            itemByKey: function(key) {
                for (var i = 0; i < this.items.length; i++) {
                    var item = this.items[i];
                    if (item.key === key)
                        return item
                }
            },
            _updateItem: function(index, uri) {
                var item = this.items[index];
                item.uri = uri;
                item.key = this.items[0].uri + "_" + index + "_" + uri
            },
            _deleteItems: function(items) {
                if (items)
                    this.itemsRemoved.fire(items)
            }
        });
        DX.framework.HistoryBasedNavigationManager.NAVIGATION_TARGETS = NAVIGATION_TARGETS
    })(jQuery, DevExpress);
    /*! Module framework, file framework.actionExecutors.js */
    (function($, DX, undefined) {
        function prepareNavigateOptions(options, actionArguments) {
            if (actionArguments.args) {
                var sourceEventArguments = actionArguments.args[0];
                options.jQueryEvent = sourceEventArguments.jQueryEvent
            }
            if ((actionArguments.component || {}).NAME === "dxCommand")
                $.extend(options, actionArguments.component.option())
        }
        DX.framework.createActionExecutors = function(app) {
            return {
                    routing: {execute: function(e) {
                            var action = e.action,
                                options = {},
                                routeValues,
                                uri;
                            if ($.isPlainObject(action)) {
                                routeValues = action.routeValues;
                                if (routeValues && $.isPlainObject(routeValues))
                                    options = action.options;
                                else
                                    routeValues = action;
                                uri = app.router.format(routeValues);
                                prepareNavigateOptions(options, e);
                                app.navigate(uri, options);
                                e.handled = true
                            }
                        }},
                    hash: {execute: function(e) {
                            if (typeof e.action !== "string" || e.action.charAt(0) !== "#")
                                return;
                            var uriTemplate = e.action.substr(1),
                                args = e.args[0],
                                uri = uriTemplate;
                            var defaultEvaluate = function(expr) {
                                    var getter = DX.data.utils.compileGetter(expr),
                                        model = e.args[0].model;
                                    return getter(model)
                                };
                            var evaluate = args.evaluate || defaultEvaluate;
                            uri = uriTemplate.replace(/\{([^}]+)\}/g, function(entry, expr) {
                                expr = $.trim(expr);
                                if (expr.indexOf(",") > -1)
                                    expr = $.map(expr.split(","), $.trim);
                                var value = evaluate(expr);
                                if (value === undefined)
                                    value = "";
                                value = DX.framework.Route.prototype.formatSegment(value);
                                return value
                            });
                            var options = {};
                            prepareNavigateOptions(options, e);
                            app.navigate(uri, options);
                            e.handled = true
                        }}
                }
        }
    })(jQuery, DevExpress);
    /*! Module framework, file framework.application.js */
    (function($, DX) {
        var Class = DX.Class,
            BACK_COMMAND_TITLE,
            INIT_IN_PROGRESS = "InProgress",
            INIT_COMPLETE = "Inited",
            frameworkNS = DX.framework;
        DX.framework.Application = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this._options = options;
                this.namespace = options.namespace || options.ns || window;
                this._applicationMode = options.mode ? options.mode : "mobileApp";
                this.components = [];
                BACK_COMMAND_TITLE = DX.localization.localizeString("@Back");
                this.router = options.router || new DX.framework.Router;
                var navigationManagers = {
                        mobileApp: DX.framework.StackBasedNavigationManager,
                        webSite: DX.framework.HistoryBasedNavigationManager
                    };
                this.navigationManager = options.navigationManager || new navigationManagers[this._applicationMode]({keepPositionInStack: options.navigateToRootViewMode === "keepHistory"});
                this.navigationManager.on("navigating", $.proxy(this._onNavigating, this));
                this.navigationManager.on("navigatingBack", $.proxy(this._onNavigatingBack, this));
                this.navigationManager.on("navigated", $.proxy(this._onNavigated, this));
                this.navigationManager.on("navigationCanceled", $.proxy(this._onNavigationCanceled, this));
                this.stateManager = options.stateManager || new DX.framework.StateManager({storage: options.stateStorage || sessionStorage});
                this.stateManager.addStateSource(this.navigationManager);
                this.viewCache = this._createViewCache(options);
                this.commandMapping = this._createCommandMapping(options.commandMapping);
                this.createNavigation(options.navigation);
                this.beforeViewSetup = $.Callbacks();
                this.afterViewSetup = $.Callbacks();
                this.viewShowing = $.Callbacks();
                this.viewShown = $.Callbacks();
                this.viewHidden = $.Callbacks();
                this.viewDisposing = $.Callbacks();
                this.viewDisposed = $.Callbacks();
                this.navigating = $.Callbacks();
                this.navigatingBack = $.Callbacks();
                this.initialized = $.Callbacks();
                this._callbacksToEvents("HtmlApplication", ["beforeViewSetup", "afterViewSetup", "viewShowing", "viewShown", "viewHidden", "viewDisposing", "viewDisposed", "navigating", "navigatingBack", "initialized"]);
                this._isNavigating = false;
                this._viewLinksHash = {};
                DX.registerActionExecutor(DX.framework.createActionExecutors(this));
                this.components.push(this.router);
                this.components.push(this.navigationManager)
            },
            _createViewCache: function(options) {
                var result;
                if (options.viewCache)
                    result = options.viewCache;
                else if (options.disableViewCache)
                    result = new DX.framework.NullViewCache;
                else
                    result = new DX.framework.CapacityViewCacheDecorator({
                        size: options.viewCacheSize,
                        viewCache: new DX.framework.ViewCache
                    });
                result.on("viewRemoved", $.proxy(function(e) {
                    this._releaseViewLink(e.viewInfo)
                }, this));
                return result
            },
            _createCommandMapping: function(commandMapping) {
                var result = commandMapping;
                if (!(commandMapping instanceof DX.framework.CommandMapping)) {
                    result = new DX.framework.CommandMapping;
                    result.load(DX.framework.CommandMapping.defaultMapping || {}).load(commandMapping || {})
                }
                return result
            },
            createNavigation: function(navigationConfig) {
                this.navigation = this._createNavigationCommands(navigationConfig);
                this._mapNavigationCommands(this.navigation, this.commandMapping)
            },
            _createNavigationCommands: function(commandConfig) {
                if (!commandConfig)
                    return [];
                var that = this,
                    generatedIdCount = 0;
                return $.map(commandConfig, function(item) {
                        var command;
                        if (item instanceof frameworkNS.dxCommand)
                            command = item;
                        else
                            command = new frameworkNS.dxCommand($.extend({root: true}, item));
                        if (!command.option("id"))
                            command.option("id", "navigation_" + generatedIdCount++);
                        return command
                    })
            },
            _mapNavigationCommands: function(navigationCommands, commandMapping) {
                var navigationCommandIds = $.map(navigationCommands, function(command) {
                        return command.option("id")
                    });
                commandMapping.mapCommands("global-navigation", navigationCommandIds)
            },
            _callComponentMethod: function(methodName, args) {
                var tasks = [];
                $.each(this.components, function(index, component) {
                    if (component[methodName] && $.isFunction(component[methodName])) {
                        var result = component[methodName](args);
                        if (result && result.done)
                            tasks.push(result)
                    }
                });
                return $.when.apply($, tasks)
            },
            init: function() {
                var that = this;
                that._initState = INIT_IN_PROGRESS;
                return that._callComponentMethod("init").done(function() {
                        that._initState = INIT_COMPLETE;
                        that._processEvent("initialized")
                    }).fail(function(error) {
                        throw error || DX.Error("E3022");
                    })
            },
            _onNavigatingBack: function(args) {
                this._processEvent("navigatingBack", args)
            },
            _onNavigating: function(args) {
                var that = this;
                if (that._isNavigating) {
                    that._pendingNavigationArgs = args;
                    args.cancel = true;
                    return
                }
                else {
                    that._isNavigating = true;
                    delete that._pendingNavigationArgs
                }
                var routeData = this.router.parse(args.uri);
                if (!routeData)
                    throw DX.Error("E3001", args.uri);
                var uri = this.router.format(routeData);
                if (args.uri !== uri && uri) {
                    args.cancel = true;
                    DX.utils.executeAsync(function() {
                        that.navigate(uri, args.options)
                    })
                }
                else
                    that._processEvent("navigating", args)
            },
            _onNavigated: function(args) {
                var that = this,
                    direction = args.options.direction,
                    deferred = $.Deferred(),
                    viewInfo = that._acquireViewInfo(args.item, args.options);
                if (!that._isViewReadyToShow(viewInfo))
                    that._setViewLoadingState(viewInfo, direction).done(function() {
                        DX.utils.executeAsync(function() {
                            that._createViewModel(viewInfo);
                            that._createViewCommands(viewInfo);
                            deferred.resolve()
                        })
                    }).fail(function() {
                        that._isNavigating = false;
                        deferred.reject()
                    });
                else
                    deferred.resolve();
                deferred.done(function() {
                    that._highlightCurrentNavigationCommand(viewInfo);
                    that._showView(viewInfo, direction).always(function() {
                        that._isNavigating = false;
                        var pendingArgs = that._pendingNavigationArgs;
                        if (pendingArgs)
                            DX.utils.executeAsync(function() {
                                that.navigate(pendingArgs.uri, pendingArgs.options)
                            })
                    })
                })
            },
            _isViewReadyToShow: function(viewInfo) {
                return !!viewInfo.model
            },
            _onNavigationCanceled: function(args) {
                var that = this;
                if (!that._pendingNavigationArgs || that._pendingNavigationArgs.uri !== args.uri) {
                    var currentItem = that.navigationManager.currentItem();
                    if (currentItem)
                        DX.utils.executeAsync(function() {
                            var viewInfo = that._acquireViewInfo(currentItem, args.options);
                            that._highlightCurrentNavigationCommand(viewInfo)
                        });
                    that._isNavigating = false
                }
            },
            _disposeRemovedViews: function() {
                var that = this,
                    args;
                $.each(that._viewLinksHash, function(key, link) {
                    if (!link.linkCount) {
                        args = {viewInfo: link.viewInfo};
                        that._processEvent("viewDisposing", args, args.viewInfo.model);
                        that._disposeView(link.viewInfo);
                        that._processEvent("viewDisposed", args, args.viewInfo.model);
                        delete that._viewLinksHash[key]
                    }
                })
            },
            _onViewHidden: function(viewInfo) {
                var args = {viewInfo: viewInfo};
                this._processEvent("viewHidden", args, args.viewInfo.model)
            },
            _disposeView: function(viewInfo) {
                var commands = viewInfo.commands || [];
                $.each(commands, function(index, command) {
                    command._dispose()
                })
            },
            _acquireViewInfo: function(navigationItem, navigateOptions) {
                var viewInfo = this.viewCache.getView(navigationItem.key);
                if (!viewInfo) {
                    viewInfo = this._createViewInfo(navigationItem, navigateOptions);
                    this._obtainViewLink(viewInfo);
                    this.viewCache.setView(navigationItem.key, viewInfo)
                }
                return viewInfo
            },
            _processEvent: function(eventName, args, model) {
                this._callComponentMethod(eventName, args);
                this.fireEvent(eventName, [args]);
                var modelMethod = (model || {})[eventName];
                if (modelMethod)
                    modelMethod.call(model, args)
            },
            _createViewInfo: function(navigationItem, navigateOptions) {
                var uri = navigationItem.uri,
                    routeData = this.router.parse(uri);
                var viewInfo = {
                        viewName: routeData.view,
                        routeData: routeData,
                        uri: uri,
                        key: navigationItem.key,
                        canBack: this.canBack(),
                        navigateOptions: navigateOptions,
                        previousViewInfo: this._getPreviousViewInfo(navigateOptions)
                    };
                return viewInfo
            },
            _createViewModel: function(viewInfo) {
                this._processEvent("beforeViewSetup", {viewInfo: viewInfo});
                viewInfo.model = viewInfo.model || this._callViewCodeBehind(viewInfo);
                this._processEvent("afterViewSetup", {viewInfo: viewInfo})
            },
            _createViewCommands: function(viewInfo) {
                viewInfo.commands = viewInfo.model.commands || [];
                if (viewInfo.canBack && this._applicationMode !== "webSite")
                    this._appendBackCommand(viewInfo)
            },
            _callViewCodeBehind: function(viewInfo) {
                var setupFunc = $.noop,
                    routeData = viewInfo.routeData;
                if (routeData.view in this.namespace)
                    setupFunc = this.namespace[routeData.view];
                return setupFunc.call(this.namespace, routeData, viewInfo) || {}
            },
            _appendBackCommand: function(viewInfo) {
                var commands = viewInfo.commands,
                    that = this,
                    stackKey = this.navigationManager.currentStackKey,
                    backTitle = BACK_COMMAND_TITLE;
                if (that._options.useViewTitleAsBackText)
                    backTitle = ((viewInfo.previousViewInfo || {}).model || {}).title || backTitle;
                var toMergeTo = [new DX.framework.dxCommand({
                            id: "back",
                            title: backTitle,
                            behavior: "back",
                            onExecute: function() {
                                that.back({stack: stackKey})
                            },
                            icon: "arrowleft",
                            type: "back"
                        })];
                var result = DX.framework.utils.mergeCommands(toMergeTo, commands);
                commands.length = 0;
                commands.push.apply(commands, result)
            },
            _showView: function(viewInfo, direction) {
                var that = this;
                var eventArgs = {
                        viewInfo: viewInfo,
                        direction: direction
                    };
                that._processEvent("viewShowing", eventArgs, viewInfo.model);
                return that._showViewImpl(eventArgs.viewInfo, eventArgs.direction).done(function() {
                        DX.utils.executeAsync(function() {
                            that._processEvent("viewShown", eventArgs, viewInfo.model);
                            that._disposeRemovedViews()
                        })
                    })
            },
            _highlightCurrentNavigationCommand: function(viewInfo) {
                var that = this,
                    selectedCommand,
                    currentUri = viewInfo.uri,
                    currentNavigationItemId = viewInfo.model && viewInfo.model.currentNavigationItemId;
                if (currentNavigationItemId !== undefined)
                    $.each(this.navigation, function(index, command) {
                        if (command.option("id") === currentNavigationItemId) {
                            selectedCommand = command;
                            return false
                        }
                    });
                if (!selectedCommand)
                    $.each(this.navigation, function(index, command) {
                        var commandUri = command.option("onExecute");
                        if (DX.utils.isString(commandUri)) {
                            commandUri = commandUri.replace(/^#+/, "");
                            if (commandUri === that.navigationManager.rootUri()) {
                                selectedCommand = command;
                                return false
                            }
                        }
                    });
                $.each(this.navigation, function(index, command) {
                    if (command === selectedCommand && command.option("highlighted"))
                        command.fireEvent("optionChanged", [{
                                name: "highlighted",
                                value: true,
                                previousValue: true
                            }]);
                    command.option("highlighted", command === selectedCommand)
                })
            },
            _setViewLoadingState: DX.abstract,
            _showViewImpl: DX.abstract,
            _obtainViewLink: function(viewInfo) {
                var key = viewInfo.key;
                if (!this._viewLinksHash[key])
                    this._viewLinksHash[key] = {
                        viewInfo: viewInfo,
                        linkCount: 1
                    };
                else
                    this._viewLinksHash[key].linkCount++
            },
            _releaseViewLink: function(viewInfo) {
                if (this._viewLinksHash[viewInfo.key] === undefined)
                    DX.log("W3001", viewInfo.key);
                if (this._viewLinksHash[viewInfo.key].linkCount === 0)
                    DX.log("W3002", viewInfo.key);
                this._viewLinksHash[viewInfo.key].linkCount--
            },
            navigate: function(uri, options) {
                var that = this;
                if ($.isPlainObject(uri)) {
                    uri = that.router.format(uri);
                    if (uri === false)
                        throw DX.Error("E3002");
                }
                if (!that._initState)
                    that.init().done(function() {
                        that.restoreState();
                        that.navigate(uri, options)
                    });
                else if (that._initState === INIT_COMPLETE)
                    that.navigationManager.navigate(uri, options);
                else
                    throw DX.Error("E3003");
            },
            canBack: function(stackKey) {
                return this.navigationManager.canBack(stackKey)
            },
            _getPreviousViewInfo: function(navigateOptions) {
                var previousNavigationItem = this.navigationManager.previousItem(navigateOptions.stack),
                    result;
                if (previousNavigationItem)
                    result = this.viewCache.getView(previousNavigationItem.key);
                return result
            },
            back: function(options) {
                this.navigationManager.back(options)
            },
            saveState: function() {
                this.stateManager.saveState()
            },
            restoreState: function() {
                this.stateManager.restoreState()
            },
            clearState: function() {
                this.stateManager.clearState()
            }
        }).include(DX.EventsMixin)
    })(jQuery, DevExpress);
    /*! Module framework, file framework.html.js */
    (function($, DX, undefined) {
        DX.framework.html = {
            layoutControllers: [],
            layoutSets: {}
        }
    })(jQuery, DevExpress);
    /*! Module framework, file framework.widgetCommandAdapters.js */
    (function($, DX) {
        var commandToContainer = DX.framework.utils.commandToContainer,
            DX_COMMAND_TO_WIDGET_ADAPTER = "dxCommandToWidgetAdapter";
        var WidgetItemWrapperBase = DX.Class.inherit({
                ctor: function(command, containerOptions) {
                    this.command = command;
                    this.containerOptions = containerOptions;
                    this._createWidgetItem(command, containerOptions);
                    this._commandChangedHandler = $.proxy(this._onCommandChanged, this);
                    command.on("optionChanged", this._commandChangedHandler)
                },
                _createWidgetItem: function(command, containerOptions) {
                    this.widgetItem = $.extend({
                        command: command,
                        containerOptions: containerOptions
                    }, containerOptions, command.option());
                    this._updateItem()
                },
                _onCommandChanged: function(args) {
                    var optionName = args.name,
                        newValue = args.value,
                        oldValue = args.previousValue;
                    this.widgetItem[optionName] = newValue;
                    this._updateItem(optionName, newValue, oldValue)
                },
                _updateItem: function(optionName, newValue, oldValue){},
                dispose: function() {
                    if (this.command)
                        this.command.off("optionChanged", this._commandChangedHandler);
                    delete this.command;
                    delete this.containerOptions;
                    delete this.widgetItem;
                    delete this.updateItemHandler
                }
            });
        var WidgetAdapterBase = DX.Class.inherit({
                ctor: function($widgetElement) {
                    this.$widgetElement = $widgetElement;
                    this.$widgetElement.data(DX_COMMAND_TO_WIDGET_ADAPTER, this);
                    this.widget = this._getWidgetByElement($widgetElement);
                    this._widgetDisposingHandler = $.proxy(this._onWidgetDisposing, this);
                    this.widget.on("disposing", this._widgetDisposingHandler);
                    this.itemWrappers = []
                },
                addCommand: function(command, containerOptions) {
                    var itemWrapper = this._createItemWrapper(command, containerOptions);
                    this.itemWrappers.push(itemWrapper);
                    this._addItemToWidget(itemWrapper);
                    this.refresh();
                    this._commandChangedHandler = $.proxy(this._onCommandChanged, this);
                    itemWrapper.command.on("optionChanged", this._commandChangedHandler)
                },
                beginUpdate: function() {
                    this.widget.beginUpdate()
                },
                endUpdate: function() {
                    this.widget.endUpdate()
                },
                _onWidgetDisposing: function() {
                    this.dispose(true)
                },
                _onCommandChanged: function(args) {
                    if (args.name !== "highlighted")
                        this.refresh()
                },
                _addItemToWidget: function(itemWrapper) {
                    var items = this.widget.option("items");
                    items.push(itemWrapper.widgetItem)
                },
                refresh: function() {
                    var items = this.widget.option("items");
                    this.widget.option("items", items)
                },
                clear: function(widgetDisposing) {
                    var that = this;
                    $.each(that.itemWrappers, function(index, itemWrapper) {
                        itemWrapper.command.off("optionChanged", that._commandChangedHandler);
                        itemWrapper.dispose()
                    });
                    this.itemWrappers.length = 0;
                    if (!widgetDisposing)
                        this._clearWidgetItems()
                },
                _clearWidgetItems: function() {
                    this.widget.option("items", [])
                },
                dispose: function(widgetDisposing) {
                    this.clear(widgetDisposing);
                    if (this.widget) {
                        this.widget.off("disposing", this._widgetDisposingHandler);
                        this.$widgetElement.removeData(DX_COMMAND_TO_WIDGET_ADAPTER);
                        delete this.widget;
                        delete this.$widgetElement
                    }
                }
            });
        var CommandToWidgetAdapter = DX.Class.inherit({
                ctor: function(createAdapter) {
                    this.createAdapter = createAdapter
                },
                _getWidgetAdapter: function($container) {
                    var widgetAdapter = $container.data(DX_COMMAND_TO_WIDGET_ADAPTER);
                    if (!widgetAdapter)
                        widgetAdapter = this.createAdapter($container);
                    return widgetAdapter
                },
                addCommand: function($container, command, containerOptions) {
                    var widgetAdapter = this._getWidgetAdapter($container);
                    widgetAdapter.addCommand(command, containerOptions)
                },
                clearContainer: function($container) {
                    var widgetAdapter = this._getWidgetAdapter($container);
                    widgetAdapter.clear()
                },
                beginUpdate: function($container) {
                    var widgetAdapter = this._getWidgetAdapter($container);
                    widgetAdapter.beginUpdate()
                },
                endUpdate: function($container) {
                    var widgetAdapter = this._getWidgetAdapter($container);
                    widgetAdapter.endUpdate()
                }
            });
        var dxToolbarItemWrapper = WidgetItemWrapperBase.inherit({_updateItem: function() {
                    var widgetItem = this.widgetItem,
                        command = this.command,
                        containerOptions = this.containerOptions,
                        location = commandToContainer.resolvePropertyValue(command, containerOptions, "location"),
                        optionsTarget;
                    widgetItem.location = location;
                    if (location === "menu")
                        optionsTarget = widgetItem;
                    else {
                        optionsTarget = $.extend({}, widgetItem);
                        widgetItem.options = optionsTarget;
                        widgetItem.widget = "button"
                    }
                    optionsTarget.text = commandToContainer.resolveTextValue(command, containerOptions);
                    optionsTarget.disabled = command.option("disabled");
                    optionsTarget.icon = commandToContainer.resolveIconValue(command, containerOptions, "icon");
                    optionsTarget.iconSrc = commandToContainer.resolveIconValue(command, containerOptions, "iconSrc");
                    optionsTarget.type = commandToContainer.resolveTypeValue(command, containerOptions)
                }});
        var dxToolbarAdapter = WidgetAdapterBase.inherit({
                ctor: function($widgetElement) {
                    this.callBase($widgetElement);
                    this.widget.option("onItemClick", $.proxy(this._onToolbarItemClick, this))
                },
                _onToolbarItemClick: function(e) {
                    if (e.itemData.command)
                        e.itemData.command.execute(e)
                },
                _getWidgetByElement: function($element) {
                    return $element.dxToolbar("instance")
                },
                _createItemWrapper: function(command, containerOptions) {
                    return new dxToolbarItemWrapper(command, containerOptions)
                },
                addCommand: function(command, containerOptions) {
                    this.callBase(command, containerOptions);
                    this.widget.option("visible", true)
                }
            });
        var dxActionSheetItemWrapper = WidgetItemWrapperBase.inherit({_updateItem: function() {
                    var widgetItem = this.widgetItem,
                        command = this.command,
                        containerOptions = this.containerOptions;
                    widgetItem.text = commandToContainer.resolveTextValue(command, containerOptions);
                    widgetItem.icon = commandToContainer.resolveIconValue(command, containerOptions, "icon");
                    widgetItem.iconSrc = commandToContainer.resolveIconValue(command, containerOptions, "iconSrc")
                }});
        var dxActionSheetAdapter = WidgetAdapterBase.inherit({
                _createItemWrapper: function(command, containerOptions) {
                    return new dxActionSheetItemWrapper(command, containerOptions)
                },
                _getWidgetByElement: function($element) {
                    return $element.dxActionSheet("instance")
                }
            });
        var dxListItemWrapper = WidgetItemWrapperBase.inherit({
                _createWidgetItem: function(command, containerOptions) {
                    this.callBase(command, containerOptions);
                    this.widgetItem.click = $.proxy(this._itemClick, this)
                },
                _updateItem: function() {
                    var widgetItem = this.widgetItem,
                        command = this.command,
                        containerOptions = this.containerOptions;
                    widgetItem.title = commandToContainer.resolveTextValue(command, containerOptions);
                    widgetItem.icon = commandToContainer.resolveIconValue(command, containerOptions, "icon");
                    widgetItem.iconSrc = commandToContainer.resolveIconValue(command, containerOptions, "iconSrc")
                },
                _itemClick: function(e) {
                    if (!this.widgetItem.disabled)
                        this.command.execute(e)
                }
            });
        var dxListAdapter = WidgetAdapterBase.inherit({
                _createItemWrapper: function(command, containerOptions) {
                    return new dxListItemWrapper(command, containerOptions)
                },
                _getWidgetByElement: function($element) {
                    return $element.dxList("instance")
                }
            });
        var dxNavBarItemWrapper = WidgetItemWrapperBase.inherit({_updateItem: function(optionName, newValue, oldValue) {
                    var command = this.command,
                        containerOptions = this.containerOptions;
                    if (optionName !== "highlighted") {
                        this.widgetItem.text = commandToContainer.resolveTextValue(command, containerOptions);
                        this.widgetItem.icon = commandToContainer.resolveIconValue(command, containerOptions, "icon");
                        this.widgetItem.iconSrc = commandToContainer.resolveIconValue(command, containerOptions, "iconSrc")
                    }
                }});
        var dxNavBarAdapter = WidgetAdapterBase.inherit({
                ctor: function($widgetElement) {
                    this.callBase($widgetElement);
                    this.widget.option("onItemClick", $.proxy(this._onNavBarItemClick, this))
                },
                _onNavBarItemClick: function(e) {
                    var items = this.widget.option("items");
                    for (var i = items.length; --i; )
                        items[i].command.option("highlighted", false);
                    e.itemData.command.execute(e)
                },
                _getWidgetByElement: function($element) {
                    return $element.dxNavBar("instance")
                },
                _createItemWrapper: function(command, containerOptions) {
                    return new dxNavBarItemWrapper(command, containerOptions)
                },
                addCommand: function(command, containerOptions) {
                    this.callBase(command, containerOptions);
                    this._updateSelectedIndex()
                },
                _onCommandChanged: function(args) {
                    var optionName = args.name,
                        newValue = args.value,
                        oldValue = args.previousValue;
                    if (optionName !== "highlighted" || newValue)
                        this._updateSelectedIndex();
                    this.callBase(args)
                },
                _updateSelectedIndex: function() {
                    var items = this.widget.option("items");
                    for (var i = 0, itemsCount = items.length; i < itemsCount; i++)
                        if (items[i].highlighted) {
                            this.widget.option("selectedIndex", i);
                            break
                        }
                }
            });
        var dxPivotItemWrapper = WidgetItemWrapperBase.inherit({_updateItem: function(optionName, newValue, oldValue) {
                    if (optionName === "title")
                        this.widgetItem.title = commandToContainer.resolveTextValue(this.command, this.containerOptions)
                }});
        var dxPivotAdapter = WidgetAdapterBase.inherit({
                ctor: function($widgetElement) {
                    this.callBase($widgetElement);
                    this._highlighting = false;
                    this.widget.option("onSelectionChanged", $.proxy(this._onPivotSelectionChange, this))
                },
                _onPivotSelectionChange: function(e) {
                    if (e.addedItems.length && e.removedItems.length && e.addedItems[0] && e.addedItems[0].command)
                        e.addedItems[0].command.execute(e)
                },
                _getWidgetByElement: function($element) {
                    return $element.dxPivot("instance")
                },
                _createItemWrapper: function(command, containerOptions) {
                    return new dxToolbarItemWrapper(command, containerOptions)
                },
                addCommand: function(command, containerOptions) {
                    this.callBase(command, containerOptions);
                    this._updateSelectedIndex()
                },
                _onCommandChanged: function(args) {
                    var optionName = args.name,
                        newValue = args.value;
                    if (optionName === "visible")
                        this._rerenderPivot();
                    else if (optionName !== "highlighted" || newValue)
                        this._updateSelectedIndex()
                },
                _addItemToWidget: function(itemWrapper) {
                    if (itemWrapper.command.option("visible"))
                        this.callBase(itemWrapper)
                },
                _updateSelectedIndex: function() {
                    var pivot = this.widget,
                        items = pivot.option("items") || [];
                    DX.fx.off = true;
                    for (var i = 0, itemsCount = items.length; i < itemsCount; i++)
                        if (items[i].highlighted) {
                            if (this._highlighting && pivot.option("selectedIndex") === i)
                                this._highlighting = false;
                            pivot.option("selectedIndex", i);
                            break
                        }
                    DX.fx.off = false
                },
                _rerenderPivot: function() {
                    var that = this;
                    that.widget.option("items", []);
                    $.each(that.itemWrappers, function(index, itemWrapper) {
                        if (itemWrapper.command.option("visible"))
                            that._addItemToWidget(itemWrapper)
                    });
                    that.refresh();
                    that._updateSelectedIndex()
                }
            });
        var dxSlideOutItemWrapper = WidgetItemWrapperBase.inherit({_updateItem: function(optionName, newValue, oldValue) {
                    var widgetItem = this.widgetItem,
                        command = this.command,
                        containerOptions = this.containerOptions;
                    if (name !== "highlighted") {
                        widgetItem.title = commandToContainer.resolveTextValue(command, containerOptions);
                        widgetItem.icon = commandToContainer.resolveIconValue(command, containerOptions, "icon");
                        widgetItem.iconSrc = commandToContainer.resolveIconValue(command, containerOptions, "iconSrc")
                    }
                }});
        var dxSlideOutAdapter = WidgetAdapterBase.inherit({
                ctor: function($widgetElement) {
                    this.callBase($widgetElement);
                    this.widget.option("onItemClick", $.proxy(this._onSlideOutItemClick, this))
                },
                _onSlideOutItemClick: function(e) {
                    e.itemData.command.execute(e)
                },
                _getWidgetByElement: function($element) {
                    return $element.dxSlideOut("instance")
                },
                _createItemWrapper: function(command, containerOptions) {
                    return new dxSlideOutItemWrapper(command, containerOptions)
                },
                _updateSelectedIndex: function() {
                    var items = this.widget.option("items") || [];
                    for (var i = 0, itemsCount = items.length; i < itemsCount; i++)
                        if (items[i].highlighted) {
                            this.widget.option("selectedIndex", i);
                            break
                        }
                },
                addCommand: function(command, containerOptions) {
                    this.callBase(command, containerOptions);
                    this._updateSelectedIndex()
                },
                _onCommandChanged: function(args) {
                    var optionName = args.name,
                        newValue = args.value,
                        oldValue = args.previousValue;
                    if (optionName !== "highlighted" || newValue)
                        this._updateSelectedIndex();
                    this.callBase(args)
                }
            });
        var adapters = DX.framework.html.commandToDXWidgetAdapters = {};
        adapters.dxToolbar = new CommandToWidgetAdapter(function($widgetElement) {
            return new dxToolbarAdapter($widgetElement)
        });
        adapters.dxActionSheet = new CommandToWidgetAdapter(function($widgetElement) {
            return new dxActionSheetAdapter($widgetElement)
        });
        adapters.dxList = new CommandToWidgetAdapter(function($widgetElement) {
            return new dxListAdapter($widgetElement)
        });
        adapters.dxNavBar = new CommandToWidgetAdapter(function($widgetElement) {
            return new dxNavBarAdapter($widgetElement)
        });
        adapters.dxPivot = new CommandToWidgetAdapter(function($widgetElement) {
            return new dxPivotAdapter($widgetElement)
        });
        adapters.dxSlideOut = new CommandToWidgetAdapter(function($widgetElement) {
            return new dxSlideOutAdapter($widgetElement)
        });
        DX.framework.html.WidgetItemWrapperBase = WidgetItemWrapperBase;
        DX.framework.html.WidgetAdapterBase = WidgetAdapterBase
    })(jQuery, DevExpress);
    /*! Module framework, file framework.commandManager.js */
    (function($, DX, undefined) {
        var Class = DX.Class,
            ui = DevExpress.ui;
        var CommandContainer = DX.DOMComponent.inherit({
                ctor: function(element, options) {
                    if ($.isPlainObject(element)) {
                        options = element;
                        element = $("<div />")
                    }
                    this.callBase(element, options)
                },
                _setDefaultOptions: function() {
                    this.callBase();
                    this.option({id: null})
                },
                _render: function() {
                    this.callBase();
                    this.element().addClass("dx-command-container")
                }
            });
        DX.registerComponent("dxCommandContainer", DX.framework, CommandContainer);
        DX.framework.html.CommandManager = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this.defaultWidgetAdapter = options.defaultWidgetAdapter || this._getDefaultWidgetAdapter();
                this.commandMapping = options.commandMapping || new DX.framework.CommandMapping
            },
            _getDefaultWidgetAdapter: function() {
                return {
                        addCommand: this._defaultAddCommand,
                        clearContainer: $.noop
                    }
            },
            _getContainerAdapter: function($container) {
                var componentNames = $container.data("dxComponents"),
                    adapters = DX.framework.html.commandToDXWidgetAdapters;
                if (componentNames)
                    for (var index in componentNames) {
                        var widgetName = componentNames[index];
                        if (widgetName in adapters)
                            return adapters[widgetName]
                    }
                return this.defaultWidgetAdapter
            },
            findCommands: function($view) {
                var result = $.map($view.addBack().find(".dx-command"), function(element) {
                        return $(element).dxCommand("instance")
                    });
                return result
            },
            findCommandContainers: function($markup) {
                var result = $.map($markup.find(".dx-command-container"), function(element) {
                        return $(element).dxCommandContainer("instance")
                    });
                return result
            },
            _checkCommandId: function(id, command) {
                if (id === null)
                    throw DX.Error("E3010", command.element().get(0).outerHTML);
            },
            renderCommandsToContainers: function(commands, containers) {
                var that = this,
                    commandHash = {},
                    commandIds = [];
                $.each(commands, function(i, command) {
                    var id = command.option("id");
                    that._checkCommandId(id, command);
                    commandIds.push(id);
                    commandHash[id] = command
                });
                that.commandMapping.checkCommandsExist(commandIds);
                $.each(containers, function(k, container) {
                    var commandInfos = [];
                    $.each(commandHash, function(id, command) {
                        var commandId = id;
                        var commandOptions = that.commandMapping.getCommandMappingForContainer(commandId, container.option("id"));
                        if (commandOptions)
                            commandInfos.push({
                                command: command,
                                options: commandOptions
                            })
                    });
                    if (commandInfos.length)
                        that._attachCommandsToContainer(container.element(), commandInfos)
                })
            },
            clearContainer: function(container) {
                var $container = container.element(),
                    adapter = this._getContainerAdapter($container);
                adapter.clearContainer($container)
            },
            _arrangeCommandsToContainers: function(commands, containers) {
                DX.log("W0002", "CommandManager", "_arrangeCommandsToContainers", "14.1", "Use the 'renderCommandsToContainers' method instead.");
                this.renderCommandsToContainers(commands, containers)
            },
            _attachCommandsToContainer: function($container, commandInfos) {
                var adapter = this._getContainerAdapter($container);
                if (adapter.beginUpdate)
                    adapter.beginUpdate($container);
                $.each(commandInfos, function(index, commandInfo) {
                    adapter.addCommand($container, commandInfo.command, commandInfo.options)
                });
                if (adapter.endUpdate)
                    adapter.endUpdate($container);
                return true
            },
            _defaultAddCommand: function($container, command, options) {
                var $source = command.element();
                if ($source) {
                    $container.append($source);
                    $source.on("dxclick", function() {
                        command.execute()
                    })
                }
            }
        })
    })(jQuery, DevExpress);
    /*! Module framework, file framework.layoutController.js */
    (function($, DX, undefined) {
        var Class = DX.Class;
        var HIDDEN_BAG_ID = "__hidden-bag";
        var TRANSITION_SELECTOR = ".dx-transition:not(.dx-transition .dx-transition)";
        var transitionSelector = function(transitionName) {
                return ".dx-transition-" + transitionName
            };
        DX.framework.html.DefaultLayoutController = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this.name = options.layoutTemplateName || options.name || "";
                this._disableViewLoadingState = options.disableViewLoadingState;
                this._layoutModel = options.layoutModel || {};
                this._defaultPaneName = options.defaultPaneName || "content";
                this.viewReleased = $.Callbacks();
                this.viewRendered = $.Callbacks();
                this._callbacksToEvents("DefaultLayoutController", ["viewReleased", "viewRendered"])
            },
            init: function(options) {
                options = options || {};
                this._visibleViews = {};
                this._$viewPort = options.$viewPort || $("body");
                this._commandManager = options.commandManager;
                this._viewEngine = options.viewEngine;
                this._prepareTemplates();
                this._$viewPort.append(this._getRootElement());
                this._hideElements(this._getRootElement());
                this.DEFAULT_LOADING_TITLE = DX.localization.localizeString("@Loading");
                if (options.templateContext) {
                    this._templateContext = options.templateContext;
                    this._proxiedTemplateContextChangedHandler = $.proxy(this._templateContextChangedHandler, this)
                }
            },
            activate: function() {
                var $rootElement = this._getRootElement();
                this._showElements($rootElement);
                this._attachRefreshViewRequiredHandler();
                return $.Deferred().resolve().promise()
            },
            deactivate: function() {
                this._releaseVisibleViews();
                this._hideElements(this._getRootElement());
                this._detachRefreshViewRequiredHandler();
                return $.Deferred().resolve().promise()
            },
            activeViewInfo: function() {
                return this._visibleViews[this._defaultPaneName]
            },
            _applyTemplate: function($elements, model) {
                $elements.each(function(i, element) {
                    DX.framework.templateProvider.applyTemplate(element, model)
                })
            },
            _releaseVisibleViews: function() {
                var that = this;
                $.each(this._visibleViews, function(index, viewInfo) {
                    that._hideView(viewInfo);
                    that._releaseView(viewInfo)
                });
                this._visibleViews = {}
            },
            _templateContextChangedHandler: function() {
                $.each(this._visibleViews, $.proxy(function(index, viewInfo) {
                    this.showView(viewInfo)
                }, this))
            },
            _attachRefreshViewRequiredHandler: function() {
                if (this._templateContext)
                    this._templateContext.on("optionChanged", this._proxiedTemplateContextChangedHandler)
            },
            _detachRefreshViewRequiredHandler: function() {
                if (this._templateContextChanged)
                    this._templateContext.off("optionChanged", this._proxiedTemplateContextChangedHandler)
            },
            _getPreviousViewInfo: function(viewInfo) {
                return this._visibleViews[this._getViewPaneName(viewInfo.viewTemplateInfo)]
            },
            _prepareTemplates: function() {
                var that = this;
                var $layoutTemplate = that._viewEngine.getLayoutTemplate(this._getLayoutTemplateName()).removeClass("dx-hidden");
                that._$layoutTemplate = $layoutTemplate;
                that._$mainLayout = that._createEmptyLayout();
                that._showElements(that._$mainLayout);
                that._applyTemplate(that._$mainLayout, that._layoutModel);
                that._$navigationWidget = that._createNavigationWidget();
                that._loadingStateViewInfo = that._createLoadingStateViewInfo($layoutTemplate)
            },
            renderNavigation: function(navigationCommands) {
                this._clearNavigationWidget();
                this._renderNavigationImpl(navigationCommands)
            },
            _renderNavigationImpl: function(navigationCommands) {
                this._renderCommands(this._$mainLayout, navigationCommands)
            },
            _createNavigationWidget: function() {
                var result;
                this._$mainLayout.find(".dx-command-container").each(function() {
                    var container = $(this).dxCommandContainer("instance");
                    if (container.option("id") === "global-navigation")
                        result = $(this)
                });
                return result
            },
            _clearNavigationWidget: function() {
                if (this._$navigationWidget)
                    this._commandManager.clearContainer(this._$navigationWidget.dxCommandContainer("instance"))
            },
            _getRootElement: function() {
                return this._$mainLayout
            },
            _getViewFrame: function(viewInfo) {
                return this._$mainLayout
            },
            _getLayoutTemplateName: function() {
                return this.name
            },
            _applyModelToTransitionElements: function($markup, model) {
                var that = this;
                this._getTransitionElements($markup).each(function(i, item) {
                    that._applyTemplate($(item).children(), model)
                })
            },
            _createLoadingStateViewModel: function() {
                return {title: ko.observable()}
            },
            _createLoadingStateViewInfo: function($layoutTemplate) {
                var $loadingStateView = $layoutTemplate.clone().addClass("dx-loading-state-view"),
                    model = this._createLoadingStateViewModel();
                this._hideElements($loadingStateView);
                DX.utils.createComponents($loadingStateView);
                this._applyModelToTransitionElements($loadingStateView, model);
                var result = {
                        model: model,
                        renderResult: {
                            $markup: $loadingStateView,
                            $viewItems: $()
                        },
                        isLoadingStateView: true
                    };
                this._appendViewToLayout(result);
                return result
            },
            _createViewLayoutTemplate: function() {
                var that = this;
                var $viewLayoutTemplate = that._$layoutTemplate.clone();
                this._hideElements($viewLayoutTemplate);
                DX.utils.createComponents($viewLayoutTemplate);
                return $viewLayoutTemplate
            },
            _createEmptyLayout: function() {
                var that = this;
                var $result = that._$layoutTemplate.clone();
                this._hideElements($result);
                DX.utils.createComponents($result);
                that._removeTransitionContent($result);
                return $result
            },
            _removeTransitionContent: function($markup) {
                var $transitionElements = this._getTransitionElements($markup);
                $transitionElements.children().remove()
            },
            _getTransitionElements: function($markup) {
                return $markup.find(TRANSITION_SELECTOR).addBack(TRANSITION_SELECTOR)
            },
            setViewLoadingState: function(viewInfo, direction) {
                var that = this;
                if (that._disableViewLoadingState)
                    return $.Deferred().resolve().promise();
                var loadingStateViewInfo = $.extend({}, viewInfo, that._loadingStateViewInfo);
                that._loadingStateViewInfo.model.title((viewInfo.viewTemplateInfo || {}).title || this.DEFAULT_LOADING_TITLE);
                return that._showViewImpl(loadingStateViewInfo, direction)
            },
            showView: function(viewInfo, direction) {
                var that = this;
                var previousViewInfo = that._getPreviousViewInfo(viewInfo);
                if (previousViewInfo && previousViewInfo.isLoadingStateView)
                    direction = "none";
                that._ensureViewRendered(viewInfo);
                return this._showViewImpl(viewInfo, direction).done(function() {
                        that._onViewShown(viewInfo)
                    })
            },
            disposeView: function(viewInfo) {
                this._clearRenderResult(viewInfo)
            },
            _clearRenderResult: function(viewInfo) {
                if (viewInfo.renderResult) {
                    viewInfo.renderResult.$markup.remove();
                    viewInfo.renderResult.$viewItems.remove();
                    delete viewInfo.renderResult
                }
            },
            _prepareViewTemplate: function($viewTemplate, viewInfo) {
                DX.utils.createComponents($viewTemplate)
            },
            _renderViewImpl: function($viewTemplate, viewInfo) {
                var that = this,
                    allowedChildrenSelector = ".dx-command,.dx-content,script",
                    $layout = this._createViewLayoutTemplate(),
                    $viewItems,
                    isSimplifiedMarkup = true,
                    outOfContentItems = $();
                if ($viewTemplate.children(allowedChildrenSelector).length === 0)
                    this._viewEngine._wrapViewDefaultContent($viewTemplate);
                $viewItems = $viewTemplate.children();
                this._applyModelToTransitionElements($layout, viewInfo.model);
                this._viewEngine.applyLayout($viewTemplate, $layout);
                $viewItems.each(function(i, item) {
                    var $item = $(item);
                    that._applyTemplate($item, viewInfo.model);
                    if ($item.is(allowedChildrenSelector))
                        isSimplifiedMarkup = false;
                    else
                        outOfContentItems = outOfContentItems.add($item)
                });
                if (outOfContentItems.length && !isSimplifiedMarkup)
                    throw DX.Error("E3014", outOfContentItems[0].outerHTML);
                viewInfo.renderResult = viewInfo.renderResult || {};
                viewInfo.renderResult.$viewItems = $viewItems;
                viewInfo.renderResult.$markup = $layout
            },
            _renderCommands: function($markup, commands) {
                var commandContainers = this._findCommandContainers($markup);
                this._commandManager.renderCommandsToContainers(commands, commandContainers)
            },
            _applyViewCommands: function(viewInfo) {
                var $viewItems = viewInfo.renderResult.$viewItems,
                    $markup = viewInfo.renderResult.$markup,
                    viewCommands = this._commandManager.findCommands($viewItems);
                viewInfo.commands = DX.framework.utils.mergeCommands(viewInfo.commands || [], viewCommands);
                this._renderCommands($markup, viewInfo.commands)
            },
            _findCommandContainers: function($markup) {
                return DX.utils.createComponents($markup, ["dxCommandContainer"])
            },
            _ensureViewRendered: function(viewInfo) {
                var viewTemplateInstance = viewInfo.$viewTemplate ? viewInfo.$viewTemplate.dxView("instance") : this._viewEngine.getViewTemplateInfo(viewInfo.viewName),
                    currentViewId = viewTemplateInstance.getId(),
                    $cachedMarkup = viewInfo.renderResult && viewInfo.renderResult.markupCache[currentViewId];
                if ($cachedMarkup)
                    viewInfo.renderResult.$markup = $cachedMarkup;
                else {
                    this._renderView(viewInfo);
                    viewInfo.renderResult.markupCache = viewInfo.renderResult.markupCache || {};
                    viewInfo.renderResult.markupCache[currentViewId] = viewInfo.renderResult.$markup
                }
            },
            _renderView: function(viewInfo) {
                var $viewTemplate = viewInfo.$viewTemplate || this._viewEngine.getViewTemplate(viewInfo.viewName);
                this._prepareViewTemplate($viewTemplate, viewInfo);
                this._renderViewImpl($viewTemplate, viewInfo);
                this._applyViewCommands(viewInfo);
                this._appendViewToLayout(viewInfo);
                $viewTemplate.remove();
                this._onRenderComplete(viewInfo);
                this.fireEvent("viewRendered", [viewInfo])
            },
            _appendViewToLayout: function(viewInfo) {
                var that = this,
                    $viewFrame = that._getViewFrame(viewInfo),
                    $markup = viewInfo.renderResult.$markup,
                    $transitionContentElements = $();
                $.each($markup.find(".dx-content-placeholder"), function(index, el) {
                    var placeholder = $(el).dxContentPlaceholder("instance");
                    placeholder.prepareTransition()
                });
                $.each(that._getTransitionElements($viewFrame), function(index, transitionElement) {
                    var $transition = $(transitionElement),
                        $viewElement = $markup.find(transitionSelector($transition.data("dx-transition-name"))).children();
                    that._hideViewElements($viewElement);
                    $transition.append($viewElement);
                    $transitionContentElements = $transitionContentElements.add($viewElement)
                });
                that._$mainLayout.append(viewInfo.renderResult.$viewItems.filter(".dx-command"));
                $markup.remove();
                viewInfo.renderResult.$markup = $transitionContentElements
            },
            _onRenderComplete: function(viewInfo){},
            _onViewShown: function(viewInfo) {
                $(document).trigger("dx.viewchanged")
            },
            _doTransition: function(viewInfo, direction) {
                var that = this,
                    deferred = $.Deferred();
                var transitions = $.map(viewInfo.renderResult.$markup, function(transitionContent) {
                        var $transitionContent = $(transitionContent),
                            $transition = $transitionContent.parent(),
                            transitionType = that._disableTransitions ? "none" : $transition.data("dx-transition-type");
                        return {
                                destination: $transition,
                                source: $transitionContent,
                                type: transitionType || "none",
                                direction: direction || "none"
                            }
                    });
                that._executeTransitions(transitions).done(function() {
                    deferred.resolve()
                });
                return deferred.promise()
            },
            _hideView: function(viewInfo) {
                if (viewInfo.renderResult)
                    this._hideViewElements(viewInfo.renderResult.$markup)
            },
            _showViewImpl: function(viewInfo, direction) {
                var that = this,
                    deferred = $.Deferred(),
                    previousViewInfo = this._getPreviousViewInfo(viewInfo);
                if (!previousViewInfo || previousViewInfo === viewInfo)
                    direction = "none";
                return that._doTransition(viewInfo, direction).done(function() {
                        that._changeView(viewInfo)
                    })
            },
            _releaseView: function(viewInfo) {
                this.viewReleased.fireWith(this, [viewInfo])
            },
            _changeView: function(viewInfo) {
                var that = this;
                var previousViewInfo = that._getPreviousViewInfo(viewInfo);
                if (previousViewInfo && previousViewInfo !== viewInfo) {
                    that._hideView(previousViewInfo);
                    if (!previousViewInfo.isLoadingStateView)
                        this._releaseView(previousViewInfo)
                }
                this._visibleViews[this._getViewPaneName(viewInfo.viewTemplateInfo)] = viewInfo
            },
            _getViewPaneName: function(viewTemplateInfo) {
                return this._defaultPaneName
            },
            _hideElements: function($elements) {
                $elements.addClass("dx-hidden")
            },
            _showElements: function($elements) {
                $elements.removeClass("dx-hidden");
                $elements.find(".dx-visibility-change-handler").each(function() {
                    $(this).triggerHandler("dxshown")
                })
            },
            _hideViewElements: function($elements) {
                DX.utils.triggerHidingEvent($elements.filter(".dx-active-view"));
                this._patchIDs($elements);
                this._disableInputs($elements);
                $elements.removeClass("dx-active-view").addClass("dx-inactive-view")
            },
            _showViewElements: function($elements) {
                this._unpatchIDs($elements);
                this._enableInputs($elements);
                $elements.removeClass("dx-inactive-view").addClass("dx-active-view");
                DX.utils.triggerShownEvent($elements.filter(".dx-active-view"))
            },
            _executeTransitions: function(transitions) {
                var that = this;
                var animatedTransitions = $.map(transitions, function(transitionOptions) {
                        that._showViewElements(transitionOptions.source);
                        if (transitionOptions.source.children().length)
                            return DX.framework.html.TransitionExecutor.create(transitionOptions.destination, transitionOptions)
                    });
                var animatedDeferreds = $.map(animatedTransitions, function(transition) {
                        transition.options.source.addClass("dx-transition-source");
                        return transition.exec()
                    });
                var result = $.when.apply($, animatedDeferreds).done(function() {
                        $.each(animatedTransitions, function(index, transition) {
                            transition.finalize();
                            that._hideViewElements(transition.options.source.parent().find(".dx-active-view:not(.dx-transition-source)"));
                            transition.options.source.removeClass("dx-transition-source")
                        })
                    });
                return result
            },
            _patchIDs: function($markup) {
                this._processIDs($markup, function(id) {
                    var result = id;
                    if (id.indexOf(HIDDEN_BAG_ID) === -1)
                        result = HIDDEN_BAG_ID + "-" + id;
                    return result
                })
            },
            _unpatchIDs: function($markup) {
                this._processIDs($markup, function(id) {
                    var result = id;
                    if (id.indexOf(HIDDEN_BAG_ID) === 0)
                        result = id.substr(HIDDEN_BAG_ID.length + 1);
                    return result
                })
            },
            _processIDs: function($markup, process) {
                var elementsWithIds = $markup.find("[id]");
                $.each(elementsWithIds, function(index, element) {
                    var $el = $(element),
                        id = $el.attr("id");
                    $el.attr("id", process(id))
                })
            },
            _enableInputs: function($markup) {
                var $inputs = $markup.find(":input[data-disabled=true]");
                $.each($inputs, function(index, input) {
                    $(input).removeAttr("disabled").removeAttr("data-disabled")
                })
            },
            _disableInputs: function($markup) {
                var $inputs = $markup.find(":input:not([disabled], [disabled=true])");
                $.each($inputs, function(index, input) {
                    $(input).attr({
                        disabled: true,
                        "data-disabled": true
                    })
                })
            }
        }).include(DX.EventsMixin);
        var layoutSets = DX.framework.html.layoutSets;
        layoutSets["default"] = layoutSets["default"] || [];
        layoutSets["default"].push({controller: new DX.framework.html.DefaultLayoutController})
    })(jQuery, DevExpress);
    /*! Module framework, file framework.viewEngine.js */
    (function($, DX, undefined) {
        var Class = DX.Class,
            framework = DX.framework,
            _VIEW_ROLE = "dxView",
            _LAYOUT_ROLE = "dxLayout",
            lastViewId = 0;
        DX.registerComponent(_VIEW_ROLE, framework, DX.DOMComponent.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    name: null,
                    title: null,
                    layout: null
                })
            },
            ctor: function() {
                this.callBase.apply(this, arguments);
                this._id = ++lastViewId
            },
            _render: function() {
                this.callBase();
                this.element().addClass("dx-view")
            },
            getId: function() {
                return this._id
            }
        }), framework);
        DX.registerComponent(_LAYOUT_ROLE, framework, DX.DOMComponent.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({name: null})
            },
            _render: function() {
                this.callBase();
                this.element().addClass("dx-layout")
            }
        }));
        DX.registerComponent("dxViewPlaceholder", framework, DX.DOMComponent.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({viewName: null})
            },
            _render: function() {
                this.callBase();
                this.element().addClass("dx-view-placeholder")
            }
        }));
        var setupTransitionElement = function($element, transitionType, transitionName, contentCssPosition) {
                if (contentCssPosition === "absolute")
                    $element.addClass("dx-transition-absolute");
                else
                    $element.addClass("dx-transition-static");
                $element.addClass("dx-transition").addClass("dx-transition-" + transitionName);
                $element.data("dx-transition-type", transitionType);
                $element.data("dx-transition-name", transitionName)
            };
        var setupTransitionInnerElement = function($element) {
                $element.addClass("dx-transition-inner-wrapper")
            };
        DX.registerComponent("dxTransition", framework, DX.DOMComponent.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    name: null,
                    type: "slide"
                })
            },
            _render: function() {
                this.callBase();
                var element = this.element();
                setupTransitionElement(element, this.option("type"), this.option("name"), "absolute");
                element.wrapInner("<div/>");
                setupTransitionInnerElement(element.children())
            },
            _clean: function() {
                this.callBase();
                this.element().empty()
            }
        }));
        DX.registerComponent("dxContentPlaceholder", framework, DX.DOMComponent.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    name: null,
                    transition: "none",
                    contentCssPosition: "absolute"
                })
            },
            _render: function() {
                this.callBase();
                var $element = this.element();
                $element.addClass("dx-content-placeholder").addClass("dx-content-placeholder-" + this.option("name"));
                setupTransitionElement($element, this.option("transition"), this.option("name"), this.option("contentCssPosition"))
            },
            prepareTransition: function() {
                var $element = this.element();
                if ($element.children(".dx-content").length === 0) {
                    $element.wrapInner("<div>");
                    $element.children().dxContent({targetPlaceholder: this.option("name")})
                }
            }
        }));
        DX.registerComponent("dxContent", framework, DX.DOMComponent.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({targetPlaceholder: null})
            },
            _optionChanged: function(args) {
                this._refresh()
            },
            _clean: function() {
                this.callBase();
                this.element().removeClass(this._currentClass)
            },
            _render: function() {
                this.callBase();
                var element = this.element();
                element.addClass("dx-content");
                this._currentClass = "dx-content-" + this.option("targetPlaceholder");
                element.addClass(this._currentClass);
                setupTransitionInnerElement(element)
            }
        }));
        framework.html.ViewEngine = Class.inherit({
            ctor: function(options) {
                options = options || {};
                this.$root = options.$root;
                this.device = options.device || {};
                this.dataOptionsAttributeName = options.dataOptionsAttributeName || "data-options";
                this._templateMap = {};
                this._pendingViewContainer = null;
                this.markupLoaded = $.Callbacks();
                this._templateContext = options.templateContext
            },
            _enumerateTemplates: function(processFn) {
                var that = this;
                $.each(that._templateMap, function(name, templatesByRoleMap) {
                    $.each(templatesByRoleMap, function(role, templates) {
                        $.each(templates, function(index, template) {
                            processFn(template)
                        })
                    })
                })
            },
            _findComponent: function(name, role) {
                var components = (this._templateMap[name] || {})[role] || [],
                    filter = this._templateContext && this._templateContext.option() || {};
                components = this._filterTemplates(filter, components);
                this._checkMatchedTemplates(components);
                return components[0]
            },
            _findTemplate: function(name, role) {
                var component = this._findComponent(name, role);
                if (!component)
                    throw DX.Error("E3013", role, name);
                var $template = component.element(),
                    $result = $template.clone();
                DX.utils.createComponents($result, [role]);
                return $result
            },
            _extendModelFromViewData: function($view, model) {
                DX.utils.extendFromObject(model, $view.data(_VIEW_ROLE).option())
            },
            _loadTemplatesFromMarkupCore: function($markup) {
                var that = this;
                if ($markup.find("[data-dx-role]").length)
                    throw DX.Error("E3019");
                that.markupLoaded.fire({markup: $markup});
                $markup.appendTo(that.$root);
                var components = DX.utils.createComponents($markup, [_VIEW_ROLE, _LAYOUT_ROLE]);
                $.each(components, function(index, component) {
                    var $element = component.element();
                    $element.addClass("dx-hidden");
                    that._registerTemplateComponent(component);
                    component.element().detach()
                })
            },
            _registerTemplateComponent: function(component) {
                var role = component.NAME,
                    options = component.option(),
                    templateName = options.name,
                    componentsByRoleMap = this._templateMap[templateName] || {};
                componentsByRoleMap[role] = componentsByRoleMap[role] || [];
                componentsByRoleMap[role].push(component);
                this._templateMap[templateName] = componentsByRoleMap
            },
            _applyPartialViews: function($render) {
                var that = this;
                DX.utils.createComponents($render, ["dxViewPlaceholder"]);
                $.each($render.find(".dx-view-placeholder"), function() {
                    var $partialPlaceholder = $(this);
                    if ($partialPlaceholder.children().length)
                        return;
                    var viewName = $partialPlaceholder.data("dxViewPlaceholder").option("viewName"),
                        $view = that._findTemplate(viewName, _VIEW_ROLE);
                    that._applyPartialViews($view);
                    $partialPlaceholder.append($view);
                    $view.removeClass("dx-hidden")
                })
            },
            _ajaxImpl: function() {
                return $.ajax.apply($, arguments)
            },
            _loadTemplatesFromURL: function(url) {
                var that = this,
                    options = this._getLoadOptions(),
                    deferred = $.Deferred(),
                    url = options.winPhonePrefix + url;
                this._ajaxImpl({
                    url: url,
                    isLocal: options.isLocal,
                    dataType: "html"
                }).done(function(data) {
                    that._loadTemplatesFromMarkupCore(DX.utils.createMarkupFromString(data));
                    deferred.resolve()
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    var error = DX.Error("E3021", url, errorThrown);
                    deferred.reject(error)
                });
                return deferred.promise()
            },
            _getLoadOptions: function() {
                if (location.protocol.indexOf("wmapp") >= 0)
                    return {
                            winPhonePrefix: location.protocol + "www/",
                            isLocal: true
                        };
                return {
                        winPhonePrefix: "",
                        isLocal: undefined
                    }
            },
            _loadExternalTemplates: function() {
                var tasks = [],
                    that = this;
                $("head").find("link[rel='dx-template']").each(function(index, link) {
                    var task = that._loadTemplatesFromURL($(link).attr("href"));
                    tasks.push(task)
                });
                return $.when.apply($, tasks)
            },
            _processTemplates: function() {
                var that = this;
                $.each(that._templateMap, function(name, templatesByRoleMap) {
                    $.each(templatesByRoleMap, function(role, templates) {
                        that._filterTemplatesByDevice(templates)
                    })
                });
                that._enumerateTemplates(function(template) {
                    that._applyPartialViews(template.element())
                })
            },
            _filterTemplatesByDevice: function(components) {
                var filteredComponents = this._filterTemplates(this.device, components);
                $.each(components, function(index, component) {
                    if ($.inArray(component, filteredComponents) < 0) {
                        component._dispose();
                        component.element().remove()
                    }
                });
                components.length = 0;
                components.push.apply(components, filteredComponents)
            },
            _filterTemplates: function(filter, components) {
                return DX.utils.findBestMatches(filter, components, function(component) {
                        return component.option()
                    })
            },
            _checkMatchedTemplates: function(bestMatches) {
                if (bestMatches.length > 1) {
                    var message = "";
                    $.each(bestMatches, function(index, match) {
                        message += match.element().attr("data-options") + "\r\n"
                    });
                    throw DX.Error("E3020", message, JSON.stringify(this.device));
                }
            },
            _extendModelFormViewTemplate: function($viewTemplate, model) {
                this._extendModelFromViewData($viewTemplate, model)
            },
            _ensureTemplates: function(viewInfo) {
                this._ensureViewTemplate(viewInfo)
            },
            _ensureViewTemplate: function(viewInfo) {
                viewInfo.$viewTemplate = viewInfo.$viewTemplate || this.getViewTemplate(viewInfo.viewName);
                return viewInfo.$viewTemplate
            },
            _wrapViewDefaultContent: function($viewTemplate) {
                $viewTemplate.wrapInner("<div class=\"dx-full-height\"></div>");
                $viewTemplate.children().eq(0).dxContent({targetPlaceholder: 'content'})
            },
            _initDefaultLayout: function() {
                this._$defaultLayoutTemplate = $("<div class=\"dx-full-height\" data-options=\"dxLayout : { name: 'default' } \"> \
                <div class=\"dx-full-height\" data-options=\"dxContentPlaceholder : { name: 'content' } \" ></div> \
            </div>")
            },
            _getDefaultLayoutTemplate: function() {
                var $result = this._$defaultLayoutTemplate.clone();
                DX.utils.createComponents($result);
                return $result
            },
            applyLayout: function($view, $layout) {
                if ($layout === undefined || $layout.length === 0)
                    $layout = this._getDefaultLayoutTemplate();
                if ($view.children(".dx-content").length === 0)
                    this._wrapViewDefaultContent($view);
                var $toMerge = $().add($layout).add($view);
                var $placeholderContents = $toMerge.find(".dx-content");
                $.each($placeholderContents, function() {
                    var $placeholderContent = $(this);
                    var placeholderId = $placeholderContent.data("dxContent").option("targetPlaceholder");
                    var $placeholder = $toMerge.find(".dx-content-placeholder-" + placeholderId);
                    $placeholder.empty();
                    $placeholder.append($placeholderContent)
                });
                $placeholderContents.filter(":not(.dx-content-placeholder .dx-content)").remove();
                return $layout
            },
            init: function() {
                var that = this;
                this._initDefaultLayout();
                return this._loadExternalTemplates().done(function() {
                        that._loadTemplatesFromMarkupCore(that.$root.children());
                        that._processTemplates()
                    })
            },
            getViewTemplate: function(viewName) {
                return this._findTemplate(viewName, _VIEW_ROLE)
            },
            getViewTemplateInfo: function(name) {
                return this._findComponent(name, _VIEW_ROLE)
            },
            getLayoutTemplate: function(layoutName) {
                if (!layoutName)
                    return this._getDefaultLayoutTemplate();
                return this._findTemplate(layoutName, _LAYOUT_ROLE)
            },
            getLayoutTemplateInfo: function(name) {
                return this._findComponent(name, _LAYOUT_ROLE)
            },
            loadTemplates: function(source) {
                var result;
                if (typeof source === "string")
                    result = this._loadTemplatesFromURL(source);
                else {
                    this._loadTemplatesFromMarkupCore(source);
                    result = $.Deferred().resolve().promise()
                }
                return result.done($.proxy(this._processTemplates, this))
            }
        })
    })(jQuery, DevExpress);
    /*! Module framework, file framework.htmlApplication.js */
    (function($, DX, undefined) {
        var frameworkNS = DX.framework,
            htmlNS = frameworkNS.html;
        var VIEW_PORT_CLASSNAME = "dx-viewport";
        htmlNS.HtmlApplication = frameworkNS.Application.inherit({
            ctor: function(options) {
                options = options || {};
                this.callBase(options);
                this._$root = $(options.rootNode || document.body);
                this._initViewport(options.viewPort);
                if (this._applicationMode === "mobileApp")
                    DX.utils.initMobileViewport(options.viewPort);
                this.device = options.device || DX.devices.current();
                var layoutSets = DX.framework.html.layoutSets;
                this.commandManager = options.commandManager || new DX.framework.html.CommandManager({commandMapping: this.commandMapping});
                $.each(options.layoutControllers || DX.framework.html.layoutControllers, function(_, layoutControllerInfo) {
                    var targetLayoutSet = layoutControllerInfo.navigationType;
                    layoutSets[targetLayoutSet] = layoutSets[targetLayoutSet] || [];
                    layoutSets[targetLayoutSet].push(layoutControllerInfo);
                    delete layoutControllerInfo.navigationType
                });
                if (options.navigationType)
                    DX.log("W0001", "HtmlApplication", "navigationType", "14.1", "Use the 'layoutSet' option instead.");
                if (options.defaultLayout)
                    DX.log("W0001", "HtmlApplication", "defaultLayout", "13.2", "Use the 'layoutSet' option instead.");
                var navigationType = options.navigationType || options.defaultLayout;
                if (navigationType)
                    options.layoutSet = layoutSets[navigationType];
                this._initTemplateContext();
                this.viewEngine = options.viewEngine || new htmlNS.ViewEngine({
                    $root: this._$root,
                    device: this.device,
                    templateContext: this._templateContext
                });
                this.components.push(this.viewEngine);
                this._initMarkupFilters(this.viewEngine);
                this.viewRendered = $.Callbacks();
                this._layoutSet = options.layoutSet || (options.layoutControllers && options.layoutControllers.length ? options.layoutControllers : layoutSets["default"]);
                this._availableLayoutControllers = [];
                this._activeLayoutControllersStack = [];
                this.resolveLayoutController = $.Callbacks();
                this._callbacksToEvents("HtmlApplication", ["viewRendered", "resolveLayoutController"])
            },
            _localizeMarkup: function($markup) {
                DX.localization.localizeNode($markup)
            },
            _notifyIfBadMarkup: function($markup) {
                $markup.each(function() {
                    var html = $(this).html();
                    if (/href="#/.test(html))
                        DX.log("W3005", html)
                })
            },
            _initMarkupFilters: function(viewEngine) {
                var filters = [];
                filters.push(this._localizeMarkup);
                filters.push(this._notifyIfBadMarkup);
                if (viewEngine.markupLoaded)
                    viewEngine.markupLoaded.add(function(args) {
                        $.each(filters, function(_, filter) {
                            filter(args.markup)
                        })
                    })
            },
            _createViewCache: function(options) {
                var result = this.callBase(options);
                if (!options.viewCache)
                    result = new DX.framework.ConditionalViewCacheDecorator({
                        filter: function(key, viewInfo) {
                            return !viewInfo.viewTemplateInfo.disableCache
                        },
                        viewCache: result
                    });
                return result
            },
            _initViewport: function() {
                this._$viewPort = this._getViewPort();
                DX.viewPort(this._$viewPort)
            },
            _getViewPort: function() {
                var $viewPort = $("." + VIEW_PORT_CLASSNAME);
                if (!$viewPort.length)
                    $viewPort = $("<div>").addClass(VIEW_PORT_CLASSNAME).appendTo(this._$root);
                return $viewPort
            },
            _initTemplateContext: function() {
                this._templateContext = new DX.Component({orientation: DX.devices.orientation()});
                DX.devices.on("orientationChanged", $.proxy(function(args) {
                    this._templateContext.option("orientation", args.orientation)
                }, this))
            },
            _showViewImpl: function(viewInfo, direction) {
                var that = this,
                    result = $.Deferred(),
                    layoutController = viewInfo.layoutController;
                that._obtainViewLink(viewInfo);
                layoutController.showView(viewInfo, direction).done(function() {
                    that._activateLayoutController(layoutController, that._getTargetNode(viewInfo)).done(function() {
                        result.resolve()
                    })
                });
                return result.promise()
            },
            _setViewLoadingState: function(viewInfo, direction) {
                var that = this,
                    result = $.Deferred(),
                    layoutController = viewInfo.layoutController;
                layoutController.setViewLoadingState(viewInfo, direction).done(function() {
                    that._activateLayoutController(layoutController, that._getTargetNode(viewInfo)).done(function() {
                        result.resolve()
                    })
                });
                return result.promise()
            },
            _resolveLayoutController: function(viewInfo) {
                var args = {
                        viewInfo: viewInfo,
                        layoutController: null,
                        availableLayoutControllers: this._availableLayoutControllers
                    };
                this._processEvent("resolveLayoutController", args, viewInfo.model);
                return args.layoutController || this._resolveLayoutControllerImpl(viewInfo)
            },
            _ensureOneLayoutControllerFound: function(target, matches) {
                var toJSONInterceptor = function(key, value) {
                        if (key === "controller")
                            return "[controller]: { name:" + value.name + " }";
                        return value
                    };
                if (!matches.length) {
                    DX.log("W3003", JSON.stringify(target, null, 4), JSON.stringify(this._availableLayoutControllers, toJSONInterceptor, 4));
                    throw DX.Error("E3011");
                }
                if (matches.length > 1) {
                    DX.log("W3004", JSON.stringify(target, null, 4), JSON.stringify(matches, toJSONInterceptor, 4));
                    throw DX.Error("E3012");
                }
            },
            _resolveLayoutControllerImpl: function(viewInfo) {
                var templateInfo = viewInfo.viewTemplateInfo || {},
                    navigateOptions = viewInfo.navigateOptions || {},
                    target = $.extend({
                        root: !viewInfo.canBack,
                        customResolveRequired: false,
                        pane: templateInfo.pane,
                        modal: navigateOptions.modal !== undefined ? navigateOptions.modal : templateInfo.modal || false
                    }, DX.devices.current());
                var matches = DX.utils.findBestMatches(target, this._availableLayoutControllers);
                this._ensureOneLayoutControllerFound(target, matches);
                return matches[0].controller
            },
            _onNavigatingBack: function(args) {
                this.callBase.apply(this, arguments);
                if (!args.cancel && !this.canBack() && this._activeLayoutControllersStack.length > 1) {
                    var previousActiveLayoutController = this._activeLayoutControllersStack[this._activeLayoutControllersStack.length - 2],
                        previousViewInfo = previousActiveLayoutController.activeViewInfo();
                    args.cancel = true;
                    this._activateLayoutController(previousActiveLayoutController);
                    this.navigationManager.currentItem(previousViewInfo.key)
                }
            },
            _activeLayoutController: function() {
                return this._activeLayoutControllersStack.length ? this._activeLayoutControllersStack[this._activeLayoutControllersStack.length - 1] : undefined
            },
            _getTargetNode: function(viewInfo) {
                var jQueryEvent = (viewInfo.navigateOptions || {}).jQueryEvent;
                return jQueryEvent ? $(jQueryEvent.target) : undefined
            },
            _activateLayoutController: function(layoutController, targetNode) {
                var that = this,
                    result = $.Deferred(),
                    activeLayoutController = that._activeLayoutController();
                if (activeLayoutController !== layoutController)
                    layoutController.activate(targetNode).done(function() {
                        if (activeLayoutController && !layoutController.isOverlay)
                            activeLayoutController.deactivate().done(function() {
                                that._activeLayoutControllersStack.pop();
                                that._activeLayoutControllersStack.push(layoutController);
                                result.resolve()
                            });
                        else {
                            that._activeLayoutControllersStack.push(layoutController);
                            result.resolve()
                        }
                    });
                else
                    result.resolve();
                return result.promise()
            },
            init: function() {
                var that = this,
                    result = this.callBase();
                result.done(function() {
                    that._initLayoutControllers();
                    that.renderNavigation()
                });
                return result
            },
            _disposeView: function(viewInfo) {
                if (viewInfo.layoutController.disposeView)
                    viewInfo.layoutController.disposeView(viewInfo);
                this.callBase(viewInfo)
            },
            viewPort: function() {
                return this._$viewPort
            },
            _createViewInfo: function(navigationItem, navigateOptions) {
                var viewInfo = this.callBase.apply(this, arguments),
                    templateInfo = this.getViewTemplateInfo(viewInfo.viewName);
                if (!templateInfo)
                    throw DX.Error("E3013", "dxView", viewInfo.viewName);
                viewInfo.viewTemplateInfo = templateInfo;
                viewInfo.layoutController = this._resolveLayoutController(viewInfo);
                return viewInfo
            },
            _createViewModel: function(viewInfo) {
                this.callBase(viewInfo);
                var templateInfo = viewInfo.viewTemplateInfo,
                    model = viewInfo.model;
                for (var name in templateInfo)
                    if (!(name in model))
                        model[name] = templateInfo[name]
            },
            _initLayoutControllers: function() {
                var that = this;
                $.each(that._layoutSet, function(index, controllerInfo) {
                    var controller = controllerInfo.controller,
                        target = DX.devices.current();
                    if (DX.utils.findBestMatches(target, [controllerInfo]).length) {
                        that._availableLayoutControllers.push(controllerInfo);
                        if (controller.init)
                            controller.init({
                                app: that,
                                $viewPort: that._$viewPort,
                                navigationManager: that.navigationManager,
                                viewEngine: that.viewEngine,
                                templateContext: that._templateContext,
                                commandManager: that.commandManager
                            });
                        if (controller.on) {
                            controller.on("viewReleased", function(viewInfo) {
                                that._onViewReleased(viewInfo)
                            });
                            controller.on("viewRendered", function(viewInfo) {
                                that._processEvent("viewRendered", {viewInfo: viewInfo}, viewInfo.model)
                            })
                        }
                    }
                })
            },
            _onViewReleased: function(viewInfo) {
                this._onViewHidden(viewInfo);
                this._releaseViewLink(viewInfo)
            },
            renderNavigation: function() {
                var that = this;
                $.each(that._availableLayoutControllers, function(index, controllerInfo) {
                    var controller = controllerInfo.controller;
                    if (controller.renderNavigation)
                        controller.renderNavigation(that.navigation)
                })
            },
            getViewTemplate: function(viewName) {
                return this.viewEngine.getViewTemplate(viewName)
            },
            getViewTemplateInfo: function(viewName) {
                var viewComponent = this.viewEngine.getViewTemplateInfo(viewName);
                return viewComponent && viewComponent.option()
            },
            loadTemplates: function(source) {
                return this.viewEngine.loadTemplates(source)
            },
            templateContext: function() {
                return this._templateContext
            }
        })
    })(jQuery, DevExpress);
    /*! Module framework, file framework.transitionExecutor.js */
    (function($, DX) {
        $.fn.extend({unwrapInner: function(selector) {
                return this.each(function() {
                        var t = this,
                            c = $(t).children(selector);
                        c.each(function() {
                            var e = $(this);
                            e.contents().appendTo(t);
                            e.remove()
                        })
                    })
            }});
        var TRANSITION_DURATION = 400;
        var TransitionExecutor = DX.Class.inherit({
                ctor: function(container, options) {
                    this.container = container;
                    this.options = options
                },
                exec: function() {
                    var that = this,
                        options = that.options;
                    var $source = options.source,
                        $destination = options.destination;
                    var $sourceAbsoluteWrapper = $source,
                        $destinationRelativeWrapper = $destination,
                        $destinationAbsoluteWrapper = that._getTransitionInnerElement($destination);
                    this._finalize = function(){};
                    return that._animate($.extend({}, options, {
                            source: $sourceAbsoluteWrapper,
                            destination: $destinationAbsoluteWrapper
                        }))
                },
                finalize: function() {
                    if (!this._finalize)
                        throw DX.Error("E3015");
                    this._finalize()
                },
                _getTransitionInnerElement: function($transitionElement) {
                    return $transitionElement.children(".dx-active-view:not(.dx-transition-source)")
                },
                _animate: function() {
                    return (new $.Deferred).resolve().promise()
                }
            });
        var NoneTransitionExecutor = TransitionExecutor.inherit({_animate: function(options) {
                    var $source = options.source,
                        $destination = options.destination;
                    var containerWidth = this.container.width();
                    DX.fx.animate($source, {
                        type: "slide",
                        from: {left: 0},
                        to: {left: 0},
                        duration: 0
                    });
                    DX.fx.animate($destination, {
                        type: "slide",
                        from: {left: -containerWidth},
                        to: {left: -containerWidth},
                        duration: 0
                    });
                    return $.Deferred().resolve().promise()
                }});
        var SlideTransitionExecutor = TransitionExecutor.inherit({_animate: function(options) {
                    if (options.direction === "none")
                        return $.Deferred().resolve().promise();
                    var $source = options.source,
                        $destination = options.destination;
                    var directionModifier = options.direction === "backward" ? -1 : 1,
                        rtlModifier = DX.rtlEnabled ? -1 : 1,
                        containerWidth = this.container.width() * directionModifier * rtlModifier;
                    var promiseSource = DX.fx.animate($source, {
                            type: "slide",
                            from: {left: containerWidth},
                            to: {left: 0},
                            duration: TRANSITION_DURATION
                        });
                    var promiseDestination = DX.fx.animate($destination, {
                            type: "slide",
                            from: {left: 0},
                            to: {left: -containerWidth},
                            duration: TRANSITION_DURATION
                        });
                    return $.when(promiseDestination, promiseSource)
                }});
        var SlideIOS7TransitionExecutor = TransitionExecutor.inherit({_animate: function(options) {
                    if (options.direction === "none")
                        return $.Deferred().resolve().promise();
                    var $source = options.source,
                        $destination = options.destination;
                    var rtlModifier = DX.rtlEnabled ? -1 : 1,
                        containerWidth = this.container.width() * rtlModifier,
                        slowTransitionWidth = containerWidth / 5,
                        sourceLeftFrom,
                        sourceLeftTo,
                        destinationLeftFrom,
                        destinationLeftTo,
                        sourceZIndex = $source.css("z-index"),
                        destinationZIndex = $destination.css("z-index");
                    if (options.direction === "backward") {
                        sourceLeftFrom = -slowTransitionWidth;
                        sourceLeftTo = 0;
                        destinationLeftFrom = 0;
                        destinationLeftTo = containerWidth;
                        $source.css("z-index", 1);
                        $destination.css("z-index", 2)
                    }
                    else {
                        sourceLeftFrom = containerWidth;
                        sourceLeftTo = 0;
                        destinationLeftFrom = 0;
                        destinationLeftTo = -slowTransitionWidth;
                        $source.css("z-index", 2);
                        $destination.css("z-index", 1)
                    }
                    var promiseSource = DX.fx.animate($source, {
                            type: "slide",
                            from: {left: sourceLeftFrom},
                            to: {left: sourceLeftTo},
                            duration: TRANSITION_DURATION
                        });
                    var promiseDestination = DX.fx.animate($destination, {
                            type: "slide",
                            from: {left: destinationLeftFrom},
                            to: {left: destinationLeftTo},
                            duration: TRANSITION_DURATION
                        });
                    return $.when(promiseDestination, promiseSource).done(function() {
                            $source.css("z-index", sourceZIndex);
                            $destination.css("z-index", destinationZIndex)
                        })
                }});
        var OverflowTransitionExecutor = TransitionExecutor.inherit({_animate: function(options) {
                    var $source = options.source,
                        $destination = options.destination,
                        destinationTop = $destination.position().top,
                        destinationLeft = $destination.position().left,
                        containerWidth = this.container.width();
                    if (options.direction === "backward")
                        containerWidth = -containerWidth;
                    var animations = [];
                    if (options.direction === "forward")
                        animations.push(DX.fx.animate($source, {
                            type: "slide",
                            from: {
                                top: destinationTop,
                                left: containerWidth + destinationLeft,
                                "z-index": 1
                            },
                            to: {left: destinationLeft},
                            duration: TRANSITION_DURATION
                        }));
                    else {
                        animations.push(DX.fx.animate($source, {
                            type: "slide",
                            from: {
                                left: destinationLeft,
                                "z-index": 1
                            },
                            to: {left: destinationLeft},
                            duration: TRANSITION_DURATION
                        }));
                        animations.push(DX.fx.animate($destination, {
                            type: "slide",
                            from: {"z-index": 2},
                            to: {left: destinationLeft - containerWidth},
                            duration: TRANSITION_DURATION
                        }))
                    }
                    return $.when.apply($, animations)
                }});
        var FadeTransitionExecutor = TransitionExecutor.inherit({_animate: function(options) {
                    var $source = options.source,
                        $destination = options.destination,
                        d = new $.Deferred;
                    $source.css({opacity: 0});
                    $destination.animate({opacity: 0}, TRANSITION_DURATION);
                    $source.animate({opacity: 1}, TRANSITION_DURATION, function() {
                        d.resolve()
                    });
                    return d.promise()
                }});
        var transitionType = function(options) {
                if (options.type === "fade")
                    return options.type;
                if (options.direction === "none")
                    return "none";
                return options.type
            };
        TransitionExecutor.create = function(container, options) {
            var device = DX.devices.current();
            switch (transitionType(options)) {
                case"none":
                    return new NoneTransitionExecutor(container, options);
                case"slide":
                    if (device.platform === "ios" && device.version[0] === 7)
                        return new SlideIOS7TransitionExecutor(container, options);
                    else
                        return new SlideTransitionExecutor(container, options);
                case"fade":
                    return new FadeTransitionExecutor(container, options);
                case"overflow":
                    return new OverflowTransitionExecutor(container, options);
                default:
                    throw DX.Error("E3016", options.type);
            }
        };
        DX.framework.html.TransitionExecutor = TransitionExecutor;
        DX.framework.html.NoneTransitionExecutor = NoneTransitionExecutor;
        DX.framework.html.SlideIOS7TransitionExecutor = SlideIOS7TransitionExecutor;
        DX.framework.html.SlideTransitionExecutor = SlideTransitionExecutor;
        DX.framework.html.OverflowTransitionExecutor = OverflowTransitionExecutor;
        DX.framework.html.FadeTransitionExecutor = FadeTransitionExecutor
    })(jQuery, DevExpress);
    DevExpress.MOD_FRAMEWORK = true
}