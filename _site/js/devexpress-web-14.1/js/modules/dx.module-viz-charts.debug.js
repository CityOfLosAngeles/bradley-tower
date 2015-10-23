/*! 
* DevExtreme (Charts)
* Version: 14.2.3
* Build date: Dec 3, 2014
*
* Copyright (c) 2012 - 2014 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
*/

"use strict";
if (!DevExpress.MOD_VIZ_CHARTS) {
    if (!DevExpress.MOD_VIZ_CORE)
        throw Error('Required module is not referenced: viz-core');
    /*! Module viz-charts, file chartTitle.js */
    (function($, DX, undefined) {
        var viz = DX.viz,
            vizUtils = viz.core.utils,
            isDefined = DX.utils.isDefined,
            DEFAULT_MARGIN = 10;
        function parseMargins(options) {
            options.margin = isDefined(options.margin) ? options.margin : {};
            if (typeof options.margin === 'number') {
                options.margin = options.margin >= 0 ? options.margin : DEFAULT_MARGIN;
                options.margin = {
                    top: options.margin,
                    bottom: options.margin,
                    left: options.margin,
                    right: options.margin
                }
            }
            else {
                options.margin.top = options.margin.top >= 0 ? options.margin.top : DEFAULT_MARGIN;
                options.margin.bottom = options.margin.bottom >= 0 ? options.margin.bottom : DEFAULT_MARGIN;
                options.margin.left = options.margin.left >= 0 ? options.margin.left : DEFAULT_MARGIN;
                options.margin.right = options.margin.right >= 0 ? options.margin.right : DEFAULT_MARGIN
            }
        }
        function parseAlignments(options) {
            options.verticalAlignment = (options.verticalAlignment || '').toLowerCase();
            options.horizontalAlignment = (options.horizontalAlignment || '').toLowerCase();
            if (options.verticalAlignment !== 'top' && options.verticalAlignment !== 'bottom')
                options.verticalAlignment = 'top';
            if (options.horizontalAlignment !== 'left' && options.horizontalAlignment !== 'center' && options.horizontalAlignment !== 'right')
                options.horizontalAlignment = 'center'
        }
        function endsWith(value, pattern) {
            return value.substr(value.length - pattern.length) === pattern
        }
        function startsWith(value, pattern) {
            return value.indexOf(pattern) === 0
        }
        function ChartTitle() {
            this.ctor.apply(this, arguments)
        }
        viz.charts.ChartTitle = ChartTitle;
        ChartTitle.prototype = {
            ctor: function(renderer, options, width, group) {
                var that = this;
                that.update(options, width);
                that.renderer = renderer;
                that.titleGroup = group
            },
            dispose: function() {
                var that = this;
                that.renderer = null;
                that.clipRect = null;
                that.title = null;
                that.innerTitleGroup = null;
                that.titleGroup = null;
                that.options = null
            },
            update: function(options, width) {
                var that = this;
                if (options) {
                    parseAlignments(options);
                    that.horizontalAlignment = options.horizontalAlignment;
                    that.verticalAlignment = options.verticalAlignment;
                    parseMargins(options);
                    that.margin = options.margin;
                    that.options = options
                }
                that.setSize({width: width})
            },
            _setBoundingRect: function() {
                var that = this,
                    options = that.options,
                    margin = that.changedMargin || that.margin,
                    box;
                if (!that.innerTitleGroup)
                    return;
                box = that.innerTitleGroup.getBBox();
                box.height += margin.top + margin.bottom;
                box.width += margin.left + margin.right;
                box.x -= margin.left;
                box.y -= margin.top;
                if (isDefined(options.placeholderSize))
                    box.height = options.placeholderSize;
                that.boundingRect = box
            },
            draw: function() {
                var that = this,
                    titleOptions = that.options,
                    renderer = that.renderer;
                if (!titleOptions.text)
                    return;
                that.changedMargin = null;
                if (!that.innerTitleGroup) {
                    that.innerTitleGroup = renderer.g();
                    that.clipRect = that.createClipRect();
                    that.titleGroup && that.clipRect && that.titleGroup.attr({clipId: that.clipRect.id})
                }
                else
                    that.innerTitleGroup.clear();
                that.innerTitleGroup.append(that.titleGroup);
                that.title = renderer.text(titleOptions.text, 0, 0).css(vizUtils.patchFontOptions(titleOptions.font)).attr({
                    align: that.horizontalAlignment,
                    style: titleOptions.fontStyle
                }).append(that.innerTitleGroup);
                that.title.text = titleOptions.text;
                that._correctTitleLength();
                that._setClipRectSettings()
            },
            _correctTitleLength: function() {
                var that = this,
                    text = that.title.text,
                    lineLength,
                    box;
                that.title.attr({text: text});
                that._setBoundingRect();
                box = that.getLayoutOptions();
                if (that._width > box.width || text.indexOf("<br/>") !== -1)
                    return;
                lineLength = text.length * that._width / box.width;
                that.title.attr({text: text.substr(0, ~~lineLength - 1 - 3) + "..."});
                that.title.setTitle(text);
                that._setBoundingRect()
            },
            changeSize: function(size) {
                var that = this,
                    margin = $.extend(true, {}, that.margin);
                if (margin.top + margin.bottom < size.height) {
                    if (this.innerTitleGroup) {
                        that.options._incidentOccured("W2103");
                        this.innerTitleGroup.remove();
                        this.innerTitleGroup = null
                    }
                    if (that.clipRect) {
                        that.clipRect.remove();
                        that.clipRect = null
                    }
                }
                else if (size.height > 0) {
                    vizUtils.decreaseGaps(margin, ["top", "bottom"], size.height);
                    size.height && (that.changedMargin = margin)
                }
                that._correctTitleLength();
                that._setBoundingRect();
                that._setClipRectSettings()
            },
            getLayoutOptions: function() {
                var options = this.options,
                    boundingRect = this.innerTitleGroup ? this.boundingRect : {
                        width: 0,
                        height: 0,
                        x: 0,
                        y: 0
                    };
                boundingRect.verticalAlignment = options.verticalAlignment;
                boundingRect.horizontalAlignment = options.horizontalAlignment;
                boundingRect.cutLayoutSide = options.verticalAlignment;
                return boundingRect
            },
            setSize: function(size) {
                this._width = size.width || this._width
            },
            shift: function(x, y) {
                var that = this,
                    box = that.getLayoutOptions();
                x -= box.x;
                y -= box.y;
                that.innerTitleGroup && that.innerTitleGroup.move(x, y);
                that.clipRect && that.clipRect.attr({
                    translateX: x,
                    translateY: y
                })
            },
            createClipRect: function() {
                if (isDefined(this.options.placeholderSize))
                    return this.renderer.clipRect(0, 0, 0, 0)
            },
            _setClipRectSettings: function() {
                var bbox = this.getLayoutOptions(),
                    clipRect = this.clipRect;
                if (clipRect)
                    clipRect.attr({
                        x: bbox.x,
                        y: bbox.y,
                        width: bbox.width,
                        height: bbox.height
                    })
            }
        };
        DX.viz.charts.ChartTitle.__DEFAULT_MARGIN = DEFAULT_MARGIN
    })(jQuery, DevExpress);
    /*! Module viz-charts, file axis.js */
    (function($, DX, undefined) {
        var viz = DX.viz,
            core = viz.core,
            utils = DX.utils,
            _isDefined = utils.isDefined,
            _isNumber = utils.isNumber,
            _getSignificantDigitPosition = utils.getSignificantDigitPosition,
            _roundValue = utils.roundValue,
            _math = Math,
            _abs = _math.abs,
            _round = _math.round,
            _pow = _math.pow,
            _sqrt = _math.sqrt,
            _extend = $.extend,
            _each = $.each,
            _noop = $.noop,
            _map = $.map,
            PERPENDICULAR_ANGLE = 90,
            AXIS_VALUE_MARGIN_PRIORITY = 100,
            DEFAULT_AXIS_LABEL_SPACING = 5,
            MAX_GRID_BORDER_ADHENSION = 4,
            CANVAS_POSITION_PREFIX = "canvas_position_",
            CANVAS_POSITION_START = "canvas_position_start",
            CANVAS_POSITION_BOTTOM = "canvas_position_bottom",
            CANVAS_POSITION_TOP = "canvas_position_top",
            CANVAS_POSITION_END = "canvas_position_end",
            LOGARITHMIC = "logarithmic",
            DISCRETE = "discrete",
            TOP = "top",
            BOTTOM = "bottom",
            LEFT = "left",
            RIGHT = "right",
            HALF_TICK_LENGTH = 4,
            CENTER = "center",
            LABEL_BACKGROUND_PADDING_X = 8,
            LABEL_BACKGROUND_PADDING_Y = 4,
            _Axis;
        var axesMethods = {};
        function validateOverlappingMode(mode) {
            return mode !== "ignore" ? "enlargeTickInterval" : "ignore"
        }
        axesMethods.normal = {
            _createAxis: function(options) {
                return this._createPathElement(this._getAxisPoints(this._axisPosition), options)
            },
            _getAxisPoints: function(axisCoord) {
                var canvas = this._getCanvasStartEnd();
                return this._options.isHorizontal ? [canvas.start, axisCoord, canvas.end, axisCoord] : [axisCoord, canvas.start, axisCoord, canvas.end]
            },
            _getTranslatedCoord: function(value) {
                return this._translator.translate(value)
            },
            _getCanvasStartEnd: function() {
                return {
                        start: this._translator.translateSpecialCase(CANVAS_POSITION_START),
                        end: this._translator.translateSpecialCase(CANVAS_POSITION_END)
                    }
            },
            _getScreenDelta: function() {
                return _abs(this._translator.translateSpecialCase(CANVAS_POSITION_START) - this._translator.translateSpecialCase(CANVAS_POSITION_END))
            },
            _initAxisPositions: function() {
                var that = this,
                    position = that._options.position,
                    delta = 0;
                if (that.delta)
                    delta = that.delta[position] || 0;
                that._axisPosition = that._orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_PREFIX + position) + delta
            },
            _drawTitle: function() {
                var that = this,
                    options = that._options,
                    axisPosition = that._axisPosition,
                    titleOptions = options.title,
                    attr = {
                        opacity: titleOptions.opacity,
                        align: CENTER,
                        "class": "dx-chart-axis-title"
                    },
                    centerPosition = that._translator.translateSpecialCase(CANVAS_POSITION_PREFIX + CENTER),
                    x,
                    y;
                if (!titleOptions.text || !that._axisTitleGroup)
                    return;
                if (options.isHorizontal) {
                    x = centerPosition;
                    y = axisPosition
                }
                else {
                    attr.rotate = options.position === LEFT ? 270 : 90;
                    x = axisPosition;
                    y = centerPosition
                }
                that._title = that._renderer.text(titleOptions.text, x, y).css(core.utils.patchFontOptions(titleOptions.font)).attr(attr).append(that._axisTitleGroup)
            },
            _adjustConstantLineLabels: function() {
                var that = this,
                    options = that._options,
                    isHorizontal = options.isHorizontal,
                    lines = that._constantLines,
                    labels = that._constantLineLabels,
                    label,
                    line,
                    lineBox,
                    linesOptions,
                    labelOptions,
                    box,
                    x,
                    y,
                    i,
                    padding = isHorizontal ? {
                        top: 0,
                        bottom: 0
                    } : {
                        left: 0,
                        right: 0
                    };
                if (labels === undefined && lines === undefined)
                    return;
                for (i = 0; i < labels.length; i++) {
                    x = y = 0;
                    linesOptions = options.constantLines[i];
                    labelOptions = linesOptions.label;
                    label = labels[i];
                    if (label !== null) {
                        line = lines[i];
                        box = label.getBBox();
                        lineBox = line.getBBox();
                        if (isHorizontal)
                            if (labelOptions.position === "inside") {
                                switch (labelOptions.horizontalAlignment) {
                                    case LEFT:
                                        x -= linesOptions.paddingLeftRight;
                                        break;
                                    default:
                                        x += linesOptions.paddingLeftRight;
                                        break
                                }
                                switch (labelOptions.verticalAlignment) {
                                    case CENTER:
                                        y += lineBox.y + lineBox.height / 2 - box.y - box.height / 2;
                                        break;
                                    case BOTTOM:
                                        y -= linesOptions.paddingTopBottom;
                                        break;
                                    default:
                                        y += linesOptions.paddingTopBottom + box.height;
                                        break
                                }
                            }
                            else
                                switch (labelOptions.verticalAlignment) {
                                    case BOTTOM:
                                        y += box.height + linesOptions.paddingTopBottom - (box.y + box.height - that._orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_PREFIX + labelOptions.verticalAlignment));
                                        if (padding[BOTTOM] < box.height + linesOptions.paddingTopBottom)
                                            padding[BOTTOM] = box.height + linesOptions.paddingTopBottom;
                                        break;
                                    default:
                                        y -= linesOptions.paddingTopBottom;
                                        if (padding[TOP] < linesOptions.paddingTopBottom + box.height)
                                            padding[TOP] = linesOptions.paddingTopBottom + box.height;
                                        break
                                }
                        else if (labelOptions.position === "inside") {
                            switch (labelOptions.horizontalAlignment) {
                                case CENTER:
                                    x += lineBox.x + lineBox.width / 2 - box.x - box.width / 2;
                                    break;
                                case RIGHT:
                                    x -= linesOptions.paddingLeftRight;
                                    break;
                                default:
                                    x += linesOptions.paddingLeftRight;
                                    break
                            }
                            switch (labelOptions.verticalAlignment) {
                                case BOTTOM:
                                    y += lineBox.y - box.y + linesOptions.paddingTopBottom;
                                    break;
                                default:
                                    y -= linesOptions.paddingTopBottom;
                                    break
                            }
                        }
                        else {
                            y += lineBox.y + lineBox.height / 2 - box.y - box.height / 2;
                            switch (labelOptions.horizontalAlignment) {
                                case RIGHT:
                                    x += linesOptions.paddingLeftRight;
                                    if (padding[RIGHT] < linesOptions.paddingLeftRight + box.width)
                                        padding[RIGHT] = linesOptions.paddingLeftRight + box.width;
                                    break;
                                default:
                                    x -= linesOptions.paddingLeftRight;
                                    if (padding[LEFT] < linesOptions.paddingLeftRight + box.width)
                                        padding[LEFT] = linesOptions.paddingLeftRight + box.width;
                                    break
                            }
                        }
                        label.move(x, y)
                    }
                }
                that.padding = padding
            },
            _checkAlignmentConstantLineLabels: function(labelOptions) {
                var options = this._options,
                    position = labelOptions.position,
                    verticalAlignment = (labelOptions.verticalAlignment || "").toLowerCase(),
                    horizontalAlignment = (labelOptions.horizontalAlignment || "").toLowerCase();
                if (options.isHorizontal)
                    if (position === "outside") {
                        verticalAlignment = verticalAlignment === BOTTOM ? BOTTOM : TOP;
                        horizontalAlignment = CENTER
                    }
                    else {
                        verticalAlignment = verticalAlignment === CENTER ? CENTER : verticalAlignment === BOTTOM ? BOTTOM : TOP;
                        horizontalAlignment = horizontalAlignment === LEFT ? LEFT : RIGHT
                    }
                else if (position === "outside") {
                    verticalAlignment = CENTER;
                    horizontalAlignment = horizontalAlignment === LEFT ? LEFT : RIGHT
                }
                else {
                    verticalAlignment = verticalAlignment === BOTTOM ? BOTTOM : TOP;
                    horizontalAlignment = horizontalAlignment === RIGHT ? RIGHT : horizontalAlignment === CENTER ? CENTER : LEFT
                }
                labelOptions.verticalAlignment = verticalAlignment;
                labelOptions.horizontalAlignment = horizontalAlignment
            },
            _getConstantLineLabelsCoords: function(value, lineLabelOptions) {
                var that = this,
                    orthogonalTranslator = that._orthogonalTranslator,
                    options = that._options,
                    align = CENTER,
                    x = value,
                    y = value;
                if (options.isHorizontal)
                    y = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_PREFIX + lineLabelOptions.verticalAlignment);
                else
                    x = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_PREFIX + lineLabelOptions.horizontalAlignment);
                switch (lineLabelOptions.horizontalAlignment) {
                    case LEFT:
                        align = !options.isHorizontal && lineLabelOptions.position === "inside" ? LEFT : RIGHT;
                        break;
                    case CENTER:
                        align = CENTER;
                        break;
                    case RIGHT:
                        align = !options.isHorizontal && lineLabelOptions.position === "inside" ? RIGHT : LEFT;
                        break
                }
                return {
                        x: x,
                        y: y,
                        align: align
                    }
            },
            _getAdjustedStripLabelCoords: function(stripOptions, label, rect) {
                var x = 0,
                    y = 0,
                    horizontalAlignment = stripOptions.label.horizontalAlignment,
                    verticalAlignment = stripOptions.label.verticalAlignment,
                    box = label.getBBox(),
                    rectBox = rect.getBBox();
                if (horizontalAlignment === LEFT)
                    x += stripOptions.paddingLeftRight;
                else if (horizontalAlignment === RIGHT)
                    x -= stripOptions.paddingLeftRight;
                if (verticalAlignment === TOP)
                    y += rectBox.y - box.y + stripOptions.paddingTopBottom;
                else if (verticalAlignment === CENTER)
                    y += rectBox.y + rectBox.height / 2 - box.y - box.height / 2;
                else if (verticalAlignment === BOTTOM)
                    y -= stripOptions.paddingTopBottom;
                return {
                        x: x,
                        y: y
                    }
            },
            _adjustTitle: function() {
                var that = this,
                    options = that._options,
                    position = options.position,
                    title = that._title,
                    margin = options.title.margin,
                    boxGroup,
                    boxTitle,
                    params;
                if (!title || !that._axisElementsGroup)
                    return;
                boxTitle = title.getBBox();
                boxGroup = that._axisElementsGroup.getBBox();
                if (options.isHorizontal)
                    if (position === BOTTOM)
                        params = {
                            y: boxGroup.isEmpty ? undefined : boxGroup.y + boxGroup.height,
                            translateY: margin + boxTitle.height
                        };
                    else
                        params = {
                            y: boxGroup.isEmpty ? undefined : boxGroup.y,
                            translateY: -margin
                        };
                else if (position === LEFT)
                    params = {
                        x: boxGroup.isEmpty ? undefined : boxGroup.x,
                        translateX: -margin
                    };
                else
                    params = {
                        x: boxGroup.isEmpty ? undefined : boxGroup.x + boxGroup.width,
                        translateX: margin
                    };
                title.attr(params)
            },
            coordsIn: function(x, y) {
                var rect = this.getBoundingRect();
                return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height
            },
            _getTicksOptions: function() {
                var options = this._options;
                return {
                        base: options.type === LOGARITHMIC ? options.logarithmBase : undefined,
                        tickInterval: options.stubData ? null : options.tickInterval,
                        gridSpacingFactor: options.axisDivisionFactor,
                        incidentOccured: options.incidentOccured,
                        setTicksAtUnitBeginning: options.setTicksAtUnitBeginning,
                        showMinorTicks: options.minorTick.visible || options.minorGrid.visible,
                        minorTickInterval: options.minorTickInterval,
                        minorTickCount: options.minorTickCount
                    }
            },
            _getOverlappingBehaviorOptions: function() {
                var that = this,
                    options = that._options,
                    getText = function() {
                        return ""
                    },
                    overlappingBehavior = options.label.overlappingBehavior ? $.extend({}, options.label.overlappingBehavior) : null;
                if (overlappingBehavior) {
                    if (!options.isHorizontal)
                        overlappingBehavior.mode = validateOverlappingMode(overlappingBehavior.mode);
                    if (overlappingBehavior.mode !== "rotate")
                        overlappingBehavior.rotationAngle = 0
                }
                if (!options.stubData)
                    getText = function(value, labelOptions) {
                        return formatLabel(value, labelOptions, {
                                min: options.min,
                                max: options.max
                            })
                    };
                return {
                        hasLabelFormat: that._hasLabelFormat,
                        labelOptions: options.label,
                        overlappingBehavior: overlappingBehavior,
                        isHorizontal: options.isHorizontal,
                        textOptions: that._textOptions,
                        textFontStyles: that._textFontStyles,
                        textSpacing: options.label.minSpacing,
                        getText: getText,
                        renderText: function(text, x, y, options) {
                            return that._renderer.text(text, x, y, options).append(that._renderer.root)
                        },
                        translate: function(value, useOrthogonalTranslator) {
                            return useOrthogonalTranslator ? that._orthogonalTranslator.translate(value) : that._translator.translate(value)
                        },
                        isInverted: that._translator.getBusinessRange().invert
                    }
            },
            getRangeData: function() {
                var options = this._options,
                    range = options.range;
                return this._getRange(options, range.min, range.max, options.categories, this.minRangeArg, this.maxRangeArg, !options.valueMarginsEnabled)
            },
            _getStripLabelCoords: function(stripLabelOptions, stripFrom, stripTo) {
                var that = this,
                    orthogonalTranslator = that._orthogonalTranslator,
                    options = that._options,
                    isHorizontal = options.isHorizontal,
                    align = isHorizontal ? CENTER : LEFT,
                    x,
                    y;
                if (isHorizontal) {
                    if (stripLabelOptions.horizontalAlignment === CENTER) {
                        x = stripFrom + (stripTo - stripFrom) / 2;
                        align = CENTER
                    }
                    else if (stripLabelOptions.horizontalAlignment === LEFT) {
                        x = stripFrom;
                        align = LEFT
                    }
                    else if (stripLabelOptions.horizontalAlignment === RIGHT) {
                        x = stripTo;
                        align = RIGHT
                    }
                    y = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_PREFIX + stripLabelOptions.verticalAlignment)
                }
                else {
                    x = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_PREFIX + stripLabelOptions.horizontalAlignment);
                    align = stripLabelOptions.horizontalAlignment;
                    if (stripLabelOptions.verticalAlignment === TOP)
                        y = stripFrom;
                    else if (stripLabelOptions.verticalAlignment === CENTER)
                        y = stripTo + (stripFrom - stripTo) / 2;
                    else if (stripLabelOptions.verticalAlignment === BOTTOM)
                        y = stripTo
                }
                return {
                        x: x,
                        y: y,
                        align: align
                    }
            },
            _getTranslatedValue: function(value, y, offset) {
                return {
                        x: this._translator.translate(value, offset),
                        y: y
                    }
            }
        };
        axesMethods.circular = {
            _createAxis: function(options) {
                var that = this,
                    centerCoord = that._translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP),
                    r = that._translator.getValLength();
                return that._renderer.circle(centerCoord.x, centerCoord.y, r).attr(options).sharp()
            },
            _getOverlappingBehaviorType: function() {
                return "circular"
            },
            _setBoundingRect: function() {
                this.boundingRect = {
                    width: 0,
                    height: 0
                }
            },
            _getStick: function() {
                return this._options.type !== DISCRETE
            },
            _getTicksOptions: axesMethods.normal._getTicksOptions,
            _getOverlappingBehaviorOptions: function() {
                var options = axesMethods.normal._getOverlappingBehaviorOptions.call(this),
                    translator = this._translator,
                    range = translator.getBusinessRange(),
                    indentFromAxis = this._options.label.indentFromAxis || 0;
                if (options.overlappingBehavior)
                    options.overlappingBehavior = {mode: validateOverlappingMode(options.overlappingBehavior.mode)};
                options.translate = function(value) {
                    return translator.translate(value, CANVAS_POSITION_BOTTOM)
                };
                options.isInverted = translator.getBusinessRange().arg.invert;
                options.circularRadius = translator.translate(CANVAS_POSITION_TOP, CANVAS_POSITION_BOTTOM).radius + indentFromAxis;
                options.circularStartAngle = options.circularEndAngle = translator.getStartAngle();
                options.isHorizontal = false;
                return options
            },
            getRangeData: function(min) {
                var options = this._options,
                    period = utils.isNumber(options.period) ? options.period + (min || 0) : undefined;
                return this._getRange(options, undefined, period, options.categories, this.minRangeArg, this.maxRangeArg, this._getStick())
            },
            measureLabels: function() {
                var that = this,
                    indentFromAxis = that._options.label.indentFromAxis || 0,
                    maxLabelParams;
                if (!that._axisElementsGroup || !that._options.label.visible)
                    return {
                            height: 0,
                            width: 0
                        };
                that._updateTickManager();
                maxLabelParams = that._tickManager.getMaxLabelParams();
                return {
                        height: maxLabelParams.height + indentFromAxis + HALF_TICK_LENGTH,
                        width: maxLabelParams.width + indentFromAxis + HALF_TICK_LENGTH
                    }
            },
            _getTranslatedCoord: function(value) {
                var options = this._options,
                    offset = options.discreteAxisDivisionMode !== "crossLabels" || !options.discreteAxisDivisionMode;
                return this._translator.translate(value, -offset).angle
            },
            _getCanvasStartEnd: function() {
                return {
                        start: this._translator.translate(CANVAS_POSITION_START).angle,
                        end: this._translator.translate(CANVAS_POSITION_END).angle
                    }
            },
            _createStrip: function(fromAngle, toAngle, attr) {
                var center = this._translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP),
                    r = this._translator.getValLength();
                return this._renderer.arc(center.x, center.y, 0, r, -toAngle, -fromAngle).attr(attr)
            },
            _getStripLabelCoords: function(stripLabelOptions, stripFrom, stripTo) {
                var that = this,
                    translator = that._translator,
                    angle = stripFrom + (stripTo - stripFrom) / 2,
                    cossin = utils.getCosAndSin(-angle),
                    halfRad = translator.getValLength() / 2,
                    center = translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP),
                    x = _round(center.x + halfRad * cossin.cos),
                    y = _round(center.y - halfRad * cossin.sin);
                return {
                        x: x,
                        y: y,
                        align: CENTER
                    }
            },
            _createConstantLine: function(value, attr) {
                var center = this._translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP),
                    r = this._translator.getValLength();
                return this._createPathElement([center.x, center.y, center.x + r, center.y], attr).rotate(value, center.x, center.y)
            },
            _getConstantLineLabelsCoords: function(value) {
                var that = this,
                    translator = that._translator,
                    cossin = utils.getCosAndSin(-value),
                    halfRad = translator.getValLength() / 2,
                    center = translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP),
                    x = _round(center.x + halfRad * cossin.cos),
                    y = _round(center.y - halfRad * cossin.sin);
                return {
                        x: x,
                        y: y,
                        align: CENTER
                    }
            },
            _checkAlignmentConstantLineLabels: _noop,
            _getScreenDelta: function() {
                return 2 * Math.PI * this._translator.getValLength()
            },
            _getTickCoord: function(tick) {
                var center = this._translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP),
                    r = this._translator.getValLength();
                return {
                        x1: center.x + r - HALF_TICK_LENGTH,
                        y1: center.y,
                        x2: center.x + r + HALF_TICK_LENGTH,
                        y2: center.y,
                        angle: tick.angle
                    }
            },
            _getLabelAdjustedCoord: function(tick) {
                var that = this,
                    pos = tick.labelPos,
                    cossin = utils.getCosAndSin(pos.angle),
                    indentFromAxis = that._options.label.indentFromAxis || 0,
                    box = tick.label.getBBox(),
                    x,
                    y;
                x = pos.x + (indentFromAxis + box.width / 2) * cossin.cos;
                y = pos.y + (pos.y - box.y - box.height / 2) + indentFromAxis * cossin.sin;
                return {
                        x: x,
                        y: y
                    }
            },
            _getGridLineDrawer: function() {
                var that = this,
                    translator = that._translator,
                    r = translator.getValLength(),
                    center = translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP);
                return function(tick) {
                        return that._createPathElement([center.x, center.y, center.x + r, center.y], tick.gridStyle).rotate(tick.angle, center.x, center.y)
                    }
            },
            _getTranslatedValue: function(value, _, offset) {
                return this._translator.translate(value, CANVAS_POSITION_BOTTOM, -offset)
            },
            _getAdjustedStripLabelCoords: function(stripOptions, label) {
                var x,
                    y,
                    box = label.getBBox();
                y = label.attr("y") - box.y - box.height / 2;
                return {
                        x: 0,
                        y: y
                    }
            },
            coordsIn: function(x, y) {
                if (this._translator.untranslate(x, y).r > this._translator.getValLength())
                    return true
            },
            _rotateTick: function(tick, angle) {
                var center = this._translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP);
                tick.graphic.rotate(angle, center.x, center.y)
            }
        };
        axesMethods.linear = {
            _createAxis: function(options) {
                var that = this,
                    centerCoord = that._translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP),
                    r = that._translator.getValLength();
                return that._createPathElement([centerCoord.x, centerCoord.y, centerCoord.x + r, centerCoord.y], options).rotate(centerCoord.angle, centerCoord.x, centerCoord.y)
            },
            _getOverlappingBehaviorType: function() {
                return "linear"
            },
            _getStick: function() {
                return !this._options.valueMarginsEnabled
            },
            getRangeData: axesMethods.circular.getRangeData,
            _setBoundingRect: axesMethods.circular._setBoundingRect,
            _getScreenDelta: function() {
                return this._translator.getValLength()
            },
            _getTickCoord: function(tick) {
                return {
                        x1: tick.posX - HALF_TICK_LENGTH,
                        y1: tick.posY,
                        x2: tick.posX + HALF_TICK_LENGTH,
                        y2: tick.posY,
                        angle: tick.angle + PERPENDICULAR_ANGLE
                    }
            },
            _getTicksOptions: axesMethods.normal._getTicksOptions,
            _getOverlappingBehaviorOptions: function() {
                var translator = this._translator,
                    options = axesMethods.normal._getOverlappingBehaviorOptions.call(this),
                    startAngle = utils.normalizeAngle(translator.getStartAngle());
                if (options.overlappingBehavior)
                    options.overlappingBehavior = {mode: validateOverlappingMode(options.overlappingBehavior.mode)};
                options.isHorizontal = startAngle > 45 && startAngle < 135 || startAngle > 225 && startAngle < 315 ? true : false;
                options.isInverted = translator.getBusinessRange().val.invert;
                options.translate = function(value) {
                    return translator.translate(CANVAS_POSITION_TOP, value).x
                };
                return options
            },
            _getLabelAdjustedCoord: function(tick) {
                var that = this,
                    pos = tick.labelPos,
                    cossin = utils.getCosAndSin(pos.angle),
                    indentFromAxis = that._options.label.indentFromAxis || 0,
                    box = tick.label.getBBox(),
                    x,
                    y;
                x = pos.x - _abs(indentFromAxis * cossin.sin) + _abs(box.width / 2 * cossin.cos);
                y = pos.y + (pos.y - box.y) - _abs(box.height / 2 * cossin.sin) + _abs(indentFromAxis * cossin.cos);
                return {
                        x: x,
                        y: y
                    }
            },
            _getGridLineDrawer: function() {
                var that = this,
                    translator = that._translator,
                    pos = translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP);
                return function(tick) {
                        return that._renderer.circle(pos.x, pos.y, utils.getDistance(pos.x, pos.y, tick.posX, tick.posY)).attr(tick.gridStyle).sharp()
                    }
            },
            _getTranslatedValue: function(value, _, offset) {
                return this._translator.translate(CANVAS_POSITION_START, value, undefined, offset)
            },
            _getTranslatedCoord: function(value) {
                return this._translator.translate(CANVAS_POSITION_START, value).radius
            },
            _getCanvasStartEnd: function() {
                return {
                        start: this._translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_START).radius,
                        end: this._translator.translate(CANVAS_POSITION_TOP, CANVAS_POSITION_END).radius
                    }
            },
            _createStrip: function(fromPoint, toPoint, attr) {
                var center = this._translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP);
                return this._renderer.arc(center.x, center.y, fromPoint, toPoint, 0, 360).attr(attr)
            },
            _getAdjustedStripLabelCoords: axesMethods.circular._getAdjustedStripLabelCoords,
            _getStripLabelCoords: function(stripLabelOptions, stripFrom, stripTo) {
                var that = this,
                    translator = that._translator,
                    labelPos = stripFrom + (stripTo - stripFrom) / 2,
                    center = translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP),
                    y = _round(center.y - labelPos);
                return {
                        x: center.x,
                        y: y,
                        align: CENTER
                    }
            },
            _createConstantLine: function(value, attr) {
                var center = this._translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP);
                return this._renderer.circle(center.x, center.y, value).attr(attr).sharp()
            },
            _getConstantLineLabelsCoords: function(value) {
                var that = this,
                    translator = that._translator,
                    center = translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP),
                    y = _round(center.y - value);
                return {
                        x: center.x,
                        y: y,
                        align: CENTER
                    }
            },
            _checkAlignmentConstantLineLabels: _noop,
            _rotateTick: function(tick, angle) {
                tick.graphic.rotate(angle, tick.posX, tick.posY)
            }
        };
        axesMethods.circularSpider = $.extend({}, axesMethods.circular, {
            _createAxis: function(options) {
                var that = this,
                    points = $.map(that.getSpiderTicks(), function(tick) {
                        return {
                                x: tick.posX,
                                y: tick.posY
                            }
                    });
                return that._createPathElement(points, options)
            },
            getSpiderTicks: function(stick) {
                var that = this,
                    rangeStick = stick || that._range.stick;
                that._spiderTicks = that._convertValuesToTicks(that._tickManager.getFullTicks());
                that._initTicks(that._spiderTicks, {}, {});
                if (!rangeStick)
                    that._spiderTicks.push(that._spiderTicks[0]);
                return that._spiderTicks
            },
            _createStrip: function(fromAngle, toAngle, attr) {
                var center = this._translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP),
                    points = $.map(this.getSpiderTicks(true), function(tick) {
                        if (_isDefined(tick.angle) && tick.angle >= fromAngle && tick.angle <= toAngle)
                            return {
                                    x: tick.posX,
                                    y: tick.posY
                                };
                        else
                            return null
                    });
                points.push({
                    x: center.x,
                    y: center.y
                });
                return this._renderer.path(points, "area").attr(attr)
            },
            _getTranslatedCoord: function(value) {
                return this._translator.translate(value, false).angle
            },
            _getTickOffset: function() {
                return false
            }
        });
        axesMethods.linearSpider = $.extend({}, axesMethods.linear, {
            setSpiderTicks: function(ticks) {
                this._spiderTicks = ticks
            },
            _getGridLineDrawer: function() {
                var that = this,
                    translator = that._translator,
                    pos = translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP);
                return function(tick) {
                        var radius = utils.getDistance(pos.x, pos.y, tick.posX, tick.posY);
                        return that._createPathElement(that._getGridPoints(pos, radius), tick.gridStyle)
                    }
            },
            _getGridPoints: function(pos, radius) {
                return $.map(this._spiderTicks, function(tick) {
                        var cossin = utils.getCosAndSin(tick.angle);
                        return {
                                x: _round(pos.x + radius * cossin.cos),
                                y: _round(pos.y + radius * cossin.sin)
                            }
                    })
            },
            _createStrip: function(fromPoint, toPoint, attr) {
                var center = this._translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP),
                    innerPoints = this._getGridPoints(center, toPoint),
                    outerPoints = this._getGridPoints(center, fromPoint);
                return this._renderer.path(outerPoints.concat(innerPoints.reverse()), "area").attr(attr)
            },
            _createConstantLine: function(value, attr) {
                var center = this._translator.translate(CANVAS_POSITION_START, CANVAS_POSITION_TOP),
                    points = this._getGridPoints(center, value);
                return this._createPathElement(points, attr)
            }
        });
        var _validateAxisOptions = function(options) {
                var labelOptions = options.label,
                    position = options.position,
                    defaultPosition = options.isHorizontal ? BOTTOM : LEFT,
                    secondaryPosition = options.isHorizontal ? TOP : RIGHT;
                if (position !== defaultPosition && position !== secondaryPosition)
                    position = defaultPosition;
                if (position === RIGHT && !labelOptions.userAlignment)
                    labelOptions.alignment = LEFT;
                options.position = position;
                options.hoverMode = options.hoverMode ? options.hoverMode.toLowerCase() : "none";
                labelOptions.minSpacing = _isDefined(labelOptions.minSpacing) ? labelOptions.minSpacing : DEFAULT_AXIS_LABEL_SPACING
            };
        var getFormatObject = function(value, options, axisMinMax) {
                var formatObject = {
                        value: value,
                        valueText: DX.formatHelper.format(value, options.format, options.precision) || ""
                    };
                if (axisMinMax) {
                    formatObject.min = axisMinMax.min;
                    formatObject.max = axisMinMax.max
                }
                return formatObject
            };
        var formatLabel = function(value, options, axisMinMax) {
                var formatObject = getFormatObject(value, options, axisMinMax);
                return $.isFunction(options.customizeText) ? options.customizeText.call(formatObject, formatObject) : formatObject.valueText
            };
        var formatHint = function(value, options, axisMinMax) {
                var formatObject = getFormatObject(value, options, axisMinMax);
                return $.isFunction(options.customizeHint) ? options.customizeHint.call(formatObject, formatObject) : undefined
            };
        _Axis = DX.viz.charts.Axis = function(renderer, options) {
            var debug = DX.utils.debug;
            debug.assertParam(renderer, "renderer was not passed");
            debug.assertParam(options.label, "label was not passed");
            debug.assertParam(options.tick, "tick was not passed");
            debug.assertParam(options.grid, "grid was not passed");
            debug.assertParam(options.title, "title was not passed");
            debug.assert(options.axisDivisionFactor, "axisDivisionFactor was not passed");
            debug.assert(options.stripStyle, "stripStyle was not passed");
            debug.assert(options.constantLineStyle, "constantLineStyle was not passed");
            debug.assert(options.position, "position was not passed");
            debug.assertParam(options.isHorizontal, "isHorizontal was not passed");
            this._renderer = renderer;
            this._init(options)
        };
        _Axis.prototype = {
            constructor: _Axis,
            dispose: function() {
                var that = this;
                that._axisElementsGroup && that._axisElementsGroup.dispose();
                that._deleteLabelsData();
                that._stripLabels = that._strips = null;
                that._title = null;
                that._axisStripGroup = that._axisConstantLineGroup = that._axisLabelGroup = null;
                that._axisLineGroup = that._axisElementsGroup = that._axisGridGroup = null;
                that._axisGroup = that._axisTitleGroup = null;
                that._axesContainerGroup = that._stripsGroup = that._constantLinesGroup = null;
                that._renderer = that._options = that._textOptions = that._textFontStyles = null;
                that._range = that._translator = that._orthogonalTranslator = null;
                that._majorTicks = that._minorTicks = null;
                that._tickManager = null
            },
            getOptions: function() {
                return this._options
            },
            setPane: function(pane) {
                this.pane = pane;
                this._options.pane = pane
            },
            setTypes: function(type, axisType, typeSelector) {
                this._options.type = type || this._options.type;
                this._options[typeSelector] = axisType || this._options[typeSelector]
            },
            getTranslator: function() {
                return this._translator
            },
            _init: function(options) {
                var that = this,
                    opt,
                    labelOpt = options.label;
                that._options = opt = options;
                _validateAxisOptions(opt);
                that._setType(options.drawingType);
                opt.range = {
                    min: opt.min,
                    max: opt.max
                };
                that.pane = opt.pane;
                that.name = opt.name;
                that.priority = opt.priority;
                that._virtual = opt.virtual;
                that._stripsGroup = opt.stripsGroup;
                that._labelAxesGroup = opt.labelAxesGroup;
                that._constantLinesGroup = opt.constantLinesGroup;
                that._axesContainerGroup = opt.axesContainerGroup;
                that._createAxisGroups();
                that._hasLabelFormat = labelOpt.format !== "" && _isDefined(labelOpt.format);
                that._textOptions = {
                    align: labelOpt.alignment,
                    opacity: labelOpt.opacity
                };
                that._textFontStyles = core.utils.patchFontOptions(labelOpt.font);
                that._tickManager = that._createTickManager();
                if (opt.type === LOGARITHMIC) {
                    if (opt.logarithmBaseError) {
                        opt.incidentOccured("E2104");
                        delete opt.logarithmBaseError
                    }
                    that.calcInterval = function(value, prevValue) {
                        return utils.getLog(value / prevValue, options.logarithmBase)
                    }
                }
            },
            updateSize: function(clearAxis) {
                var that = this,
                    options = that._options,
                    direction = options.isHorizontal ? "horizontal" : "vertical";
                if (options.title.text && that._axisTitleGroup) {
                    options.incidentOccured("W2105", [direction]);
                    that._axisTitleGroup.remove();
                    that._axisTitleGroup = null
                }
                if (clearAxis && that._axisElementsGroup && options.label.visible && !options.stubData) {
                    options.incidentOccured("W2106", [direction]);
                    that._axisElementsGroup.remove();
                    that._axisElementsGroup = null
                }
                that._setBoundingRect()
            },
            _updateTranslatorInterval: function() {
                var that = this,
                    i,
                    majorTicks,
                    majorTicksLength,
                    translator = that._translator,
                    businessRange = that._range,
                    tickBounds;
                if (!businessRange.categories && !businessRange.isSynchronized) {
                    that.getMajorTicks(true);
                    businessRange.addRange(that._tickManager.getTickBounds());
                    translator.reinit()
                }
                that._majorTicks = majorTicks = that.getMajorTicks();
                if (!businessRange.categories) {
                    majorTicksLength = majorTicks.length;
                    for (i = 0; i < majorTicksLength - 1; i++)
                        businessRange.addRange({interval: _abs(majorTicks[i].value - majorTicks[i + 1].value)})
                }
                that._decimatedTicks = that._range.categories ? that.getDecimatedTicks() : [];
                that._minorTicks = that.getMinorTicks()
            },
            setTranslator: function(translator, orthogonalTranslator) {
                var debug = DX.utils.debug;
                debug.assertParam(translator, "translator was not passed");
                this._translator = translator;
                this._orthogonalTranslator = _isDefined(orthogonalTranslator) ? orthogonalTranslator : undefined;
                this.resetTicks();
                this._updateTranslatorInterval()
            },
            resetTicks: function() {
                this._deleteLabelsData();
                this._majorTicks = this._minorTicks = null
            },
            setRange: function(range) {
                var debug = DX.utils.debug;
                debug.assertParam(range, "range was not passed");
                var options = this._options;
                options.min = range.minVisible;
                options.max = range.maxVisible;
                options.stubData = range.stubData;
                this._range = range;
                this._tickManager && this._tickManager.updateMinMax({
                    min: options.min,
                    max: options.max
                });
                this.resetTicks()
            },
            getCurrentLabelPos: function() {
                var that = this,
                    options = that._options,
                    position = options.position,
                    labelOffset = options.label.indentFromAxis,
                    axisPosition = that._axisPosition;
                return position === TOP || position === LEFT ? axisPosition - labelOffset : axisPosition + labelOffset
            },
            getUntranslatedValue: function(pos) {
                var that = this,
                    translator = that._translator,
                    value = translator.untranslate(pos);
                if (_isDefined(value))
                    return formatLabel(_isNumber(value) ? _roundValue(value, _getSignificantDigitPosition(that._range.interval)) : value, that._options.label);
                return null
            },
            _drawAxis: function() {
                var that = this,
                    options = that._options,
                    axis = that._createAxis({
                        "stroke-width": options.width,
                        stroke: options.color,
                        "stroke-opacity": options.opacity
                    });
                axis.append(that._axisLineGroup)
            },
            _correctMinForTicks: function(min, max, screenDelta) {
                var digitPosition = _getSignificantDigitPosition(_abs(max - min) / screenDelta),
                    newMin = _roundValue(Number(min), digitPosition),
                    correctingValue;
                if (newMin < min) {
                    correctingValue = _math.pow(10, -digitPosition);
                    newMin = utils.applyPrecisionByMinDelta(newMin, correctingValue, newMin + correctingValue)
                }
                if (newMin > max)
                    newMin = min;
                return newMin
            },
            _getTickManagerData: function() {
                var that = this,
                    options = that._options,
                    screenDelta = that._getScreenDelta(),
                    min = options.min,
                    max = options.max,
                    categories = that._translator.getVisibleCategories() || that._range.categories,
                    customTicks = $.isArray(categories) ? categories : that._majorTicks && that._convertTicksToValues(that._majorTicks),
                    customMinorTicks = that._minorTicks && that._convertTicksToValues(that._minorTicks);
                if (_isNumber(min) && options.type !== LOGARITHMIC)
                    min = that._correctMinForTicks(min, max, screenDelta);
                return {
                        min: min,
                        max: max,
                        customTicks: customTicks,
                        customMinorTicks: customMinorTicks,
                        screenDelta: screenDelta
                    }
            },
            _getTickManagerTypes: function() {
                return {
                        axisType: this._options.type,
                        dataType: this._options.dataType
                    }
            },
            _getOverlappingBehaviorType: function() {
                return "linear"
            },
            _createTickManager: function() {
                return DX.viz.core.CoreFactory.createTickManager({}, {}, {overlappingBehaviorType: this._getOverlappingBehaviorType()})
            },
            _getMarginsOptions: function() {
                var range = this._range;
                return {
                        stick: range.stick,
                        minStickValue: range.minStickValue,
                        maxStickValue: range.maxStickValue,
                        percentStick: range.percentStick,
                        minValueMargin: this._options.minValueMargin,
                        maxValueMargin: this._options.maxValueMargin,
                        minSpaceCorrection: range.minSpaceCorrection,
                        maxSpaceCorrection: range.maxSpaceCorrection
                    }
            },
            _updateTickManager: function() {
                var overlappingOptions = this._getOverlappingBehaviorOptions(),
                    options;
                options = _extend(true, {}, this._getMarginsOptions(), overlappingOptions, this._getTicksOptions());
                this._tickManager.update(this._getTickManagerTypes(), this._getTickManagerData(), options)
            },
            _correctLabelAlignment: function() {
                var that = this,
                    labelOptions = that._options.label,
                    overlappingBehavior = that._tickManager.getOverlappingBehavior();
                if (overlappingBehavior && overlappingBehavior.mode === "rotate") {
                    that._textOptions.rotate = overlappingBehavior.rotationAngle;
                    if (!labelOptions.userAlignment)
                        that._textOptions.align = LEFT
                }
                else if (!labelOptions.userAlignment)
                    that._textOptions.align = labelOptions.alignment
            },
            _correctLabelFormat: function() {
                this._options.label = this._tickManager.getOptions().labelOptions
            },
            _convertTicksToValues: function(ticks) {
                return _map(ticks || [], function(item) {
                        return item.value
                    })
            },
            _convertValuesToTicks: function(values) {
                return _map(values || [], function(item) {
                        return {value: item}
                    })
            },
            getTicksValues: function() {
                return {
                        majorTicksValues: this._convertTicksToValues(this._majorTicks || this.getMajorTicks()),
                        minorTicksValues: this._convertTicksToValues(this._minorTicks || this.getMinorTicks())
                    }
            },
            getMajorTicks: function(withoutOverlappingBehavior) {
                var that = this,
                    majorTicks;
                that._updateTickManager();
                that._textOptions.rotate = 0;
                majorTicks = that._convertValuesToTicks(that._tickManager.getTicks(withoutOverlappingBehavior));
                that._correctLabelAlignment();
                that._correctLabelFormat();
                that._testTKScreenDelta = that._screenDelta;
                that._useTicksAutoArrangement = that._options.useTicksAutoArrangement;
                if (that._options.stubData)
                    that._testSkippedFormattingAndOverlapping = true;
                return majorTicks
            },
            getMinorTicks: function() {
                return this._convertValuesToTicks(this._tickManager.getMinorTicks())
            },
            getDecimatedTicks: function() {
                return this._convertValuesToTicks(this._tickManager.getDecimatedTicks())
            },
            setTicks: function(ticks) {
                this.resetTicks();
                this._majorTicks = this._convertValuesToTicks(ticks.majorTicks);
                this._minorTicks = this._convertValuesToTicks(ticks.minorTicks)
            },
            _deleteLabelsData: function() {
                _each(this._majorTicks || [], function(_, item) {
                    item.label && $(item.label.element).removeData()
                })
            },
            _drawTicks: function(ticks) {
                var that = this,
                    renderer = that._renderer,
                    group = that._axisLineGroup;
                _each(ticks || [], function(_, tick) {
                    var coord = that._getTickCoord(tick),
                        points;
                    if (coord) {
                        points = that._options.isHorizontal ? [coord.x1, coord.y1, coord.x2, coord.y2] : [coord.y1, coord.x1, coord.y2, coord.x2];
                        tick.graphic = that._createPathElement(points, tick.tickStyle).append(group);
                        coord.angle && that._rotateTick(tick, coord.angle)
                    }
                })
            },
            _createPathElement: function(points, attr) {
                return this._renderer.path(points, "line").attr(attr).sharp()
            },
            _getTickCoord: function(tick) {
                if (_isDefined(tick.posX) && _isDefined(tick.posY))
                    return {
                            x1: tick.posX,
                            y1: tick.posY - HALF_TICK_LENGTH,
                            x2: tick.posX,
                            y2: tick.posY + HALF_TICK_LENGTH
                        };
                else
                    return null
            },
            setPercentLabelFormat: function() {
                if (!this._hasLabelFormat)
                    this._options.label.format = "percent"
            },
            resetAutoLabelFormat: function() {
                if (!this._hasLabelFormat)
                    delete this._options.label.format
            },
            _drawLabels: function() {
                var that = this,
                    renderer = that._renderer,
                    group = that._axisElementsGroup,
                    options = that._options,
                    emptyStrRegExp = /^\s+$/;
                _each(that._majorTicks, function(_, tick) {
                    var text = tick.labelText,
                        xCoord,
                        yCoord;
                    if (_isDefined(text) && text !== "" && !emptyStrRegExp.test(text)) {
                        xCoord = options.isHorizontal ? tick.labelPos.x : tick.labelPos.y;
                        yCoord = options.isHorizontal ? tick.labelPos.y : tick.labelPos.x;
                        if (!tick.label)
                            tick.label = renderer.text(text, xCoord, yCoord).css(tick.labelFontStyle).attr(tick.labelStyle).append(group);
                        else
                            tick.label.css(tick.labelFontStyle).attr(tick.labelStyle).attr({
                                text: text,
                                x: xCoord,
                                y: yCoord
                            });
                        $(tick.label.element).data({argument: tick.value})
                    }
                })
            },
            getMultipleAxesSpacing: function() {
                return this._options.multipleAxesSpacing || 0
            },
            _drawTitle: _noop,
            _getGridLineDrawer: function(borderOptions) {
                var that = this,
                    translator = that._translator,
                    options = that._options,
                    orthogonalTranslator = that._orthogonalTranslator,
                    isHorizontal = options.isHorizontal,
                    canvasStart = isHorizontal ? LEFT : TOP,
                    canvasEnd = isHorizontal ? RIGHT : BOTTOM,
                    positionFrom = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_START),
                    positionTo = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_END),
                    firstBorderLinePosition = borderOptions.visible && borderOptions[canvasStart] ? translator.translateSpecialCase(CANVAS_POSITION_PREFIX + canvasStart) : undefined,
                    lastBorderLinePosition = borderOptions.visible && borderOptions[canvasEnd] ? translator.translateSpecialCase(CANVAS_POSITION_PREFIX + canvasEnd) : undefined,
                    getPoints = isHorizontal ? function(tick) {
                        return tick.posX ? [tick.posX, positionFrom, tick.posX, positionTo] : null
                    } : function(tick) {
                        return tick.posX ? [positionFrom, tick.posX, positionTo, tick.posX] : null
                    };
                return function(tick) {
                        var points;
                        if (_abs(tick.posX - firstBorderLinePosition) < MAX_GRID_BORDER_ADHENSION || _abs(tick.posX - lastBorderLinePosition) < MAX_GRID_BORDER_ADHENSION)
                            return;
                        points = getPoints(tick);
                        return points && that._createPathElement(points, tick.gridStyle)
                    }
            },
            _drawGrids: function(ticks, borderOptions) {
                var that = this,
                    group = that._axisGridGroup,
                    drawLine = that._getGridLineDrawer(borderOptions || {visible: false});
                _each(ticks || [], function(_, tick) {
                    tick.grid = drawLine(tick);
                    tick.grid && tick.grid.append(group)
                })
            },
            _getConstantLinePos: function(lineValue, canvasStart, canvasEnd, range) {
                var parsedValue = this._validateUnit(lineValue, "E2105", "constantLine"),
                    value = this._getTranslatedCoord(parsedValue),
                    isContinous = !!(range.minVisible || range.maxVisible);
                if (!isContinous && $.inArray(lineValue, range.categories || []) === -1 || !_isDefined(value) || value < _math.min(canvasStart, canvasEnd) || value > _math.max(canvasStart, canvasEnd))
                    return {};
                return {
                        value: value,
                        parsedValue: parsedValue
                    }
            },
            _createConstantLine: function(value, attr) {
                var that = this,
                    orthogonalTranslator = this._orthogonalTranslator,
                    positionFrom = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_START),
                    positionTo = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_END),
                    points = this._options.isHorizontal ? [value, positionTo, value, positionFrom] : [positionFrom, value, positionTo, value];
                return that._createPathElement(points, attr)
            },
            _drawConstantLinesAndLabels: function(lineOptions, canvasStart, canvasEnd, range) {
                if (!_isDefined(lineOptions.value))
                    return;
                var pos = this._getConstantLinePos(lineOptions.value, canvasStart, canvasEnd, range),
                    labelOptions = lineOptions.label || {},
                    value = pos.value,
                    attr = {
                        stroke: lineOptions.color,
                        "stroke-width": lineOptions.width,
                        dashStyle: lineOptions.dashStyle
                    };
                if (!_isDefined(value)) {
                    this._constantLines.push(null);
                    if (labelOptions.visible)
                        this._constantLineLabels.push(null);
                    return
                }
                this._constantLines.push(this._createConstantLine(value, attr).append(this._axisConstantLineGroup));
                this._constantLineLabels.push(labelOptions.visible ? this._drawConstantLineLabels(pos.parsedValue, labelOptions, value) : null)
            },
            _drawConstantLine: function() {
                var that = this,
                    options = that._options,
                    data = options.constantLines,
                    canvas = that._getCanvasStartEnd();
                if (options.stubData)
                    return;
                that._constantLines = [];
                that._constantLineLabels = [];
                _each(data, function(_, dataItem) {
                    that._drawConstantLinesAndLabels(dataItem, canvas.start, canvas.end, that._range)
                })
            },
            _drawConstantLineLabels: function(parsedValue, lineLabelOptions, value) {
                var that = this,
                    text = lineLabelOptions.text,
                    options = that._options,
                    labelOptions = options.label,
                    coords;
                that._checkAlignmentConstantLineLabels(lineLabelOptions);
                text = _isDefined(text) ? text : formatLabel(parsedValue, labelOptions);
                coords = that._getConstantLineLabelsCoords(value, lineLabelOptions);
                return that._renderer.text(text, coords.x, coords.y).css(core.utils.patchFontOptions($.extend({}, labelOptions.font, lineLabelOptions.font))).attr({align: coords.align}).append(that._axisConstantLineGroup)
            },
            _adjustConstantLineLabels: _noop,
            _getStripPos: function(startValue, endValue, canvasStart, canvasEnd, range) {
                var isContinous = !!(range.minVisible || range.maxVisible),
                    categories = range.categories || [],
                    start = this._getTranslatedCoord(this._validateUnit(startValue, "E2105", "strip")),
                    end = this._getTranslatedCoord(this._validateUnit(endValue, "E2105", "strip")),
                    min = range.minVisible;
                if (!isContinous && ($.inArray(startValue, categories) === -1 || $.inArray(endValue, categories) === -1))
                    return {
                            stripFrom: 0,
                            stripTo: 0
                        };
                if (!_isDefined(start) && isContinous)
                    start = startValue < min ? canvasStart : canvasEnd;
                if (!_isDefined(end) && isContinous)
                    end = endValue < min ? canvasStart : canvasEnd;
                return start < end ? {
                        stripFrom: start,
                        stripTo: end
                    } : {
                        stripFrom: end,
                        stripTo: start
                    }
            },
            _createStrip: function(fromPoint, toPoint, attr) {
                var x,
                    y,
                    width,
                    height,
                    orthogonalTranslator = this._orthogonalTranslator,
                    positionFrom = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_START),
                    positionTo = orthogonalTranslator.translateSpecialCase(CANVAS_POSITION_END);
                if (this._options.isHorizontal) {
                    x = fromPoint;
                    y = _math.min(positionFrom, positionTo);
                    width = toPoint - fromPoint;
                    height = _abs(positionFrom - positionTo)
                }
                else {
                    x = _math.min(positionFrom, positionTo);
                    y = fromPoint;
                    width = _abs(positionFrom - positionTo);
                    height = _abs(fromPoint - toPoint)
                }
                return this._renderer.rect(x, y, width, height).attr(attr)
            },
            _drawStrip: function() {
                var that = this,
                    options = that._options,
                    stripData = options.strips,
                    canvas = this._getCanvasStartEnd(),
                    i,
                    stripOptions,
                    stripPos,
                    stripLabelOptions,
                    attr;
                if (options.stubData)
                    return;
                that._strips = [];
                that._stripLabels = [];
                for (i = 0; i < stripData.length; i++) {
                    stripOptions = stripData[i];
                    stripLabelOptions = stripOptions.label || {};
                    attr = {fill: stripOptions.color};
                    if (_isDefined(stripOptions.startValue) && _isDefined(stripOptions.endValue) && _isDefined(stripOptions.color)) {
                        stripPos = that._getStripPos(stripOptions.startValue, stripOptions.endValue, canvas.start, canvas.end, that._range);
                        if (stripPos.stripTo - stripPos.stripFrom === 0 || !_isDefined(stripPos.stripTo) || !_isDefined(stripPos.stripFrom)) {
                            that._strips.push(null);
                            if (stripLabelOptions.text)
                                that._stripLabels.push(null);
                            continue
                        }
                        that._strips.push(that._createStrip(stripPos.stripFrom, stripPos.stripTo, attr).append(that._axisStripGroup));
                        that._stripLabels.push(stripLabelOptions.text ? that._drawStripLabel(stripLabelOptions, stripPos.stripFrom, stripPos.stripTo) : null)
                    }
                }
            },
            _drawStripLabel: function(stripLabelOptions, stripFrom, stripTo) {
                var that = this,
                    options = that._options,
                    coords = that._getStripLabelCoords(stripLabelOptions, stripFrom, stripTo);
                return that._renderer.text(stripLabelOptions.text, coords.x, coords.y).css(core.utils.patchFontOptions($.extend({}, options.label.font, stripLabelOptions.font))).attr({align: coords.align}).append(that._axisLabelGroup)
            },
            _adjustStripLabels: function() {
                var that = this,
                    labels = that._stripLabels,
                    rects = that._strips,
                    i,
                    coords;
                if (labels === undefined && rects === undefined)
                    return;
                for (i = 0; i < labels.length; i++)
                    if (labels[i] !== null) {
                        coords = that._getAdjustedStripLabelCoords(that._options.strips[i], labels[i], rects[i]);
                        labels[i].move(coords.x, coords.y)
                    }
            },
            _initAxisPositions: _noop,
            _adjustLabels: function() {
                var that = this,
                    options = that._options,
                    majorTicks = that._majorTicks,
                    majorTicksLength = majorTicks.length,
                    isHorizontal = options.isHorizontal,
                    overlappingBehavior = that._tickManager ? that._tickManager.getOverlappingBehavior() : options.label.overlappingBehavior,
                    position = options.position,
                    label,
                    labelHeight,
                    isNeedLabelAdjustment,
                    staggeringSpacing,
                    i,
                    box,
                    hasLabels = false;
                _each(majorTicks, function(_, tick) {
                    if (tick.label) {
                        tick.label.attr(that._getLabelAdjustedCoord(tick));
                        hasLabels = true
                    }
                });
                isNeedLabelAdjustment = hasLabels && isHorizontal && overlappingBehavior && overlappingBehavior.mode === "stagger";
                if (isNeedLabelAdjustment) {
                    labelHeight = 0;
                    for (i = 0; i < majorTicksLength; i = i + 2) {
                        label = majorTicks[i].label;
                        box = label && label.getBBox() || {};
                        if (box.height > labelHeight)
                            labelHeight = box.height
                    }
                    staggeringSpacing = overlappingBehavior.staggeringSpacing;
                    labelHeight = _round(labelHeight) + staggeringSpacing;
                    for (i = 1; i < majorTicksLength; i = i + 2) {
                        label = majorTicks[i].label;
                        if (label)
                            if (position === BOTTOM)
                                label.move(0, labelHeight);
                            else if (position === TOP)
                                label.move(0, -labelHeight)
                    }
                    for (i = 0; i < majorTicksLength; i++)
                        majorTicks[i].label && majorTicks[i].label.rotate(0)
                }
            },
            _getLabelAdjustedCoord: function(tick) {
                var that = this,
                    options = that._options,
                    box = tick.label.getBBox(),
                    x,
                    y,
                    boxAxis = that._axisElementsGroup && that._axisElementsGroup.getBBox() || {},
                    isHorizontal = options.isHorizontal,
                    position = options.position,
                    shift = that.padding && that.padding[position] || 0,
                    textOptions = that._textOptions,
                    labelSettingsY = tick.label.attr("y");
                if (isHorizontal && position === BOTTOM)
                    y = 2 * labelSettingsY - box.y + shift;
                else if (!isHorizontal) {
                    if (position === LEFT)
                        if (textOptions.align === RIGHT)
                            x = box.x + box.width - shift;
                        else if (textOptions.align === CENTER)
                            x = box.x + box.width / 2 - shift - (boxAxis.width / 2 || 0);
                        else
                            x = box.x - shift - (boxAxis.width || 0);
                    else if (textOptions.align === CENTER)
                        x = box.x + box.width / 2 + (boxAxis.width / 2 || 0) + shift;
                    else if (textOptions.align === RIGHT)
                        x = box.x + box.width + (boxAxis.width || 0) + shift;
                    else
                        x = box.x + shift;
                    y = labelSettingsY + ~~(labelSettingsY - box.y - box.height / 2)
                }
                else if (isHorizontal && position === TOP)
                    y = 2 * labelSettingsY - box.y - box.height - shift;
                return {
                        x: x,
                        y: y
                    }
            },
            _adjustTitle: _noop,
            _createAxisGroups: function() {
                var renderer = this._renderer,
                    isHorizontal = this._options.isHorizontal,
                    cssClass = isHorizontal ? "dxc-h-axis" : "dxc-v-axis",
                    stripClass = isHorizontal ? "dxc-h-strips" : "dxc-v-strips",
                    constantLineClass = isHorizontal ? "dxc-h-constant-lines" : "dxc-v-constant-lines";
                this._axisGroup = renderer.g().attr({"class": cssClass});
                this._axisStripGroup = renderer.g().attr({"class": stripClass});
                this._axisGridGroup = renderer.g().attr({"class": "dxc-grid"}).append(this._axisGroup);
                this._axisElementsGroup = renderer.g().attr({"class": "dxc-elements"}).append(this._axisGroup);
                this._axisLineGroup = renderer.g().attr({"class": "dxc-line"}).append(this._axisGroup);
                this._axisTitleGroup = renderer.g().attr({"class": "dxc-title"}).append(this._axisGroup);
                this._axisConstantLineGroup = renderer.g().attr({"class": constantLineClass});
                this._axisLabelGroup = renderer.g().attr({"class": "dxc-axis-labels"})
            },
            _clearAxisGroups: function(adjustAxis) {
                this._axisGroup.remove();
                this._axisStripGroup.remove();
                this._axisLabelGroup.remove();
                this._axisConstantLineGroup.remove();
                if (this._axisTitleGroup)
                    this._axisTitleGroup.clear();
                else if (!adjustAxis)
                    this._axisTitleGroup = this._renderer.g().attr({"class": "dxc-title"}).append(this._axisGroup);
                this._axisGridGroup.clear();
                if (this._axisElementsGroup)
                    this._axisElementsGroup.clear();
                else if (!adjustAxis)
                    this._axisElementsGroup = this._renderer.g().attr({"class": "dxc-elements"}).append(this._axisGroup);
                this._axisLineGroup.clear();
                this._axisStripGroup.clear();
                this._axisConstantLineGroup.clear();
                this._axisLabelGroup.clear()
            },
            _initTicks: function(ticks, tickOptions, gridOptions, withLabels) {
                var that = this,
                    options = that._options,
                    axisPosition = that._axisPosition,
                    tickStyle = {
                        stroke: tickOptions.color,
                        "stroke-width": 1,
                        "stroke-opacity": tickOptions.opacity
                    },
                    gridStyle = {
                        stroke: gridOptions.color,
                        "stroke-width": gridOptions.width,
                        "stroke-opacity": gridOptions.opacity
                    },
                    currentLabelConst = that.getCurrentLabelPos();
                _each(ticks || [], function(_, tick) {
                    var coord = that._getTranslatedValue(tick.value, axisPosition, that._getTickOffset());
                    tick.posX = coord.x;
                    tick.posY = coord.y;
                    tick.angle = coord.angle;
                    tick.tickStyle = tickStyle;
                    tick.gridStyle = gridStyle;
                    if (withLabels) {
                        tick.labelText = formatLabel(tick.value, that._options.label, {
                            min: that._options.min,
                            max: that._options.max
                        });
                        tick.labelPos = that._getTranslatedValue(tick.value, currentLabelConst);
                        tick.labelStyle = that._textOptions;
                        tick.labelFontStyle = that._textFontStyles;
                        tick.labelHint = formatHint(tick.value, that._options.label, {
                            min: that._options.min,
                            max: that._options.max
                        })
                    }
                })
            },
            _getTickOffset: function() {
                var options = this._options,
                    offset = options.discreteAxisDivisionMode !== "crossLabels" || !options.discreteAxisDivisionMode;
                return options.isHorizontal ? +offset : -offset
            },
            draw: function(externalOptions, adjustAxis) {
                var that = this,
                    options = that._options,
                    areLabelsVisible;
                externalOptions = externalOptions || {};
                var debug = DX.utils.debug;
                debug.assertParam(this._translator, "translator was not set before Draw call");
                if (that._axisGroup)
                    that._clearAxisGroups(adjustAxis);
                areLabelsVisible = options.label.visible && that._axisElementsGroup && !that._options.stubData;
                that._updateTranslatorInterval();
                that._initAxisPositions();
                that._initTicks(that._majorTicks, options.tick, options.grid, areLabelsVisible);
                that._initTicks(that._decimatedTicks, options.tick, options.grid, false);
                that._initTicks(that._minorTicks, options.minorTick, options.minorGrid);
                if (!that._virtual) {
                    options.visible && that._drawAxis();
                    if (options.tick.visible) {
                        that._drawTicks(that._majorTicks);
                        that._drawTicks(that._decimatedTicks)
                    }
                    options.minorTick.visible && that._drawTicks(that._minorTicks);
                    areLabelsVisible && that._drawLabels();
                    that._drawTitle()
                }
                options.strips && that._drawStrip();
                options.constantLines && that._drawConstantLine();
                if (options.grid.visible) {
                    that._drawGrids(that._majorTicks, externalOptions.borderOptions || {});
                    that._drawGrids(that._decimatedTicks, externalOptions.borderOptions || {})
                }
                options.minorGrid.visible && that._drawGrids(that._minorTicks, externalOptions.borderOptions || {});
                that._axisStripGroup.append(that._stripsGroup);
                that._axisConstantLineGroup.append(that._constantLinesGroup);
                that._axisGroup.append(that._axesContainerGroup);
                that._axisLabelGroup.append(that._labelAxesGroup);
                that._adjustConstantLineLabels();
                areLabelsVisible && that._adjustLabels();
                that._createHints();
                that._adjustStripLabels();
                that._adjustTitle();
                that._setBoundingRect()
            },
            _createHints: function() {
                var that = this;
                _each(that._majorTicks || [], function(_, tick) {
                    if (_isDefined(tick.labelHint) && tick.labelHint !== "")
                        tick.label.setTitle(tick.labelHint)
                })
            },
            _setBoundingRect: function() {
                var that = this,
                    options = that._options,
                    axisBox = that._axisElementsGroup ? that._axisElementsGroup.getBBox() : {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0,
                        isEmpty: true
                    },
                    lineBox = that._axisLineGroup.getBBox(),
                    placeholderSize = options.placeholderSize,
                    start,
                    isHorizontal = options.isHorizontal,
                    coord = isHorizontal && "y" || "x",
                    side = isHorizontal && "height" || "width",
                    shiftCoords = options.crosshairEnabled ? isHorizontal ? LABEL_BACKGROUND_PADDING_Y : LABEL_BACKGROUND_PADDING_X : 0,
                    axisTitleBox = that._title && that._axisTitleGroup ? that._axisTitleGroup.getBBox() : axisBox;
                if (axisBox.isEmpty && axisTitleBox.isEmpty && !placeholderSize) {
                    that.boundingRect = axisBox;
                    return
                }
                start = lineBox[coord] || that._axisPosition;
                if (options.position === (isHorizontal && BOTTOM || RIGHT)) {
                    axisBox[side] = (placeholderSize || axisTitleBox[coord] + axisTitleBox[side] - start) + shiftCoords;
                    axisBox[coord] = start
                }
                else {
                    axisBox[side] = (placeholderSize || lineBox[side] + start - axisTitleBox[coord]) + shiftCoords;
                    axisBox[coord] = (axisTitleBox.isEmpty ? start : axisTitleBox[coord]) - shiftCoords
                }
                that.boundingRect = axisBox
            },
            getBoundingRect: function() {
                return this._axisElementsGroup ? this.boundingRect : {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0
                    }
            },
            shift: function(x, y) {
                var settings = {};
                if (x)
                    settings.translateX = x;
                if (y)
                    settings.translateY = y;
                this._axisGroup.attr(settings)
            },
            applyClipRects: function(elementsClipID, canvasClipID) {
                this._axisGroup.attr({clipId: canvasClipID});
                this._axisStripGroup.attr({clipId: elementsClipID})
            },
            validate: function(isArgumentAxis, incidentOccured) {
                var that = this,
                    options = that._options,
                    range = options.range,
                    parseUtils = new core.ParseUtils,
                    dataType = isArgumentAxis ? options.argumentType : options.valueType,
                    parser = dataType ? parseUtils.getParser(dataType, "axis") : function(unit) {
                        return unit
                    };
                that.parser = parser;
                that.incidentOccured = incidentOccured;
                options.dataType = dataType;
                if (options.min)
                    options.min = that._validateUnit(options.min, "E2106");
                if (options.max)
                    options.max = that._validateUnit(options.max, "E2106");
                if (range.min)
                    range.min = that._validateUnit(range.min);
                if (range.max)
                    range.max = that._validateUnit(range.max)
            },
            _validateUnit: function(unit, idError, parameters) {
                var that = this;
                unit = that.parser(unit);
                if (unit === undefined && idError)
                    that.incidentOccured(idError, [parameters]);
                return unit
            },
            adjustZoomValues: function(min, max, skipAdjusting) {
                var that = this,
                    range = that._options.range;
                skipAdjusting = skipAdjusting || that._options.type === DISCRETE;
                min = that._validateUnit(min);
                max = that._validateUnit(max);
                if (!skipAdjusting && range) {
                    if (_isDefined(range.min)) {
                        min = _isDefined(min) ? range.min < min ? min : range.min : min;
                        max = _isDefined(max) ? range.min < max ? max : range.min : max
                    }
                    if (_isDefined(range.max)) {
                        max = _isDefined(max) ? range.max > max ? max : range.max : max;
                        min = _isDefined(min) ? range.max > min ? min : range.max : min
                    }
                }
                that.minRangeArg = min;
                that.maxRangeArg = max;
                return {
                        min: min,
                        max: max
                    }
            },
            _getRange: function(options, min, max, categories, minRangeArg, maxRangeArg, stick) {
                var range = {},
                    addValueMarginToRange = function(prefix) {
                        if (options.valueMarginsEnabled) {
                            if (_isDefined(options[prefix])) {
                                range[prefix] = options[prefix];
                                range[prefix + "Priority"] = AXIS_VALUE_MARGIN_PRIORITY
                            }
                        }
                        else {
                            range[prefix] = 0;
                            range[prefix + "Priority"] = AXIS_VALUE_MARGIN_PRIORITY
                        }
                    },
                    type = options.type,
                    isDiscrete = type === DISCRETE;
                if (_isDefined(min) && _isDefined(max))
                    if (isDiscrete) {
                        range.startCategories = _isDefined(minRangeArg) ? minRangeArg : min;
                        range.endCategories = _isDefined(maxRangeArg) ? maxRangeArg : max
                    }
                    else {
                        range.min = min < max ? min : max;
                        range.max = max > min ? max : min
                    }
                else {
                    range.min = min;
                    range.max = max
                }
                addValueMarginToRange("minValueMargin");
                addValueMarginToRange("maxValueMargin");
                range.stick = stick;
                range.categories = categories;
                range.dataType = options.dataType;
                range.axisType = type;
                if (range.axisType === LOGARITHMIC)
                    range.base = options.logarithmBase;
                range.invert = options.inverted;
                range.minVisible = !isDiscrete ? _isDefined(minRangeArg) ? minRangeArg : min : undefined;
                range.maxVisible = !isDiscrete ? _isDefined(maxRangeArg) ? maxRangeArg : max : undefined;
                return range
            },
            _setType: function(type) {
                var that = this;
                _each(axesMethods[type], function(methodName, method) {
                    that[methodName] = method
                })
            },
            getSpiderTicks: _noop,
            setSpiderTicks: _noop,
            measureLabels: _noop,
            getRangeData: _noop,
            coordsIn: _noop
        };
        DX.viz.charts.Axis.__DEBUG = {axesMethods: axesMethods}
    })(jQuery, DevExpress);
    /*! Module viz-charts, file scrollBar.js */
    (function($, DX, math) {
        var MIN_SCROLL_BAR_SIZE = 2;
        DX.viz.charts.ScrollBar = function(renderer, group) {
            this._translator = DX.viz.core.CoreFactory.createTranslator2D({}, {}, {});
            this._scroll = renderer.rect().append(group);
            this._addEvents()
        };
        function _getXCoord(canvas, pos, offset, width) {
            var x = 0;
            if (pos === "right")
                x = canvas.width - canvas.right + offset;
            else if (pos === "left")
                x = canvas.left - offset - width;
            return x
        }
        function _getYCoord(canvas, pos, offset, width) {
            var y = 0;
            if (pos === "top")
                y = canvas.top - offset;
            else if (pos === "bottom")
                y = canvas.height - canvas.bottom + width + offset;
            return y
        }
        DX.viz.charts.ScrollBar.prototype = {
            _addEvents: function() {
                var that = this,
                    $scroll = $(that._scroll.element),
                    startPosX = 0,
                    startPosY = 0,
                    scrollChangeHandler = function(e) {
                        var dX = (startPosX - e.pageX) * that._scale,
                            dY = (startPosY - e.pageY) * that._scale;
                        $scroll.trigger(new $.Event("dxc-scroll-move", $.extend(e, {
                            type: "dxc-scroll-move",
                            pointers: [{
                                    pageX: startPosX + dX,
                                    pageY: startPosY + dY
                                }]
                        })))
                    };
                $scroll.on("dxpointerdown", function(e) {
                    startPosX = e.pageX;
                    startPosY = e.pageY;
                    $scroll.trigger(new $.Event("dxc-scroll-start", {pointers: [{
                                pageX: startPosX,
                                pageY: startPosY
                            }]}));
                    $(document).on("dxpointermove", scrollChangeHandler)
                });
                $(document).on("dxpointerup", function() {
                    $(document).off("dxpointermove", scrollChangeHandler)
                })
            },
            update: function(options) {
                var that = this,
                    scrollOptions = options.scrollBar,
                    position = scrollOptions.position,
                    isVertical = options.rotated,
                    defaultPosition = isVertical ? "right" : "top",
                    secondaryPosition = isVertical ? "left" : "bottom";
                if (position !== defaultPosition && position !== secondaryPosition)
                    position = defaultPosition;
                that._scroll.attr({
                    rotate: !options.rotated ? -90 : 0,
                    rotateX: 0,
                    rotateY: 0,
                    fill: scrollOptions.color,
                    width: scrollOptions.width,
                    opacity: scrollOptions.opacity
                });
                that._layoutOptions = {
                    width: scrollOptions.width,
                    offset: scrollOptions.offset,
                    vertical: isVertical,
                    position: position
                };
                return that
            },
            init: function(range, canvas) {
                var that = this;
                that._translateWithOffset = range.axisType === "discrete" && !range.stick && 1 || 0;
                that._translator.update($.extend({}, range, {
                    minVisible: null,
                    maxVisible: null,
                    visibleCategories: null,
                    startCategories: null
                }), $.extend({}, canvas), {direction: that._layoutOptions.vertical ? "vertical" : "horizontal"});
                return that
            },
            getOptions: function() {
                return this._layoutOptions
            },
            shift: function(x, y) {
                this._scroll.attr({
                    translateX: x,
                    translateY: y
                })
            },
            setPane: function(panes) {
                var position = this._layoutOptions.position,
                    pane;
                if (position === "left" || position === "top")
                    pane = panes[0];
                else
                    pane = panes[panes.length - 1];
                this.pane = pane.name;
                this._canvas = pane.canvas;
                return this
            },
            getMultipleAxesSpacing: function() {
                return 0
            },
            getBoundingRect: function() {
                var options = this._layoutOptions,
                    isVertical = options.vertical,
                    offset = options.offset,
                    width = options.width,
                    pos = options.position,
                    size = width + offset,
                    canvas = this._canvas;
                return isVertical ? {
                        x: _getXCoord(canvas, pos, offset, width),
                        y: canvas.top,
                        width: size,
                        height: canvas.height - canvas.top - canvas.bottom
                    } : {
                        x: canvas.left,
                        y: _getYCoord(canvas, pos, offset, width),
                        width: canvas.width - canvas.left - canvas.right,
                        height: size
                    }
            },
            applyLayout: function() {
                var canvas = this._canvas,
                    options = this._layoutOptions,
                    pos = options.position,
                    offset = options.offset,
                    width = options.width;
                this.shift(_getXCoord(canvas, pos, offset, width), _getYCoord(canvas, pos, offset, width))
            },
            setPosition: function(min, max) {
                var that = this,
                    translator = that._translator,
                    visibleArea = translator.getCanvasVisibleArea(),
                    minPoint = translator.translate(min, -that._translateWithOffset) || visibleArea.min,
                    maxPoint = translator.translate(max, that._translateWithOffset) || visibleArea.max;
                that._offset = math.min(minPoint, maxPoint);
                that._scale = translator.getScale(min, max);
                that._applyPosition(math.min(minPoint, maxPoint), math.max(minPoint, maxPoint))
            },
            transform: function(translate, scale) {
                var x = this._translator.getCanvasVisibleArea().min,
                    dx = x - (x * scale - translate),
                    lx = this._offset + dx / (this._scale * scale);
                this._applyPosition(lx, lx + this._translator.canvasLength / (this._scale * scale))
            },
            dispose: function() {
                $(this._scroll.element).off();
                this._scroll.remove();
                this._scroll = this._translator = null
            },
            _applyPosition: function(x1, x2) {
                var that = this,
                    visibleArea = that._translator.getCanvasVisibleArea(),
                    height;
                x1 = math.max(x1, visibleArea.min);
                x1 = math.min(x1, visibleArea.max);
                x2 = math.min(x2, visibleArea.max);
                x2 = math.max(x2, visibleArea.min);
                height = math.abs(x2 - x1);
                that._scroll.attr({
                    y: x1,
                    height: height < MIN_SCROLL_BAR_SIZE ? MIN_SCROLL_BAR_SIZE : height
                })
            }
        }
    })(jQuery, DevExpress, Math);
    /*! Module viz-charts, file baseChart.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            charts = DX.viz.charts,
            utils = DX.utils,
            ACTIONS_BY_PRIORITY = ['reinit', '_reinitDataSource', '_dataSourceChangedHandler', 'force_render'],
            core = DX.viz.core,
            _each = $.each,
            DEFAULT_ANIMATION_OPTIONS = {asyncSeriesRendering: true};
        function createEventMapObject(name, deprecatedArgs) {
            return {
                    name: name,
                    deprecated: name,
                    deprecatedContext: function(arg) {
                        return arg.target
                    },
                    deprecatedArgs: deprecatedArgs || function(arg) {
                        return [arg.target, arg.jQueryEvent]
                    }
                }
        }
        function resolveLabelOverlappingInOneDirection(points, canvas, isRotated) {
            var rollingStocks = $.map(points, function(point) {
                    return new RollingStock(point, isRotated)
                });
            rollingStocks.sort(function(a, b) {
                return a.getPointPosition() - b.getPointPosition()
            });
            if (!checkStackOverlap(rollingStocks))
                return;
            rollingStocks.reverse();
            moveRollingStock(rollingStocks, {
                start: isRotated ? canvas.left : canvas.top,
                end: isRotated ? canvas.width - canvas.right : canvas.height - canvas.bottom
            })
        }
        function overlapRollingStock(firstRolling, secondRolling) {
            if (!firstRolling || !secondRolling)
                return;
            return firstRolling.getBoundingRect().end > secondRolling.getBoundingRect().start
        }
        function checkStackOverlap(rollingStocks) {
            var i,
                j,
                currentRollingStock,
                nextRollingStock,
                overlap;
            for (i = 0; i < rollingStocks.length; i++) {
                currentRollingStock = rollingStocks[i];
                for (j = i + 1; j < rollingStocks.length; j++) {
                    nextRollingStock = rollingStocks[j];
                    if (overlapRollingStock(currentRollingStock, nextRollingStock)) {
                        currentRollingStock.toChain(nextRollingStock);
                        overlap = true;
                        rollingStocks[j] = null
                    }
                }
            }
            return overlap
        }
        function moveRollingStock(rollingStocks, canvas) {
            var i,
                j,
                currentRollingStock,
                nextRollingStock,
                currentBBox,
                nextBBox;
            for (i = 0; i < rollingStocks.length; i++) {
                currentRollingStock = rollingStocks[i];
                if (rollingStocksIsOut(currentRollingStock, canvas)) {
                    currentBBox = currentRollingStock.getBoundingRect();
                    for (j = i + 1; j < rollingStocks.length; j++) {
                        nextRollingStock = rollingStocks[j];
                        if (!nextRollingStock)
                            continue;
                        nextBBox = nextRollingStock.getBoundingRect();
                        if (nextBBox.end > currentBBox.start - (currentBBox.end - canvas.end)) {
                            nextRollingStock.toChain(currentRollingStock);
                            rollingStocks[i] = currentRollingStock = null;
                            break
                        }
                    }
                }
                currentRollingStock && currentRollingStock.setRollingStockInCanvas(canvas)
            }
        }
        function rollingStocksIsOut(rollingStock, canvas) {
            return rollingStock && rollingStock.getBoundingRect().end > canvas.end
        }
        function RollingStock(point, isRotated) {
            var label = point.getLabel(),
                bbox = label.getBoundingRect();
            this.labels = [label];
            this.points = [point];
            this.direction = isRotated;
            this._bbox = {
                start: isRotated ? bbox.x : bbox.y,
                width: isRotated ? bbox.width : bbox.height,
                end: isRotated ? bbox.x + bbox.width : bbox.y + bbox.height
            };
            this._pointPositionInitialize = isRotated ? point.getBoundaryCoords().x : point.getBoundaryCoords().y;
            return this
        }
        RollingStock.prototype = {
            toChain: function(nextRollingStock) {
                var nextRollingStockBBox = nextRollingStock.getBoundingRect();
                nextRollingStock.shift(nextRollingStockBBox.start - this._bbox.end);
                this._changeBoxWidth(nextRollingStockBBox.width);
                this.labels = this.labels.concat(nextRollingStock.labels);
                this.points = this.points.concat(nextRollingStock.points)
            },
            getBoundingRect: function() {
                return this._bbox
            },
            shift: function(shiftLength, startIndex) {
                var isRotated = this.direction;
                _each(this.labels, function(index, label) {
                    if (!label || startIndex > index)
                        return;
                    var bbox = label.getBoundingRect();
                    label.shift(isRotated ? bbox.x - shiftLength : bbox.x, isRotated ? bbox.y : bbox.y - shiftLength)
                });
                if (!startIndex) {
                    this._bbox.end -= shiftLength;
                    this._bbox.start -= shiftLength
                }
            },
            setRollingStockInCanvas: function(canvas) {
                var i;
                for (i = 0; i < this.labels.length; i++) {
                    if (this._bbox.end <= canvas.end)
                        break;
                    if (this._bbox.start - (this._bbox.end - (canvas.end - canvas.start)) >= 0)
                        this.shift(this._bbox.end - canvas.end);
                    else
                        this._killSmallestValueLabel()
                }
            },
            getPointPosition: function() {
                return this._pointPositionInitialize
            },
            _changeBoxWidth: function(width) {
                this._bbox.end += width;
                this._bbox.width += width
            },
            _killSmallestValueLabel: function() {
                var smallestValuePoint = {originalValue: Infinity},
                    labelBBox,
                    indexOfPoint = null;
                _each(this.points, function(index, point) {
                    if (point && smallestValuePoint.originalValue >= point.originalValue) {
                        smallestValuePoint = point;
                        indexOfPoint = index
                    }
                });
                if (indexOfPoint !== null) {
                    labelBBox = this.labels[indexOfPoint].getBoundingRect();
                    this._changeBoxWidth(-(this.direction ? labelBBox.width : labelBBox.height));
                    this.labels[indexOfPoint].hide();
                    this.points[indexOfPoint] = this.labels[indexOfPoint] = null;
                    this.shift(this.direction ? labelBBox.width : labelBBox.height, indexOfPoint + 1)
                }
            }
        };
        charts.BaseChart = core.BaseWidget.inherit({
            _eventsMap: $.extend({}, core.BaseWidget.prototype._eventsMap, {
                onSeriesClick: createEventMapObject("seriesClick"),
                onPointClick: createEventMapObject("pointClick"),
                onArgumentAxisClick: createEventMapObject("argumentAxisClick", function(arg) {
                    return [arg.target, arg.argument, arg.jQueryEvent]
                }),
                onLegendClick: createEventMapObject("legendClick"),
                onSeriesSelectionChanged: createEventMapObject('seriesSelectionChanged'),
                onPointSelectionChanged: createEventMapObject('pointSelectionChanged'),
                onSeriesHoverChanged: createEventMapObject('seriesHoverChanged'),
                onPointHoverChanged: createEventMapObject('pointHoverChanged'),
                onTooltipShown: createEventMapObject('tooltipShown'),
                onTooltipHidden: createEventMapObject('tooltipHidden'),
                onDone: createEventMapObject("done"),
                seriesClick: {newName: 'onSeriesClick'},
                pointClick: {newName: 'onPointClick'},
                argumentAxisClick: {newName: 'onArgumentAxisClick'},
                legendClick: {newName: 'onLegendClick'},
                pointHoverChanged: {newName: 'onPointHoverChanged'},
                seriesSelectionChanged: {newName: 'onSeriesSelectionChanged'},
                pointSelectionChanged: {newName: 'onPointSelectionChanged'},
                seriesHoverChanged: {newName: 'onSeriesHoverChanged'},
                tooltipShown: {newName: 'onTooltipShown'},
                tooltipHidden: {newName: 'onTooltipHidden'},
                done: {newName: 'onDone'}
            }),
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {
                    seriesClick: {
                        since: '14.2',
                        message: "Use the 'onSeriesClick' option instead"
                    },
                    pointClick: {
                        since: '14.2',
                        message: "Use the 'onPointClick' option instead"
                    },
                    argumentAxisClick: {
                        since: '14.2',
                        message: "Use the 'onArgumentAxisClick' option instead"
                    },
                    legendClick: {
                        since: '14.2',
                        message: "Use the 'onLegendClick' option instead"
                    },
                    seriesSelectionChanged: {
                        since: '14.2',
                        message: "Use the 'onSeriesSelectionChanged' option instead"
                    },
                    pointSelectionChanged: {
                        since: '14.2',
                        message: "Use the 'onPointSelectionChanged' option instead"
                    },
                    seriesHoverChanged: {
                        since: '14.2',
                        message: "Use the 'onSeriesHoverChanged' option instead"
                    },
                    pointHoverChanged: {
                        since: '14.2',
                        message: "Use the 'onPointHoverChanged' option instead"
                    },
                    tooltipShown: {
                        since: '14.2',
                        message: "Use the 'onTooltipShown' option instead"
                    },
                    tooltipHidden: {
                        since: '14.2',
                        message: "Use the 'onTooltipHidden' option instead"
                    },
                    done: {
                        since: '14.2',
                        message: "Use the 'onDone' option instead"
                    }
                })
            },
            _init: function() {
                var that = this;
                that.themeManager = charts.factory.createThemeManager(that.option(), that._chartType);
                that.callBase();
                that._initRenderer();
                that.canvasClipRect = that.renderer.clipRect();
                that._createHtmlStructure();
                that._needHandleRenderComplete = true;
                that.layoutManager = charts.factory.createChartLayoutManager(that._layoutManagerOptions());
                that._createScrollBar();
                that._reinit();
                that.element().css({webkitUserSelect: 'none'}).on('contextmenu', function(event) {
                    that.eventType = 'contextmenu';
                    if (ui.events.isTouchEvent(event) || ui.events.isPointerEvent(event))
                        event.preventDefault()
                }).on('MSHoldVisual', function(event) {
                    that.eventType = 'MSHoldVisual';
                    event.preventDefault()
                })
            },
            _layoutManagerOptions: function() {
                return this.themeManager.getOptions("adaptiveLayout")
            },
            _reinit: function(needRedraw) {
                var that = this;
                charts._setCanvasValues(that.canvas);
                that._createTracker();
                that._reinitAxes();
                that._reinitDataSource();
                if (!that.series)
                    that._dataSpecificInit();
                that._correctAxes();
                needRedraw && that._endLoading(function() {
                    that._render({force: true})
                })
            },
            _createHtmlStructure: function() {
                var that = this,
                    renderer = that.renderer;
                that._backgroundRect = renderer.rect(0, 0, 0, 0).attr({
                    fill: "gray",
                    opacity: 0.0001
                });
                that._panesBackgroundGroup = renderer.g().attr({'class': 'dxc-background'});
                that._titleGroup = renderer.g().attr({'class': 'dxc-title'});
                that._legendGroup = renderer.g().attr({
                    'class': 'dxc-legend',
                    clipId: that._getCanvasClipRectID()
                });
                that._stripsGroup = renderer.g().attr({'class': 'dxc-strips-group'});
                that._constantLinesGroup = renderer.g().attr({'class': 'dxc-constant-lines-group'});
                that._axesGroup = renderer.g().attr({'class': 'dxc-axes-group'});
                that._panesBorderGroup = renderer.g().attr({'class': 'dxc-border'});
                that._labelAxesGroup = renderer.g().attr({'class': 'dxc-strips-labels-group'});
                that._scrollBarGroup = renderer.g().attr({'class': 'dxc-scroll-bar'});
                that._seriesGroup = renderer.g().attr({'class': 'dxc-series-group'});
                that._labelsGroup = renderer.g().attr({'class': 'dxc-labels-group'});
                that._tooltipGroup = renderer.g().attr({'class': 'dxc-tooltip'});
                that._crosshairCursorGroup = renderer.g().attr({'class': 'dxc-crosshair-cursor'})
            },
            _disposeObjectsInArray: function(propName, fieldNames) {
                $.each(this[propName] || [], function(_, item) {
                    if (fieldNames && item)
                        $.each(fieldNames, function(_, field) {
                            item[field] && item[field].dispose()
                        });
                    else
                        item && item.dispose()
                });
                this[propName] = null
            },
            _dispose: function() {
                var that = this,
                    disposeObject = function(propName) {
                        that[propName] && that[propName].dispose(),
                        that[propName] = null
                    },
                    detachGroup = function(groupName) {
                        that[groupName] && that[groupName].remove()
                    },
                    disposeObjectsInArray = this._disposeObjectsInArray;
                clearTimeout(that._delayedRedraw);
                that.renderer.stopAllAnimations();
                that.callBase();
                disposeObjectsInArray.call(that, "businessRanges", ["arg", "val"]);
                that.translators = null;
                disposeObjectsInArray.call(that, "series");
                disposeObject("layoutManager");
                disposeObject("themeManager");
                disposeObject("renderer");
                disposeObject("tracker");
                disposeObject("tooltip");
                disposeObject("chartTitle");
                that.paneAxis = null;
                that._userOptions = null;
                that.dirtyCanvas = null;
                that.canvas = null;
                detachGroup("_legendGroup");
                detachGroup("_stripsGroup");
                detachGroup("_constantLinesGroup");
                detachGroup("_axesGroup");
                detachGroup("_labelAxesGroup");
                detachGroup("_seriesGroup");
                detachGroup("_labelsGroup");
                detachGroup("_crosshairCursorGroup");
                disposeObject("canvasClipRect");
                disposeObject("_panesBackgroundGroup");
                disposeObject("_titleGroup");
                disposeObject("_scrollBarGroup");
                disposeObject("_legendGroup");
                disposeObject("_stripsGroup");
                disposeObject("_constantLinesGroup");
                disposeObject("_axesGroup");
                disposeObject("_labelAxesGroup");
                disposeObject("_panesBorderGroup");
                disposeObject("_seriesGroup");
                disposeObject("_labelsGroup");
                disposeObject("_tooltipGroup");
                disposeObject("_crosshairCursorGroup");
                that._disposeLoadIndicator()
            },
            _getAnimationOptions: function() {
                return $.extend({}, DEFAULT_ANIMATION_OPTIONS, this.themeManager.getOptions("animation"))
            },
            _initRenderer: function _initRenderer() {
                this.renderer = core.CoreFactory.createRenderer({
                    animation: this._getAnimationOptions(),
                    cssClass: 'dxc dxc-chart',
                    pathModified: this.option('pathModified'),
                    rtl: this.themeManager.getOptions('rtlEnabled')
                })
            },
            _reinitDataSource: function() {
                this._refreshDataSource()
            },
            _saveDirtyCanvas: function() {
                this.dirtyCanvas = $.extend({}, this.canvas)
            },
            _resize: function() {
                this._render({
                    animate: false,
                    isResize: true
                })
            },
            _calculateCanvas: function() {
                var canvas = this.themeManager.getOptions('size'),
                    width,
                    height;
                if (!utils.isDefined(canvas.width))
                    width = this.element().width() || 400;
                else
                    width = canvas.width < 0 ? 0 : canvas.width;
                if (!utils.isDefined(canvas.height))
                    height = this.element().height() || 400;
                else
                    height = canvas.height < 0 ? 0 : canvas.height;
                return $.extend({
                        width: width,
                        height: height
                    }, this.themeManager.getOptions('margin'))
            },
            _createTracker: function() {
                var that = this;
                if (that.tracker)
                    that.tracker.dispose();
                that.tracker = charts.factory.createTracker({
                    seriesSelectionMode: that.themeManager.getOptions('seriesSelectionMode'),
                    pointSelectionMode: that.themeManager.getOptions('pointSelectionMode'),
                    crosshair: that._crosshair,
                    seriesGroup: that._seriesGroup,
                    renderer: that.renderer,
                    eventTrigger: that._eventTrigger
                }, that.NAME)
            },
            _getTrackerSettings: function() {
                var that = this,
                    canvas = that.canvas;
                return {
                        series: that.series,
                        legend: that.legend,
                        tooltip: that.tooltip,
                        legendCallback: $.proxy(that.legend.getActionCallback, that.legend),
                        mainCanvas: {
                            left: 0,
                            right: canvas.width,
                            top: 0,
                            bottom: canvas.height
                        }
                    }
            },
            _updateTracker: function(canvases) {
                var that = this;
                if (!that.tracker)
                    that._createTracker();
                that.tracker.update(that._getTrackerSettings(canvases))
            },
            _render: function(_options) {
                var that = this,
                    renderer = that.renderer,
                    drawOptions = that._prepareDrawOptions(_options) || {recreateCanvas: true},
                    updatedCanvas = that.canvas,
                    currentDirtyCanvas = that._calculateCanvas(),
                    oldDirtyCanvas = that.dirtyCanvas;
                if (!drawOptions.force && oldDirtyCanvas && oldDirtyCanvas.width === currentDirtyCanvas.width && oldDirtyCanvas.height === currentDirtyCanvas.height && !that._hiddenContainer)
                    return;
                clearTimeout(that._delayedRedraw);
                if (drawOptions.recreateCanvas)
                    that.canvas = updatedCanvas = that._calculateCanvas();
                if (updatedCanvas.width && updatedCanvas.height && that.element().is(':visible'))
                    that._hiddenContainer = false;
                else {
                    that._incidentOccured('W2001', [that.NAME]);
                    that._hiddenContainer = true;
                    renderer.clear();
                    return
                }
                if (drawOptions.recreateCanvas) {
                    renderer.resize(that.canvas.width, that.canvas.height);
                    renderer.draw(that.element()[0]);
                    that._reappendLoadIndicator();
                    that._updateLoadIndicator(undefined, updatedCanvas.width, updatedCanvas.height);
                    that._updateCanvasClipRect()
                }
                that.renderer.stopAllAnimations(true);
                charts._setCanvasValues(that.canvas);
                that._cleanGroups(drawOptions);
                that._saveDirtyCanvas();
                that._renderElements(drawOptions)
            },
            _renderElements: function(drawOptions) {
                var that = this,
                    preparedOptions = that._prepareToRender(drawOptions),
                    isRotated = that._isRotated(),
                    isLegendInside = that._isLegendInside(),
                    trackerCanvases = [],
                    layoutTargets = that._getLayoutTargets(),
                    needHideLoadingIndicator = that._loadIndicator && that._loadIndicator.isShown && that._dataSource && that._dataSource.isLoaded() && !drawOptions.isResize,
                    argBusinessRange,
                    zoomMinArg,
                    zoomMaxArg;
                that._renderTitleAndLegend(drawOptions, isLegendInside);
                that._renderAxes(drawOptions, preparedOptions, isRotated);
                if (that.layoutManager.needMoreSpaceForPanesCanvas(that._getLayoutTargets(), isRotated)) {
                    that.layoutManager.updateDrawnElements(that._getAxesForTransform(isRotated), that.canvas, that.dirtyCanvas, that._getLayoutTargets(), isRotated);
                    if (that.chartTitle)
                        that.layoutManager.correctSizeElement(that.chartTitle, that.canvas);
                    that._updateCanvasClipRect(that.dirtyCanvas);
                    that._updateAxesLayout(drawOptions, preparedOptions, isRotated)
                }
                that.layoutManager.placeDrawnElements(that.canvas);
                that._applyClipRects(preparedOptions);
                that._appendSeriesGroups();
                that._createTooltip();
                $.each(layoutTargets, function() {
                    var canvas = this.canvas;
                    trackerCanvases.push({
                        left: canvas.left,
                        right: canvas.width - canvas.right,
                        top: canvas.top,
                        bottom: canvas.height - canvas.bottom
                    })
                });
                if (that._scrollBar) {
                    argBusinessRange = that.businessRanges[0].arg;
                    if (argBusinessRange.categories && argBusinessRange.categories.length <= 1)
                        zoomMinArg = zoomMaxArg = undefined;
                    else {
                        zoomMinArg = utils.isDefined(that._zoomMinArg) ? that._zoomMinArg : argBusinessRange.minVisible;
                        zoomMaxArg = utils.isDefined(that._zoomMaxArg) ? that._zoomMaxArg : argBusinessRange.maxVisible
                    }
                    that._scrollBar.init(argBusinessRange, layoutTargets[0].canvas).setPosition(zoomMinArg, zoomMaxArg)
                }
                drawOptions.updateTracker && that._updateTracker(trackerCanvases);
                var timeout = that._getSeriesRenderTimeout(drawOptions);
                if (timeout >= 0)
                    that._delayedRedraw = setTimeout(renderSeries, timeout);
                else
                    renderSeries();
                function renderSeries() {
                    that._renderSeries(drawOptions, isRotated, isLegendInside, needHideLoadingIndicator)
                }
            },
            _appendSeriesGroups: function() {
                var that = this;
                that._seriesGroup.append(that.renderer.root);
                that._labelsGroup.append(that.renderer.root);
                that._appendAdditionalSeriesGroups();
                that._tooltipGroup.append(that.renderer.root)
            },
            _renderSeries: function(drawOptions, isRotated, isLegendInside, needHideLoadingIndicator) {
                var that = this,
                    resolveLabelOverlapping = that.themeManager.getOptions("resolveLabelOverlapping");
                that._drawSeries(drawOptions, isRotated);
                that._updateLegendAndTooltip(drawOptions, isLegendInside);
                resolveLabelOverlapping !== "none" && that._resolveLabelOverlapping(resolveLabelOverlapping);
                that._renderTrackers(isLegendInside);
                if (needHideLoadingIndicator)
                    that.hideLoadingIndicator();
                that._drawn();
                that._renderCompleteHandler()
            },
            _resolveLabelOverlapping: function(resolveLabelOverlapping) {
                var func;
                switch (resolveLabelOverlapping) {
                    case"stack":
                        func = this._resolveLabelOverlappingStack;
                        break;
                    case"hide":
                        func = this._resolveLabelOverlappingHide;
                        break;
                    case"shift":
                        func = this._resolveLabelOverlappingShift;
                        break
                }
                $.isFunction(func) && func.call(this)
            },
            _resolveLabelOverlappingHide: function() {
                var labels = $.map(this.getAllSeries(), function(series) {
                        return $.map(series.getVisiblePoints(), function(point) {
                                return point.getLabel()
                            })
                    }),
                    currenctLabel,
                    nextLabel,
                    currenctLabelRect,
                    nextLabelRect,
                    i,
                    j;
                for (i = 0; i < labels.length; i++) {
                    currenctLabel = labels[i];
                    currenctLabelRect = currenctLabel.getBoundingRect();
                    if (currenctLabel.getVisibility() === "hidden")
                        continue;
                    for (j = i + 1; j < labels.length; j++) {
                        nextLabel = labels[j];
                        nextLabelRect = nextLabel.getBoundingRect();
                        if (utils.checkOverlapping(currenctLabelRect, nextLabelRect))
                            nextLabel.hide()
                    }
                }
            },
            _cleanGroups: function(drawOptions) {
                var that = this;
                that._stripsGroup.remove();
                that._constantLinesGroup.remove();
                that._axesGroup.remove();
                that._labelAxesGroup.remove();
                that._labelsGroup.remove();
                that._tooltipGroup.remove();
                that._crosshairCursorGroup.remove();
                if (!drawOptions || drawOptions.drawLegend)
                    that._legendGroup.remove().clear();
                if (!drawOptions || drawOptions.drawTitle)
                    that._titleGroup.remove().clear();
                that._stripsGroup.clear();
                that._constantLinesGroup.clear();
                that._axesGroup.clear();
                that._labelAxesGroup.clear();
                that._labelsGroup.clear();
                that._tooltipGroup.clear();
                that._crosshairCursorGroup.clear()
            },
            _drawTitle: function() {
                var that = this,
                    options = that.themeManager.getOptions("title"),
                    width = that.canvas.width - that.canvas.left - that.canvas.right;
                options._incidentOccured = that._incidentOccured;
                if (that.chartTitle)
                    that.chartTitle.update(options, width);
                else
                    that.chartTitle = charts.factory.createTitle(that.renderer, options, width, that._titleGroup)
            },
            _createLegend: function() {
                var that = this,
                    legendOptions = that.themeManager.getOptions('legend'),
                    legendData = that._getLegendData();
                legendOptions.containerBackgroundColor = that.themeManager.getOptions("containerBackgroundColor");
                legendOptions._incidentOccured = that._incidentOccured;
                if (that.legend)
                    that.legend.update(legendData, legendOptions);
                else
                    that.legend = core.CoreFactory.createLegend(legendData, legendOptions, that.renderer, that._legendGroup)
            },
            _createTooltip: function() {
                var that = this,
                    tooltipOptions = that.themeManager.getOptions('tooltip');
                if (!$.isFunction(tooltipOptions.customizeText) && utils.isDefined(tooltipOptions.customizeText)) {
                    that._incidentOccured("E2103", ['customizeText']);
                    tooltipOptions.customizeText = undefined
                }
                if (that.tooltip)
                    that.tooltip.update(tooltipOptions);
                else
                    that.tooltip = core.CoreFactory.createTooltip(tooltipOptions, that._tooltipGroup, that.renderer);
                that.tooltip.setSize(that.canvas.width, that.canvas.height)
            },
            _prepareDrawOptions: function(drawOptions) {
                var animationOptions = this._getAnimationOptions(),
                    options;
                options = $.extend({}, {
                    force: false,
                    adjustAxes: true,
                    drawLegend: true,
                    drawTitle: true,
                    adjustSeriesLabels: true,
                    animate: animationOptions.enabled,
                    animationPointsLimit: animationOptions.maxPointCountSupported,
                    asyncSeriesRendering: animationOptions.asyncSeriesRendering,
                    asyncTrackersRendering: animationOptions.asyncTrackersRendering,
                    trackerRenderingDelay: animationOptions.trackerRenderingDelay,
                    updateTracker: true
                }, drawOptions);
                if (!utils.isDefined(options.recreateCanvas))
                    options.recreateCanvas = options.adjustAxes && options.drawLegend && options.drawTitle;
                return options
            },
            _processRefreshData: function(newRefreshAction) {
                var currentRefreshActionPosition = $.inArray(this._currentRefreshData, ACTIONS_BY_PRIORITY),
                    newRefreshActionPosition = $.inArray(newRefreshAction, ACTIONS_BY_PRIORITY);
                if (!this._currentRefreshData || currentRefreshActionPosition >= 0 && newRefreshActionPosition < currentRefreshActionPosition)
                    this._currentRefreshData = newRefreshAction
            },
            _disposeSeries: function() {
                var that = this;
                $.each(that.series || [], function(_, series) {
                    series.dispose()
                });
                that.series = null;
                $.each(that.seriesFamilies || [], function(_, family) {
                    family.dispose()
                });
                that.seriesFamilies = null
            },
            _optionChanged: function(args) {
                var name = args.name;
                var that = this;
                that.themeManager.resetOptions(name);
                that.themeManager.update(that._options);
                if (name === 'animation') {
                    that.renderer.updateAnimationOptions(that._getAnimationOptions());
                    return
                }
                clearTimeout(that._delayedRedraw);
                switch (name) {
                    case'dataSource':
                        that._needHandleRenderComplete = true;
                        that._processRefreshData('_reinitDataSource');
                        break;
                    case'palette':
                        that.themeManager.updatePalette(that.option(name));
                        that._disposeSeries();
                        that._needHandleRenderComplete = true;
                        that._processRefreshData('_dataSourceChangedHandler');
                        break;
                    case'series':
                    case'commonSeriesSettings':
                    case'containerBackgroundColor':
                    case'dataPrepareSettings':
                        that._disposeSeries();
                        that._needHandleRenderComplete = true;
                        that._processRefreshData('_dataSourceChangedHandler');
                        break;
                    case'legend':
                    case'seriesTemplate':
                        that._processRefreshData('_dataSourceChangedHandler');
                        break;
                    case'title':
                        that._processRefreshData('force_render');
                        break;
                    case'valueAxis':
                    case'argumentAxis':
                    case'commonAxisSettings':
                        that._needHandleRenderComplete = true;
                        that._processRefreshData('reinit');
                        that._disposeSeries();
                        that.paneAxis = {};
                        break;
                    case'panes':
                    case'defaultPane':
                        that._disposeSeries();
                        that.paneAxis = {};
                        that._needHandleRenderComplete = true;
                        that._processRefreshData('reinit');
                        break;
                    case'size':
                        that._processRefreshData('force_render');
                        break;
                    case'rotated':
                    case'equalBarWidth':
                    case'customizePoint':
                    case'customizeLabel':
                        that._disposeSeries();
                        that._needHandleRenderComplete = true;
                        that._processRefreshData('reinit');
                        break;
                    case'theme':
                        that._disposeSeries();
                        that.themeManager.setTheme(that.option(name));
                        that._processRefreshData('reinit');
                        break;
                    case'scrollBar':
                        that._createScrollBar();
                        that._processRefreshData('force_render');
                    default:
                        that._processRefreshData('reinit')
                }
                that.callBase.apply(that, arguments)
            },
            _getLoadIndicatorOption: function() {
                return this.themeManager.getOptions("loadingIndicator")
            },
            _refresh: function() {
                var that = this;
                that.renderer.stopAllAnimations(true);
                if (that._currentRefreshData) {
                    switch (that._currentRefreshData) {
                        case'force_render':
                            that._render({force: true});
                            break;
                        case'reinit':
                            that._reinit(true);
                            break;
                        default:
                            that[that._currentRefreshData] && that[that._currentRefreshData]()
                    }
                    delete that._currentRefreshData
                }
                else
                    that._render({force: true})
            },
            _dataSourceOptions: function() {
                return {
                        paginate: false,
                        _preferSync: true
                    }
            },
            _updateCanvasClipRect: function(canvas) {
                var that = this,
                    width,
                    height;
                canvas = canvas || that.canvas;
                width = Math.max(canvas.width - canvas.left - canvas.right, 0);
                height = Math.max(canvas.height - canvas.top - canvas.bottom, 0);
                that.canvasClipRect.attr({
                    x: canvas.left,
                    y: canvas.top,
                    width: width,
                    height: height
                });
                that._backgroundRect.attr({
                    x: canvas.left,
                    y: canvas.top,
                    width: width,
                    height: height
                }).append(that.renderer.root).toBackground()
            },
            _getCanvasClipRectID: function() {
                return this.canvasClipRect.id
            },
            _dataSourceChangedHandler: function() {
                clearTimeout(this._delayedRedraw);
                this._dataSpecificInit(true)
            },
            _dataSpecificInit: function(needRedraw) {
                this.series = this.series || this._populateSeries();
                this._repopulateSeries();
                this._seriesPopulatedHandler(needRedraw)
            },
            _seriesPopulatedHandler: function(needRedraw) {
                var that = this;
                that._seriesPopulatedHandlerCore();
                that._populateBusinessRange();
                that._createLegend();
                needRedraw && that._endLoading(function() {
                    that._render({force: true})
                })
            },
            _repopulateSeries: function() {
                var that = this,
                    parsedData,
                    data = that._dataSource && that._dataSource.items(),
                    dataValidatorOptions = that.themeManager.getOptions('dataPrepareSettings'),
                    sharedTooltip = that.themeManager.getOptions("tooltip").shared,
                    stackPoints = {},
                    seriesTemplate = that.themeManager.getOptions('seriesTemplate');
                if (that._dataSource && seriesTemplate) {
                    that._templatedSeries = utils.processSeriesTemplate(seriesTemplate, that._dataSource.items());
                    that._populateSeries();
                    delete that._templatedSeries;
                    data = that.teamplateData || data
                }
                that._groupSeries();
                that._dataValidator = charts.factory.createDataValidator(data, that._groupedSeries, that._incidentOccured, dataValidatorOptions);
                parsedData = that._dataValidator.validate();
                that.themeManager.resetPalette();
                $.each(that.series, function(_, singleSeries) {
                    singleSeries.updateData(parsedData);
                    that._processSingleSeries(singleSeries);
                    sharedTooltip && that._prepareStackPoints(singleSeries, stackPoints, true)
                })
            },
            _renderCompleteHandler: function() {
                var that = this,
                    allSeriesInited = true;
                if (that._needHandleRenderComplete) {
                    $.each(that.series, function(_, s) {
                        allSeriesInited = allSeriesInited && s.canRenderCompleteHandle()
                    });
                    if (allSeriesInited) {
                        that._needHandleRenderComplete = false;
                        that._eventTrigger("done", {target: that})
                    }
                }
            },
            _renderTitleAndLegend: function(drawOptions, legendHasInsidePosition) {
                var that = this,
                    titleOptions = that.themeManager.getOptions("title"),
                    drawTitle = titleOptions.text && drawOptions.drawTitle,
                    drawLegend = drawOptions.drawLegend && that.legend && !legendHasInsidePosition,
                    drawElements = [];
                if (drawTitle) {
                    that._titleGroup.append(that.renderer.root);
                    that._drawTitle();
                    drawElements.push(that.chartTitle)
                }
                if (drawLegend) {
                    that._legendGroup.append(that.renderer.root);
                    drawElements.push(that.legend)
                }
                drawElements.length && that.layoutManager.drawElements(drawElements, that.canvas);
                if (drawTitle)
                    that.layoutManager.correctSizeElement(that.chartTitle, that.canvas)
            },
            _prepareStackPoints: $.noop,
            _resolveLabelOverlappingInOneDirection: function() {
                resolveLabelOverlappingInOneDirection.apply(null, arguments)
            },
            getAllSeries: function getAllSeries() {
                return this.series.slice()
            },
            getSeriesByName: function getSeriesByName(name) {
                var found = null;
                $.each(this.series, function(i, singleSeries) {
                    if (singleSeries.name === name) {
                        found = singleSeries;
                        return false
                    }
                });
                return found
            },
            getSeriesByPos: function getSeriesByPos(pos) {
                return this.series[pos]
            },
            clearSelection: function clearSelection() {
                this.tracker.clearSelection()
            },
            hideTooltip: function() {
                this.tracker._hideTooltip()
            },
            render: function(renderOptions) {
                this._render(renderOptions)
            },
            getSize: function() {
                var canvas = this.canvas || {};
                return {
                        width: canvas.width,
                        height: canvas.height
                    }
            }
        }).include(ui.DataHelperMixin)
    })(jQuery, DevExpress);
    /*! Module viz-charts, file advancedChart.js */
    (function($, DX, undefined) {
        var charts = DX.viz.charts,
            utils = DX.utils,
            core = DX.viz.core,
            DEFAULT_AXIS_NAME = "defaultAxisName",
            _isArray = utils.isArray,
            _isDefined = utils.isDefined,
            _each = $.each,
            _extend = $.extend,
            _map = $.map,
            MIN = 'min',
            MAX = 'max';
        function prepareAxis(axisOptions) {
            return _isArray(axisOptions) ? axisOptions.length === 0 ? [{}] : axisOptions : [axisOptions]
        }
        function unique(array) {
            var values = {},
                i,
                len = array.length;
            for (i = 0; i < len; i++)
                values[array[i]] = true;
            return _map(values, function(_, key) {
                    return key
                })
        }
        function prepareVisibleArea(visibleArea, axisRange, useAggregation, aggregationRange) {
            visibleArea.minVal = axisRange.min;
            visibleArea.maxVal = axisRange.max;
            if (useAggregation && !visibleArea.adjustOnZoom) {
                visibleArea.minVal = _isDefined(visibleArea.minVal) ? visibleArea.minVal : aggregationRange.val.min;
                visibleArea.maxVal = _isDefined(visibleArea.maxVal) ? visibleArea.maxVal : aggregationRange.val.max
            }
        }
        charts.AdvancedChart = charts.BaseChart.inherit({
            _dispose: function() {
                var that = this,
                    disposeObjectsInArray = this._disposeObjectsInArray;
                that.callBase();
                that.panes = null;
                that.legend && (that.legend.dispose(), that.legend = null);
                disposeObjectsInArray.call(that, "panesBackground");
                disposeObjectsInArray.call(that, "seriesFamilies");
                that._disposeAxes()
            },
            _reinitAxes: function() {
                this.translators = {};
                this.panes = this._createPanes();
                this._populateAxes()
            },
            _populateSeries: function() {
                var that = this,
                    themeManager = that.themeManager,
                    hasSeriesTemplate = !!themeManager.getOptions("seriesTemplate"),
                    series = hasSeriesTemplate ? that._templatedSeries : that.option("series"),
                    allSeriesOptions = _isArray(series) ? series : series ? [series] : [],
                    argumentAxisOptions = that.option("argumentAxis"),
                    valueAxisOptions = that.option("valueAxis"),
                    data,
                    particularSeriesOptions,
                    particularSeries,
                    rotated = that._isRotated(),
                    i,
                    paneList = _map(that.panes, function(pane) {
                        return pane.name
                    }),
                    paneName;
                that.teamplateData = [];
                that._disposeSeries();
                that.series = [];
                themeManager.resetPalette();
                for (i = 0; i < allSeriesOptions.length; i++) {
                    particularSeriesOptions = _extend(true, {}, allSeriesOptions[i]);
                    if (particularSeriesOptions.type && !utils.isString(particularSeriesOptions.type))
                        particularSeriesOptions.type = "";
                    data = particularSeriesOptions.data;
                    particularSeriesOptions.data = null;
                    particularSeriesOptions.rotated = rotated;
                    particularSeriesOptions.customizePoint = themeManager.getOptions("customizePoint");
                    particularSeriesOptions.customizeLabel = themeManager.getOptions("customizeLabel");
                    particularSeriesOptions.visibilityChanged = $.proxy(that._seriesVisibilityChanged, that);
                    particularSeriesOptions.resolveLabelsOverlapping = themeManager.getOptions("resolveLabelsOverlapping");
                    if (argumentAxisOptions) {
                        particularSeriesOptions.argumentCategories = argumentAxisOptions.categories;
                        particularSeriesOptions.argumentAxisType = argumentAxisOptions.type;
                        particularSeriesOptions.argumentType = argumentAxisOptions.argumentType
                    }
                    if (valueAxisOptions)
                        if (_isArray(valueAxisOptions))
                            _each(valueAxisOptions, function(iter, options) {
                                if (!particularSeriesOptions.axis && !iter || particularSeriesOptions.axis === options.name) {
                                    particularSeriesOptions.valueCategories = options.categories;
                                    particularSeriesOptions.valueAxisType = options.type;
                                    particularSeriesOptions.valueType = options.valueType;
                                    particularSeriesOptions.showZero = options.showZero
                                }
                            });
                        else {
                            particularSeriesOptions.valueCategories = valueAxisOptions.categories;
                            particularSeriesOptions.valueAxisType = valueAxisOptions.type;
                            particularSeriesOptions.valueType = valueAxisOptions.valueType;
                            particularSeriesOptions.showZero = valueAxisOptions.showZero
                        }
                    particularSeriesOptions.incidentOccured = that._incidentOccured;
                    if (!particularSeriesOptions.name)
                        particularSeriesOptions.name = "Series " + (i + 1).toString();
                    var seriesTheme = themeManager.getOptions("series", particularSeriesOptions);
                    seriesTheme.pane = seriesTheme.pane || that.defaultPane;
                    paneName = seriesTheme.pane;
                    if ($.inArray(paneName, paneList) === -1)
                        continue;
                    particularSeries = core.CoreFactory.createSeries({
                        renderer: that.renderer,
                        seriesGroup: that._seriesGroup,
                        labelsGroup: that._labelsGroup
                    }, seriesTheme);
                    if (!particularSeries.isUpdated)
                        that._incidentOccured("E2101", [seriesTheme.type]);
                    else {
                        particularSeries.index = i;
                        that.series.push(particularSeries)
                    }
                    if (hasSeriesTemplate) {
                        _each(data, function(_, data) {
                            _each(particularSeries.getTeamplatedFields(), function(_, field) {
                                data[field.teamplateField] = data[field.originalField]
                            });
                            that.teamplateData.push(data)
                        });
                        particularSeries.updateTeamplateFieldNames()
                    }
                }
                return that.series
            },
            _populateAxes: function() {
                var that = this,
                    valueAxes = [],
                    argumentAxes,
                    panes = that.panes,
                    themeManager = that.themeManager,
                    rotated = themeManager.getOptions("rotated"),
                    valueAxisOptions = that.option("valueAxis") || {},
                    argumentOption = that.option("argumentAxis") || {},
                    crosshairOptions = that.option("crosshair") || {},
                    argumentAxesOptions = prepareAxis(argumentOption)[0],
                    valueAxesOptions = prepareAxis(valueAxisOptions),
                    axisNames = [],
                    valueAxesCounter = 0,
                    paneWithNonVirtualAxis;
                function getNextAxisName() {
                    return DEFAULT_AXIS_NAME + valueAxesCounter++
                }
                that._disposeAxes();
                if (rotated)
                    paneWithNonVirtualAxis = argumentAxesOptions.position === "right" ? panes[panes.length - 1].name : panes[0].name;
                else
                    paneWithNonVirtualAxis = argumentAxesOptions.position === "top" ? panes[0].name : panes[panes.length - 1].name;
                argumentAxes = _map(panes, function(pane) {
                    return that._createAxis("argumentAxis", argumentAxesOptions, {
                            virtual: pane.name != paneWithNonVirtualAxis,
                            pane: pane.name,
                            crosshairEnabled: crosshairOptions.enabled
                        }, rotated)
                });
                _each(valueAxesOptions, function(priority, axisOptions) {
                    var axisPanes = [],
                        name = axisOptions.name;
                    if (name && $.inArray(name, axisNames) != -1) {
                        that._incidentOccured("E2102");
                        return
                    }
                    name && axisNames.push(name);
                    if (axisOptions.pane)
                        axisPanes.push(axisOptions.pane);
                    if (axisOptions.panes && axisOptions.panes.length)
                        axisPanes = axisPanes.concat(axisOptions.panes.slice(0));
                    axisPanes = unique(axisPanes);
                    if (!axisPanes.length)
                        axisPanes.push(undefined);
                    _each(axisPanes, function(_, pane) {
                        valueAxes.push(that._createAxis("valueAxis", axisOptions, {
                            name: name || getNextAxisName(),
                            pane: pane,
                            priority: priority,
                            crosshairEnabled: crosshairOptions.enabled
                        }, rotated))
                    })
                });
                that._valueAxes = valueAxes;
                that._argumentAxes = argumentAxes
            },
            _prepareStackPoints: function(singleSeries, stackPoints, isSharedTooltip) {
                var points = singleSeries.getPoints(),
                    stackName = singleSeries.getStackName();
                _each(points, function(index, point) {
                    var argument = point.argument;
                    if (!stackPoints[argument]) {
                        stackPoints[argument] = {};
                        stackPoints[argument][null] = []
                    }
                    if (stackName && !_isArray(stackPoints[argument][stackName])) {
                        stackPoints[argument][stackName] = [];
                        _each(stackPoints[argument][null], function(_, point) {
                            if (!point.stackName)
                                stackPoints[argument][stackName].push(point)
                        })
                    }
                    if (stackName) {
                        stackPoints[argument][stackName].push(point);
                        stackPoints[argument][null].push(point)
                    }
                    else
                        _each(stackPoints[argument], function(_, stack) {
                            stack.push(point)
                        });
                    if (isSharedTooltip) {
                        point.stackPoints = stackPoints[argument][stackName];
                        point.stackName = stackName
                    }
                })
            },
            _disposeAxes: function() {
                var disposeObjectsInArray = this._disposeObjectsInArray;
                disposeObjectsInArray.call(this, "_argumentAxes");
                disposeObjectsInArray.call(this, "_valueAxes")
            },
            _drawAxes: function(panesBorderOptions, drawOptions, adjustUnits) {
                var that = this;
                function drawAxes(axes) {
                    _each(axes, function(_, axis) {
                        axis.draw({borderOptions: panesBorderOptions[axis.pane]}, adjustUnits)
                    })
                }
                that._reinitTranslators();
                that._prepareAxesAndDraw(drawAxes, drawOptions)
            },
            _appendAdditionalSeriesGroups: function() {
                var that = this,
                    rendererRoot = that.renderer.root;
                that._crosshairCursorGroup.append(rendererRoot);
                that._legendGroup.append(rendererRoot);
                that._scrollBar && that._scrollBarGroup.append(rendererRoot)
            },
            _getLegendData: function() {
                return _map(this.series, function(seriesItem) {
                        if (seriesItem.getOptions().showInLegend)
                            return {
                                    text: seriesItem.name,
                                    id: seriesItem.index,
                                    states: seriesItem.getLegendStyles()
                                }
                    })
            },
            _seriesPopulatedHandlerCore: function() {
                this._processSeriesFamilies();
                this._processValueAxisFormat()
            },
            _renderTrackers: function(legendHasInsidePosition) {
                var that = this,
                    i,
                    rendererRoot = that.renderer.root;
                for (i = 0; i < that.series.length; i++)
                    that.series[i].drawTrackers();
                if (that.legend) {
                    legendHasInsidePosition && that._legendGroup.append(rendererRoot);
                    legendHasInsidePosition && that._tooltipGroup.append(rendererRoot)
                }
            },
            _seriesVisibilityChanged: function() {
                this._processSeriesFamilies();
                this._populateBusinessRange();
                this.renderer.stopAllAnimations(true);
                this._render({
                    force: true,
                    asyncSeriesRendering: false,
                    asyncTrackersRendering: false
                })
            },
            _processSeriesFamilies: function() {
                var that = this,
                    types = [],
                    families = [],
                    paneSeries,
                    themeManager = that.themeManager;
                if (that.seriesFamilies && that.seriesFamilies.length) {
                    _each(that.seriesFamilies, function(_, family) {
                        family.adjustSeriesValues()
                    });
                    return
                }
                _each(that.series, function(_, item) {
                    if ($.inArray(item.type, types) === -1)
                        types.push(item.type)
                });
                _each(that._getLayoutTargets(), function(_, pane) {
                    paneSeries = that._getSeriesForPane(pane.name);
                    _each(types, function(_, type) {
                        var family = core.CoreFactory.createSeriesFamily({
                                type: type,
                                pane: pane.name,
                                equalBarWidth: themeManager.getOptions("equalBarWidth"),
                                minBubbleSize: themeManager.getOptions("minBubbleSize"),
                                maxBubbleSize: themeManager.getOptions("maxBubbleSize")
                            });
                        family.add(paneSeries);
                        family.adjustSeriesValues();
                        families.push(family)
                    })
                });
                that.seriesFamilies = families
            },
            _appendAxesGroups: function() {
                var that = this,
                    rendererRoot = that.renderer.root;
                that._stripsGroup.append(rendererRoot);
                that._axesGroup.append(rendererRoot);
                that._constantLinesGroup.append(rendererRoot);
                that._labelAxesGroup.append(rendererRoot)
            },
            _updateAxesLayout: function(drawOptions, panesBorderOptions, rotated) {
                this.layoutManager.updatePanesCanvases(this._getLayoutTargets(), this.canvas, rotated);
                this._drawAxes(panesBorderOptions, drawOptions, true)
            },
            _populateBusinessRange: function(visibleArea) {
                var that = this,
                    businessRanges = [],
                    themeManager = that.themeManager,
                    rotated = themeManager.getOptions("rotated"),
                    useAggregation = themeManager.getOptions('useAggregation'),
                    argAxes = that._argumentAxes,
                    lastArgAxis = argAxes[argAxes.length - 1],
                    calcInterval = lastArgAxis.calcInterval,
                    argRange = new core.Range({rotated: !!rotated}),
                    argBusinessRange;
                that._disposeObjectsInArray("businessRanges", ["arg", "val"]);
                _each(that._groupedSeries, function(_, group) {
                    var groupRange = new core.Range({
                            rotated: !!rotated,
                            isValueRange: true,
                            pane: group.valueAxis.pane,
                            axis: group.valueAxis.name
                        }),
                        groupAxisRange = group.valueAxis.getRangeData();
                    groupRange.addRange(groupAxisRange);
                    _each(group, function(_, series) {
                        visibleArea && prepareVisibleArea(visibleArea, groupAxisRange, useAggregation, series._originalBusinessRange);
                        var seriesRange = series.getRangeData(visibleArea, calcInterval);
                        groupRange.addRange(seriesRange.val);
                        argRange.addRange(seriesRange.arg)
                    });
                    if (!groupRange.isDefined())
                        groupRange.setStubData(group.valueAxis.getOptions().valueType === 'datetime' ? 'datetime' : undefined);
                    if (group.valueAxis.getOptions().showZero)
                        groupRange.correctValueZeroLevel();
                    groupRange.checkZeroStick();
                    businessRanges.push({
                        val: groupRange,
                        arg: argRange
                    })
                });
                _each(argAxes, function(_, axis) {
                    argRange.addRange(axis.getRangeData(argRange.min))
                });
                if (!argRange.isDefined())
                    argRange.setStubData(argAxes[0].getOptions().argumentType);
                if (visibleArea && visibleArea.notApplyMargins && argRange.axisType !== "discrete") {
                    argBusinessRange = argAxes[0].getTranslator().getBusinessRange();
                    argRange.addRange({
                        min: argBusinessRange.min,
                        max: argBusinessRange.max,
                        stick: true
                    })
                }
                that._correctBusinessRange(argRange, lastArgAxis);
                that.businessRanges = businessRanges
            },
            _correctBusinessRange: function(range, lastArgAxis) {
                var setTicksAtUnitBeginning = lastArgAxis.getOptions().setTicksAtUnitBeginning,
                    tickIntervalRange = {},
                    tickInterval = lastArgAxis.getOptions().tickInterval,
                    originInterval = tickInterval;
                tickInterval = $.isNumeric(tickInterval) ? tickInterval : utils.convertDateTickIntervalToMilliseconds(tickInterval);
                if (tickInterval && _isDefined(range[MIN]) && _isDefined(range[MAX]) && tickInterval >= Math.abs(range[MAX] - range[MIN])) {
                    if (utils.isDate(range[MIN])) {
                        if (!$.isNumeric(originInterval)) {
                            tickIntervalRange[MIN] = utils.addInterval(range[MIN], originInterval, true);
                            tickIntervalRange[MAX] = utils.addInterval(range[MAX], originInterval, false)
                        }
                        else {
                            tickIntervalRange[MIN] = new Date(range[MIN].valueOf() - tickInterval);
                            tickIntervalRange[MAX] = new Date(range[MAX].valueOf() + tickInterval)
                        }
                        if (setTicksAtUnitBeginning) {
                            utils.correctDateWithUnitBeginning(tickIntervalRange[MAX], originInterval);
                            utils.correctDateWithUnitBeginning(tickIntervalRange[MIN], originInterval)
                        }
                    }
                    else {
                        tickIntervalRange[MIN] = range[MIN] - tickInterval;
                        tickIntervalRange[MAX] = range[MAX] + tickInterval
                    }
                    range.addRange(tickIntervalRange)
                }
            },
            _getArgumentAxes: function() {
                return this._argumentAxes
            },
            _getValueAxes: function() {
                return this._valueAxes
            },
            _processValueAxisFormat: function() {
                var that = this,
                    valueAxes = that._valueAxes,
                    axesWithFullStackedFormat = [];
                _each(that.series, function() {
                    if (this.isFullStackedSeries() && $.inArray(this.axis, axesWithFullStackedFormat) === -1)
                        axesWithFullStackedFormat.push(this.axis)
                });
                _each(valueAxes, function() {
                    if ($.inArray(this.name, axesWithFullStackedFormat) !== -1)
                        this.setPercentLabelFormat();
                    else
                        this.resetAutoLabelFormat()
                })
            },
            _createAxis: function(typeSelector, userOptions, axisOptions, rotated) {
                userOptions = this._prepareStripsAndConstantLines(typeSelector, userOptions, rotated);
                var optionsForAxis = this._prepareAxisOptions(typeSelector, userOptions, axisOptions, rotated);
                _extend(optionsForAxis, {
                    stripsGroup: this._stripsGroup,
                    labelAxesGroup: this._labelAxesGroup,
                    constantLinesGroup: this._constantLinesGroup,
                    axesContainerGroup: this._axesGroup
                });
                return charts.factory.createAxis(this.renderer, optionsForAxis)
            },
            _getTrackerSettings: function(canvases) {
                return _extend(this.callBase(canvases), {
                        argumentAxis: this._argumentAxes,
                        canvases: canvases
                    })
            },
            _prepareStripsAndConstantLines: function(typeSelector, userOptions, rotated) {
                userOptions = this.themeManager.getOptions(typeSelector, userOptions, rotated);
                if (userOptions.strips)
                    _each(userOptions.strips, function(i) {
                        userOptions.strips[i] = _extend(true, {}, userOptions.stripStyle, userOptions.strips[i])
                    });
                if (userOptions.constantLines)
                    _each(userOptions.constantLines, function(i, line) {
                        userOptions.constantLines[i] = _extend(true, {}, userOptions.constantLineStyle, line)
                    });
                return userOptions
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-charts, file chart.js */
    (function($, DX, undefined) {
        var viz = DX.viz,
            core = viz.core,
            charts = viz.charts,
            utils = DX.utils,
            MAX_ADJUSTMENT_ATTEMPTS = 5,
            DEFAULT_PANE_NAME = "default",
            ASYNC_SERIES_RENDERING_DELAY = 25,
            DEFAULT_PANES = [{
                    name: DEFAULT_PANE_NAME,
                    border: {}
                }],
            _map = $.map,
            _each = $.each,
            _extend = $.extend,
            _isArray = utils.isArray,
            _isDefined = utils.isDefined;
        function getFirstAxisNameForPane(axes, paneName) {
            var result;
            for (var i = 0; i < axes.length; i++)
                if (axes[i].pane === paneName) {
                    result = axes[i].name;
                    break
                }
            if (!result)
                result = axes[0].name;
            return result
        }
        function hideGridsOnNonFirstValueAxisForPane(valAxes, paneName, synchronizeMultiAxes) {
            var axesForPane = [],
                firstShownAxis;
            _each(valAxes, function(_, axis) {
                if (axis.pane === paneName)
                    axesForPane.push(axis)
            });
            if (axesForPane.length > 1 && synchronizeMultiAxes)
                _each(axesForPane, function(_, axis) {
                    var gridOpt = axis.getOptions().grid,
                        minorGridOpt = axis.getOptions().minorGrid;
                    if (firstShownAxis && gridOpt && gridOpt.visible) {
                        gridOpt.visible = false;
                        minorGridOpt && (minorGridOpt.visible = false)
                    }
                    else
                        firstShownAxis = firstShownAxis ? firstShownAxis : gridOpt && gridOpt.visible
                })
        }
        function getPaneForAxis(paneAxis, axisNameWithoutPane) {
            var result;
            _each(paneAxis, function(paneName, pane) {
                _each(pane, function(axisName) {
                    if (axisNameWithoutPane == axisName) {
                        result = paneName;
                        return false
                    }
                })
            });
            return result
        }
        function findAxisOptions(valueAxes, valueAxesOptions, axisName) {
            var result,
                axInd;
            for (axInd = 0; axInd < valueAxesOptions.length; axInd++)
                if (valueAxesOptions[axInd].name == axisName) {
                    result = valueAxesOptions[axInd];
                    result.priority = axInd;
                    break
                }
            if (!result)
                for (axInd = 0; axInd < valueAxes.length; axInd++)
                    if (valueAxes[axInd].name == axisName) {
                        result = valueAxes[axInd].getOptions();
                        result.priority = valueAxes[axInd].priority;
                        break
                    }
            return result
        }
        function findAxis(paneName, axisName, axes) {
            var axis,
                i;
            for (i = 0; i < axes.length; i++) {
                axis = axes[i];
                if (axis.name === axisName && axis.pane === paneName)
                    return axis
            }
        }
        function prepareSegmentRectPoints(left, top, width, height, borderOptions) {
            var maxSW = ~~((width < height ? width : height) / 2),
                sw = borderOptions.width || 0,
                newSW = sw < maxSW ? sw : maxSW;
            left = left + newSW / 2;
            top = top + newSW / 2;
            width = width - newSW;
            height = height - newSW;
            var right = left + width,
                bottom = top + height,
                points = [],
                segments = [],
                segmentSequence,
                visiblyOpt = 0,
                prevSegmentVisibility = 0;
            var allSegment = {
                    top: [[left, top], [right, top]],
                    right: [[right, top], [right, bottom]],
                    bottom: [[right, bottom], [left, bottom]],
                    left: [[left, bottom], [left, top]]
                };
            _each(allSegment, function(seg) {
                var visibility = !!borderOptions[seg];
                visiblyOpt = visiblyOpt * 2 + ~~visibility
            });
            switch (visiblyOpt) {
                case(13):
                case(9):
                    segmentSequence = ['left', 'top', 'right', 'bottom'];
                    break;
                case(11):
                    segmentSequence = ['bottom', 'left', 'top', 'right'];
                    break;
                default:
                    segmentSequence = ['top', 'right', 'bottom', 'left']
            }
            _each(segmentSequence, function(_, seg) {
                var segmentVisibility = !!borderOptions[seg];
                if (!prevSegmentVisibility && segments.length) {
                    points.push(segments);
                    segments = []
                }
                if (segmentVisibility)
                    _each(allSegment[seg].slice(prevSegmentVisibility), function(_, segment) {
                        segments = segments.concat(segment)
                    });
                prevSegmentVisibility = ~~segmentVisibility
            });
            segments.length && points.push(segments);
            points.length === 1 && (points = points[0]);
            return {
                    points: points,
                    pathType: visiblyOpt == 15 ? "area" : "line"
                }
        }
        function applyClipSettings(clipRects, settings) {
            _each(clipRects || [], function(_, c) {
                c && c.attr(settings)
            })
        }
        charts._test_prepareSegmentRectPoints = function() {
            var original = prepareSegmentRectPoints.original || prepareSegmentRectPoints;
            if (arguments[0])
                prepareSegmentRectPoints = arguments[0];
            prepareSegmentRectPoints.original = original;
            prepareSegmentRectPoints.restore = function() {
                prepareSegmentRectPoints = original
            };
            return prepareSegmentRectPoints
        };
        DX.registerComponent("dxChart", viz.charts, charts.AdvancedChart.inherit({
            _chartType: "chart",
            _setDefaultOptions: function() {
                this.callBase();
                this.option({defaultPane: DEFAULT_PANE_NAME})
            },
            _init: function() {
                this.__ASYNC_SERIES_RENDERING_DELAY = ASYNC_SERIES_RENDERING_DELAY;
                this.paneAxis = {};
                this._crosshair = {};
                this._panesClipRects = {};
                this.callBase()
            },
            _dispose: function() {
                var that = this,
                    disposeObjectsInArray = this._disposeObjectsInArray,
                    panesClipRects = that._panesClipRects;
                that.callBase();
                disposeObjectsInArray.call(panesClipRects, "fixed");
                disposeObjectsInArray.call(panesClipRects, "base");
                disposeObjectsInArray.call(panesClipRects, "wide");
                that._panesClipRects = null
            },
            _correctAxes: function() {
                this.series && this._correctValueAxes()
            },
            _processSingleSeries: $.noop,
            _groupSeries: function() {
                var that = this,
                    panes = that.panes,
                    valAxes = that._valueAxes,
                    paneList = _map(panes, function(pane) {
                        return pane.name
                    }),
                    series = that.series,
                    paneAxis = that.paneAxis,
                    synchronizeMultiAxes = that.themeManager.getOptions("synchronizeMultiAxes"),
                    groupedSeries = that._groupedSeries = [];
                _each(series, function(i, particularSeries) {
                    particularSeries.axis = particularSeries.axis || getFirstAxisNameForPane(valAxes, particularSeries.pane);
                    if (particularSeries.axis) {
                        paneAxis[particularSeries.pane] = paneAxis[particularSeries.pane] || {};
                        paneAxis[particularSeries.pane][particularSeries.axis] = true
                    }
                });
                _each(valAxes, function(_, axis) {
                    if (axis.name && axis.pane && $.inArray(axis.pane, paneList) != -1) {
                        paneAxis[axis.pane] = paneAxis[axis.pane] || {};
                        paneAxis[axis.pane][axis.name] = true
                    }
                });
                that._correctValueAxes();
                _each(paneAxis, function(paneName, pane) {
                    hideGridsOnNonFirstValueAxisForPane(valAxes, paneName, synchronizeMultiAxes);
                    _each(pane, function(axisName) {
                        var group = [];
                        _each(series, function(_, particularSeries) {
                            if (particularSeries.pane === paneName && particularSeries.axis === axisName)
                                group.push(particularSeries)
                        });
                        groupedSeries.push(group);
                        group.valueAxis = findAxis(paneName, axisName, valAxes)
                    })
                });
                groupedSeries.argumentAxes = that._argumentAxes
            },
            _cleanPanesClipRects: function(clipArrayName) {
                var that = this,
                    clipArray = that._panesClipRects[clipArrayName];
                _each(clipArray || [], function(_, clipRect) {
                    clipRect && clipRect.remove()
                });
                that._panesClipRects[clipArrayName] = []
            },
            _createPanes: function() {
                var that = this,
                    panes = that.option("panes"),
                    panesNameCounter = 0,
                    bottomPaneName;
                if (panes && _isArray(panes) && !panes.length || $.isEmptyObject(panes))
                    panes = DEFAULT_PANES;
                that._cleanPanesClipRects("fixed");
                that._cleanPanesClipRects("base");
                that._cleanPanesClipRects("wide");
                that.defaultPane = that.option("defaultPane");
                panes = _extend(true, [], _isArray(panes) ? panes : panes ? [panes] : []);
                _each(panes, function(_, pane) {
                    pane.name = !_isDefined(pane.name) ? DEFAULT_PANE_NAME + panesNameCounter++ : pane.name
                });
                if (!that._doesPaneExists(panes, that.defaultPane) && panes.length > 0) {
                    bottomPaneName = panes[panes.length - 1].name;
                    that._incidentOccured("W2101", [that.defaultPane, bottomPaneName]);
                    that.defaultPane = bottomPaneName
                }
                panes = that.themeManager.getOptions("rotated") ? panes.reverse() : panes;
                return panes
            },
            _doesPaneExists: function(panes, paneName) {
                var found = false;
                _each(panes, function(_, pane) {
                    if (pane.name === paneName) {
                        found = true;
                        return false
                    }
                });
                return found
            },
            _prepareAxisOptions: function(typeSelector, userOptions, axisOptions, rotated) {
                return _extend(true, {}, userOptions, axisOptions, {
                        isHorizontal: typeSelector === "argumentAxis" ? !rotated : rotated,
                        incidentOccured: this._incidentOccured,
                        drawingType: "normal"
                    })
            },
            _correctValueAxes: function() {
                var that = this,
                    rotated = that.themeManager.getOptions("rotated"),
                    valueAxisOptions = that.option("valueAxis") || {},
                    valueAxesOptions = _isArray(valueAxisOptions) ? valueAxisOptions : [valueAxisOptions],
                    valueAxes = that._valueAxes || [],
                    defaultAxisName = valueAxes[0].name,
                    paneAxis = that.paneAxis || {},
                    panes = that.panes,
                    i,
                    neededAxis = {};
                _each(valueAxes, function(_, axis) {
                    if (axis.pane)
                        return;
                    var pane = getPaneForAxis(that.paneAxis, axis.name);
                    if (!pane) {
                        pane = that.defaultPane;
                        paneAxis[pane] = paneAxis[pane] || {};
                        paneAxis[pane][axis.name] = true
                    }
                    axis.setPane(pane)
                });
                for (i = 0; i < panes.length; i++)
                    if (!paneAxis[panes[i].name]) {
                        paneAxis[panes[i].name] = {};
                        paneAxis[panes[i].name][defaultAxisName] = true
                    }
                _each(that.paneAxis, function(paneName, axisNames) {
                    _each(axisNames, function(axisName) {
                        neededAxis[axisName + "-" + paneName] = true;
                        if (!findAxis(paneName, axisName, valueAxes)) {
                            var axisOptions = findAxisOptions(valueAxes, valueAxesOptions, axisName);
                            if (!axisOptions) {
                                that._incidentOccured("W2102", [axisName]);
                                axisOptions = {
                                    name: axisName,
                                    priority: valueAxes.length
                                }
                            }
                            delete axisOptions.stripsGroup;
                            delete axisOptions.labelAxesGroup;
                            delete axisOptions.constantLinesGroup;
                            delete axisOptions.axesContainerGroup;
                            valueAxes.push(that._createAxis("valueAxis", axisOptions, {
                                pane: paneName,
                                name: axisName
                            }, rotated))
                        }
                    })
                });
                valueAxes = $.grep(valueAxes, function(elem) {
                    return !!neededAxis[elem.name + "-" + elem.pane]
                });
                valueAxes.sort(function(a, b) {
                    return a.priority - b.priority
                });
                that._valueAxes = valueAxes
            },
            _getSeriesForPane: function(paneName) {
                var paneSeries = [];
                _each(this.series, function(_, oneSeries) {
                    if (oneSeries.pane === paneName)
                        paneSeries.push(oneSeries)
                });
                return paneSeries
            },
            _createTranslator: function(range, canvas, options) {
                return core.CoreFactory.createTranslator2D(range, canvas, options)
            },
            _createPanesBorderOptions: function() {
                var commonBorderOptions = this.themeManager.getOptions("commonPaneSettings").border,
                    panesBorderOptions = {};
                _each(this.panes, function(_, pane) {
                    panesBorderOptions[pane.name] = _extend(true, {}, commonBorderOptions, pane.border)
                });
                return panesBorderOptions
            },
            _createScrollBar: function() {
                var that = this,
                    themeManager = that.themeManager,
                    scrollBarOptions = themeManager.getOptions("scrollBar") || {};
                if (scrollBarOptions.visible)
                    that._scrollBar = (that._scrollBar || charts.factory.createScrollBar(that.renderer, that._scrollBarGroup)).update({
                        rotated: that._isRotated(),
                        scrollBar: scrollBarOptions
                    });
                else {
                    that._scrollBarGroup.remove();
                    that._scrollBar && that._scrollBar.dispose();
                    that._scrollBar = null
                }
            },
            _prepareToRender: function(drawOptions) {
                var that = this,
                    rotated = that.themeManager.getOptions("rotated"),
                    panesBorderOptions = that._createPanesBorderOptions();
                that._createPanesBackground();
                that._appendAxesGroups();
                that._transformed && that._resetTransform();
                that._createTranslators(drawOptions);
                that._options.useAggregation && _each(that.series, function(_, series) {
                    series._originalBusinessRange = series._originalBusinessRange || series.getRangeData();
                    var tr = that._getTranslator(series.pane, series.axis),
                        translators = {};
                    translators[rotated ? "x" : "y"] = tr.val;
                    translators[rotated ? "y" : "x"] = tr.arg;
                    series.resamplePoints(translators, that._zoomMinArg, that._zoomMaxArg)
                });
                if (_isDefined(that._zoomMinArg) || _isDefined(that._zoomMaxArg))
                    that._populateBusinessRange({
                        adjustOnZoom: that.themeManager.getOptions("adjustOnZoom"),
                        minArg: that._zoomMinArg,
                        maxArg: that._zoomMaxArg,
                        notApplyMargins: that._notApplyMargins
                    });
                if (that._options.useAggregation || _isDefined(that._zoomMinArg) || _isDefined(that._zoomMaxArg))
                    that._updateTranslators();
                return panesBorderOptions
            },
            _isLegendInside: function() {
                return this.legend && this.legend.getPosition() === "inside"
            },
            _renderAxes: function(drawOptions, panesBorderOptions, rotated) {
                if (drawOptions && drawOptions.recreateCanvas)
                    this.layoutManager.updatePanesCanvases(this.panes, this.canvas, rotated);
                this._drawAxes(panesBorderOptions, drawOptions)
            },
            _isRotated: function() {
                return this.themeManager.getOptions("rotated")
            },
            _getLayoutTargets: function() {
                return this.panes
            },
            _applyClipRects: function(panesBorderOptions) {
                var that = this,
                    canvasClipRectID = that._getCanvasClipRectID(),
                    i;
                that._drawPanesBorders(panesBorderOptions);
                that._createClipRectsForPanes();
                for (i = 0; i < that._argumentAxes.length; i++)
                    that._argumentAxes[i].applyClipRects(that._getElementsClipRectID(that._argumentAxes[i].pane), canvasClipRectID);
                for (i = 0; i < that._valueAxes.length; i++)
                    that._valueAxes[i].applyClipRects(that._getElementsClipRectID(that._valueAxes[i].pane), canvasClipRectID);
                that._fillPanesBackground()
            },
            _getSeriesRenderTimeout: function(drawOptions) {
                return drawOptions.asyncSeriesRendering ? ASYNC_SERIES_RENDERING_DELAY : undefined
            },
            _updateLegendAndTooltip: function(drawOptions, legendHasInsidePosition) {
                var that = this,
                    panes = that.panes,
                    rendererRoot = that.renderer.root;
                if (drawOptions.drawLegend && that.legend && legendHasInsidePosition) {
                    var newCanvas = _extend({}, panes[0].canvas),
                        layoutManager = charts.factory.createChartLayoutManager();
                    newCanvas.right = panes[panes.length - 1].canvas.right;
                    newCanvas.bottom = panes[panes.length - 1].canvas.bottom;
                    that._legendGroup.append(rendererRoot);
                    that._tooltipGroup.append(rendererRoot);
                    layoutManager.drawElements([that.legend], newCanvas);
                    layoutManager.placeDrawnElements(newCanvas)
                }
            },
            _drawSeries: function(drawOptions, rotated) {
                var that = this,
                    hideLayoutLabels = that.layoutManager.needMoreSpaceForPanesCanvas(that.panes, rotated) && !that.themeManager.getOptions("adaptiveLayout").keepLabels;
                _each(that.seriesFamilies || [], function(_, seriesFamily) {
                    var translators = that._getTranslator(seriesFamily.pane) || {};
                    seriesFamily.updateSeriesValues(translators);
                    seriesFamily.adjustSeriesDimensions(translators)
                });
                that._createCrosshairCursor();
                _each(that.series, function(_, particularSeries) {
                    that._applyPaneClipRect(particularSeries);
                    particularSeries.setAdjustSeriesLabels(drawOptions.adjustSeriesLabels);
                    var tr = that._getTranslator(particularSeries.pane, particularSeries.axis),
                        translators = {};
                    translators[rotated ? "x" : "y"] = tr.val;
                    translators[rotated ? "y" : "x"] = tr.arg;
                    particularSeries.draw(translators, drawOptions.animate && particularSeries.getPoints().length <= drawOptions.animationPointsLimit && that.renderer.animationEnabled(), hideLayoutLabels, that.legend && that.legend.getActionCallback(particularSeries))
                })
            },
            _applyPaneClipRect: function(seriesOptions) {
                var that = this,
                    paneIndex = that._getPaneIndex(seriesOptions.pane),
                    panesClipRects = that._panesClipRects,
                    wideClipRect = panesClipRects.wide[paneIndex];
                seriesOptions.setClippingParams(panesClipRects.base[paneIndex].id, wideClipRect && wideClipRect.id, that._getPaneBorderVisibility(paneIndex))
            },
            _createTranslators: function(drawOptions) {
                var that = this,
                    rotated = that.themeManager.getOptions("rotated"),
                    translators;
                if (!drawOptions.recreateCanvas)
                    return;
                that.translators = translators = {};
                that.layoutManager.updatePanesCanvases(that.panes, that.canvas, rotated);
                _each(that.paneAxis, function(paneName, pane) {
                    translators[paneName] = translators[paneName] || {};
                    _each(pane, function(axisName) {
                        var translator = that._createTranslator(new core.Range(that._getBusinessRange(paneName, axisName).val), that._getCanvasForPane(paneName), rotated ? {direction: "horizontal"} : {});
                        translator.pane = paneName;
                        translator.axis = axisName;
                        translators[paneName][axisName] = {val: translator}
                    })
                });
                _each(that._argumentAxes, function(_, axis) {
                    var translator = that._createTranslator(new core.Range(that._getBusinessRange(axis.pane).arg), that._getCanvasForPane(axis.pane), !rotated ? {direction: "horizontal"} : {});
                    _each(translators[axis.pane], function(valAxis, paneAxisTran) {
                        paneAxisTran.arg = translator
                    })
                })
            },
            _updateTranslators: function() {
                var that = this;
                _each(that.translators, function(pane, axisTrans) {
                    _each(axisTrans, function(axis, translator) {
                        translator.arg.updateBusinessRange(new core.Range(that._getBusinessRange(pane).arg));
                        delete translator.arg._originalBusinessRange;
                        translator.val.updateBusinessRange(new core.Range(that._getBusinessRange(pane, axis).val));
                        delete translator.val._originalBusinessRange
                    })
                })
            },
            _getAxesForTransform: function(rotated) {
                return {
                        verticalAxes: !rotated ? this._getValueAxes() : this._getArgumentAxes(),
                        horizontalAxes: !rotated ? this._getArgumentAxes() : this._getValueAxes()
                    }
            },
            _reinitTranslators: function() {
                var that = this;
                _each(that._argumentAxes, function(_, axis) {
                    var translator = that._getTranslator(axis.pane);
                    if (translator) {
                        translator.arg.reinit();
                        axis.setRange(translator.arg.getBusinessRange());
                        axis.setTranslator(translator.arg, translator.val)
                    }
                });
                _each(that._valueAxes, function(_, axis) {
                    var translator = that._getTranslator(axis.pane, axis.name);
                    if (translator) {
                        translator.val.reinit();
                        axis.setRange(translator.val.getBusinessRange());
                        axis.setTranslator(translator.val, translator.arg)
                    }
                })
            },
            _prepareAxesAndDraw: function(drawAxes, drawOptions) {
                var that = this,
                    i = 0,
                    layoutManager = that.layoutManager,
                    rotated = that.themeManager.getOptions("rotated"),
                    translators = that.translators,
                    adjustmentCounter = 0,
                    synchronizeMultiAxes = that.themeManager.getOptions('synchronizeMultiAxes'),
                    layoutTargets = that._getLayoutTargets(),
                    hElements = rotated ? that._valueAxes : that._argumentAxes,
                    vElements = rotated ? that._argumentAxes : that._valueAxes;
                if (that._scrollBar) {
                    that._scrollBar.setPane(layoutTargets);
                    if (rotated)
                        vElements = [that._scrollBar].concat(vElements);
                    else
                        hElements = hElements.concat([that._scrollBar])
                }
                do {
                    for (i = 0; i < that._argumentAxes.length; i++)
                        that._argumentAxes[i].resetTicks();
                    for (i = 0; i < that._valueAxes.length; i++)
                        that._valueAxes[i].resetTicks();
                    if (synchronizeMultiAxes)
                        charts.multiAxesSynchronizer.synchronize(that._valueAxes);
                    drawAxes(rotated ? that._valueAxes : that._argumentAxes);
                    layoutManager.requireAxesRedraw = false;
                    if (drawOptions.adjustAxes) {
                        layoutManager.applyHorizontalAxesLayout(hElements, layoutTargets, rotated);
                        !layoutManager.stopDrawAxes && _each(translators, function(pane, axisTrans) {
                            _each(axisTrans, function(axis, translator) {
                                translator.arg.reinit();
                                translator.val.reinit()
                            })
                        })
                    }
                    drawAxes(rotated ? that._argumentAxes : that._valueAxes);
                    if (drawOptions.adjustAxes && !layoutManager.stopDrawAxes) {
                        layoutManager.applyVerticalAxesLayout(vElements, layoutTargets, rotated);
                        !layoutManager.stopDrawAxes && _each(translators, function(pane, axisTrans) {
                            _each(axisTrans, function(axis, translator) {
                                translator.arg.reinit();
                                translator.val.reinit()
                            })
                        })
                    }
                    adjustmentCounter = adjustmentCounter + 1
                } while (!layoutManager.stopDrawAxes && layoutManager.requireAxesRedraw && adjustmentCounter < MAX_ADJUSTMENT_ATTEMPTS);
                this._scrollBar && this._scrollBar.applyLayout();
                that.__axisAdjustmentsCount = adjustmentCounter
            },
            _createCrosshairCursor: function() {
                var that = this,
                    commonCanvas,
                    directionCrosshairLines = ["horizontal", "vertical"],
                    options = that.themeManager.getOptions("crosshair") || {},
                    rotated = that.themeManager.getOptions("rotated");
                function getAxes(direction) {
                    return direction === "horizontal" ? !rotated ? that._valueAxes : that._argumentAxes : !rotated ? that._argumentAxes : that._valueAxes
                }
                if (!options || !options.enabled)
                    return;
                commonCanvas = that._getCommonCanvas();
                _each(directionCrosshairLines, function(_, direction) {
                    that._crosshair[direction] = charts.factory.createCrosshair(that.renderer, options, direction === "horizontal", commonCanvas, getAxes(direction), that._crosshairCursorGroup);
                    that._crosshair[direction].render()
                })
            },
            _getCommonCanvas: function() {
                var i,
                    canvas,
                    commonCanvas,
                    panes = this.panes;
                for (i = 0; i < panes.length; i++) {
                    canvas = panes[i].canvas;
                    if (!commonCanvas)
                        commonCanvas = _extend({}, canvas);
                    else {
                        commonCanvas.right = canvas.right;
                        commonCanvas.bottom = canvas.bottom
                    }
                }
                return commonCanvas
            },
            _createPanesBackground: function() {
                var that = this,
                    defaultBackgroundColor = that.themeManager.getOptions("commonPaneSettings").backgroundColor,
                    backgroundColor,
                    renderer = that.renderer,
                    rect,
                    i,
                    rects = [];
                that._panesBackgroundGroup && that._panesBackgroundGroup.clear();
                for (i = 0; i < that.panes.length; i++) {
                    backgroundColor = that.panes[i].backgroundColor || defaultBackgroundColor;
                    if (!backgroundColor || backgroundColor === "none") {
                        rects.push(null);
                        continue
                    }
                    rect = renderer.rect(0, 0, 0, 0).attr({
                        fill: backgroundColor,
                        "stroke-width": 0
                    }).append(that._panesBackgroundGroup);
                    rects.push(rect)
                }
                that.panesBackground = rects;
                that._panesBackgroundGroup.append(renderer.root)
            },
            _fillPanesBackground: function() {
                var that = this,
                    bc;
                _each(that.panes, function(i, pane) {
                    bc = pane.borderCoords;
                    if (that.panesBackground[i] != null)
                        that.panesBackground[i].attr({
                            x: bc.left,
                            y: bc.top,
                            width: bc.width,
                            height: bc.height
                        })
                })
            },
            _calcPaneBorderCoords: function(pane) {
                var canvas = pane.canvas,
                    bc = pane.borderCoords = pane.borderCoords || {};
                bc.left = canvas.left;
                bc.top = canvas.top;
                bc.right = canvas.width - canvas.right;
                bc.bottom = canvas.height - canvas.bottom;
                bc.width = Math.max(bc.right - bc.left, 0);
                bc.height = Math.max(bc.bottom - bc.top, 0)
            },
            _drawPanesBorders: function(panesBorderOptions) {
                var that = this,
                    rotated = that.themeManager.getOptions("rotated");
                that._panesBorderGroup && that._panesBorderGroup.remove().clear();
                _each(that.panes, function(i, pane) {
                    var bc,
                        borderOptions = panesBorderOptions[pane.name],
                        segmentRectParams,
                        attr = {
                            fill: "none",
                            stroke: borderOptions.color,
                            "stroke-opacity": borderOptions.opacity,
                            "stroke-width": borderOptions.width,
                            dashStyle: borderOptions.dashStyle,
                            "stroke-linecap": "square"
                        };
                    that._calcPaneBorderCoords(pane, rotated);
                    if (!borderOptions.visible)
                        return;
                    bc = pane.borderCoords;
                    segmentRectParams = prepareSegmentRectPoints(bc.left, bc.top, bc.width, bc.height, borderOptions);
                    that.renderer.path(segmentRectParams.points, segmentRectParams.pathType).attr(attr).append(that._panesBorderGroup)
                });
                that._panesBorderGroup.append(that.renderer.root)
            },
            _createClipRect: function(clipArray, index, left, top, width, height) {
                var that = this,
                    clipRect = clipArray[index];
                if (!clipRect) {
                    clipRect = that.renderer.clipRect(left, top, width, height);
                    clipArray[index] = clipRect
                }
                else
                    clipRect.attr({
                        x: left,
                        y: top,
                        width: width,
                        height: height
                    })
            },
            _createClipRectsForPanes: function() {
                var that = this,
                    canvas = that.canvas;
                _each(that.panes, function(i, pane) {
                    var hasFinancialSeries = false,
                        bc = pane.borderCoords,
                        left = bc.left,
                        top = bc.top,
                        width = bc.width,
                        height = bc.height,
                        panesClipRects = that._panesClipRects;
                    that._createClipRect(panesClipRects.fixed, i, left, top, width, height);
                    that._createClipRect(panesClipRects.base, i, left, top, width, height);
                    _each(that.series, function(_, series) {
                        if (series.pane === pane.name && series.isFinancialSeries())
                            hasFinancialSeries = true
                    });
                    if (hasFinancialSeries) {
                        if (that.themeManager.getOptions("rotated")) {
                            top = 0;
                            height = canvas.height
                        }
                        else {
                            left = 0;
                            width = canvas.width
                        }
                        that._createClipRect(panesClipRects.wide, i, left, top, width, height)
                    }
                    else
                        panesClipRects.wide.push(null)
                })
            },
            _getPaneIndex: function(paneName) {
                var paneIndex;
                _each(this.panes, function(index, pane) {
                    if (pane.name === paneName) {
                        paneIndex = index;
                        return false
                    }
                });
                return paneIndex
            },
            _getPaneBorderVisibility: function(paneIndex) {
                var commonPaneBorderVisible = this.themeManager.getOptions("commonPaneSettings").border.visible,
                    pane = this.panes[paneIndex] || {},
                    paneBorder = pane.border || {};
                return "visible" in paneBorder ? paneBorder.visible : commonPaneBorderVisible
            },
            _getElementsClipRectID: function(paneName) {
                return this._panesClipRects.fixed[this._getPaneIndex(paneName)].id
            },
            _getTranslator: function(paneName, axisName) {
                var paneTrans = this.translators[paneName],
                    foundTranslator = null;
                if (!paneTrans)
                    return foundTranslator;
                foundTranslator = paneTrans[axisName];
                if (!foundTranslator)
                    _each(paneTrans, function(axis, trans) {
                        foundTranslator = trans;
                        return false
                    });
                return foundTranslator
            },
            _getCanvasForPane: function(paneName) {
                var panes = this.panes,
                    panesNumber = panes.length,
                    i;
                for (i = 0; i < panesNumber; i++)
                    if (panes[i].name === paneName)
                        return panes[i].canvas
            },
            _getBusinessRange: function(paneName, axisName) {
                var ranges = this.businessRanges || [],
                    rangesNumber = ranges.length,
                    foundRange,
                    i;
                for (i = 0; i < rangesNumber; i++)
                    if (ranges[i].val.pane === paneName && ranges[i].val.axis === axisName) {
                        foundRange = ranges[i];
                        break
                    }
                if (!foundRange)
                    for (i = 0; i < rangesNumber; i++)
                        if (ranges[i].val.pane === paneName) {
                            foundRange = ranges[i];
                            break
                        }
                return foundRange
            },
            _transformArgument: function(translate, scale) {
                var that = this,
                    rotated = that.themeManager.getOptions("rotated"),
                    settings,
                    clipSettings,
                    panesClipRects = that._panesClipRects;
                if (!that._transformed) {
                    that._transformed = true;
                    that._labelsGroup.remove();
                    _each(that.series || [], function(i, s) {
                        s.applyClip()
                    })
                }
                if (rotated) {
                    settings = {
                        translateY: translate,
                        scaleY: scale
                    };
                    clipSettings = {
                        translateY: -translate / scale,
                        scaleY: 1 / scale
                    }
                }
                else {
                    settings = {
                        translateX: translate,
                        scaleX: scale
                    };
                    clipSettings = {
                        translateX: -translate / scale,
                        scaleX: 1 / scale
                    }
                }
                applyClipSettings(panesClipRects.base, clipSettings);
                applyClipSettings(panesClipRects.wide, clipSettings);
                that._seriesGroup.attr(settings);
                that._scrollBar && that._scrollBar.transform(-translate, scale)
            },
            _resetTransform: function() {
                var that = this,
                    settings = {
                        translateX: 0,
                        translateY: 0,
                        scaleX: null,
                        scaleY: null
                    },
                    panesClipRects = that._panesClipRects;
                applyClipSettings(panesClipRects.base, settings);
                applyClipSettings(panesClipRects.wide, settings);
                that._seriesGroup.attr(settings);
                _each(that.series || [], function(i, s) {
                    s.resetClip()
                });
                that._transformed = false
            },
            _getTrackerSettings: function(canvases) {
                var that = this,
                    themeManager = that.themeManager;
                return _extend(this.callBase(canvases), {
                        chart: that,
                        zoomingMode: themeManager.getOptions("zoomingMode"),
                        scrollingMode: themeManager.getOptions("scrollingMode"),
                        rotated: that._isRotated()
                    })
            },
            _resolveLabelOverlappingStack: function() {
                var that = this,
                    stackPoints = {},
                    isRotated = that._isRotated();
                _each(this.series, function(_, particularSeries) {
                    that._prepareStackPoints(particularSeries, stackPoints)
                });
                _each(stackPoints, function(_, stacks) {
                    _each(stacks, function(_, points) {
                        that._resolveLabelOverlappingInOneDirection(points, that._getCommonCanvas(), isRotated)
                    })
                })
            },
            zoomArgument: function(min, max, gesturesUsed) {
                var that = this,
                    zoomArg;
                if (!_isDefined(min) && !_isDefined(max))
                    return;
                zoomArg = that._argumentAxes[0].adjustZoomValues(min, max, gesturesUsed);
                that._zoomMinArg = zoomArg.min;
                that._zoomMaxArg = zoomArg.max;
                that._notApplyMargins = gesturesUsed;
                that._render({
                    force: true,
                    drawTitle: false,
                    drawLegend: false,
                    adjustAxes: false,
                    animate: false,
                    adjustSeriesLabels: false,
                    asyncSeriesRendering: false,
                    updateTracker: false
                })
            }
        }))
    })(jQuery, DevExpress);
    /*! Module viz-charts, file pieChart.js */
    (function($, DX, undefined) {
        var viz = DX.viz,
            core = viz.core,
            charts = viz.charts,
            utils = DX.utils,
            _extend = $.extend,
            _map = $.map,
            _noop = $.noop;
        DX.registerComponent("dxPieChart", viz.charts, charts.BaseChart.inherit({
            _chartType: 'pie',
            _reinitAxes: _noop,
            _correctAxes: _noop,
            _layoutManagerOptions: function() {
                var diameter = this.themeManager.getOptions('diameter');
                if (utils.isNumber(diameter)) {
                    if (diameter > 1)
                        diameter = 1;
                    else if (diameter < 0)
                        diameter = 0
                }
                else
                    diameter = undefined;
                return _extend(true, {}, this.callBase(), {piePercentage: diameter})
            },
            _groupSeries: function() {
                this._groupedSeries = [this.series]
            },
            _populateBusinessRange: function() {
                var businessRanges = [],
                    series = this.series,
                    singleSeries = series[0],
                    range = new core.Range,
                    singleSeriesRange;
                this._disposeObjectsInArray("businessRanges");
                if (singleSeries) {
                    singleSeriesRange = singleSeries.getRangeData();
                    range.addRange(singleSeriesRange.val);
                    if (!range.isDefined())
                        range.setStubData();
                    businessRanges.push(range)
                }
                this.businessRanges = businessRanges
            },
            _seriesVisibilityChanged: function() {
                this.series[0].arrangePoints();
                this._populateBusinessRange();
                this._refresh()
            },
            _createTranslator: function(range) {
                return core.CoreFactory.createTranslator1D(range.min, range.max, 360, 0)
            },
            _populateSeries: function() {
                var that = this,
                    themeManager = that.themeManager,
                    hasSeriesTemplate = !!themeManager.getOptions("seriesTemplate"),
                    seriesOptions = hasSeriesTemplate ? that._templatedSeries : that.option("series"),
                    allSeriesOptions = $.isArray(seriesOptions) ? seriesOptions : seriesOptions ? [seriesOptions] : [],
                    data,
                    particularSeriesOptions,
                    particularSeries,
                    seriesTheme;
                that._disposeSeries();
                that.series = [];
                themeManager.resetPalette();
                if (allSeriesOptions.length) {
                    particularSeriesOptions = _extend(true, {}, allSeriesOptions[0]);
                    if (particularSeriesOptions.type && !utils.isString(particularSeriesOptions.type))
                        particularSeriesOptions.type = "";
                    data = particularSeriesOptions.data;
                    particularSeriesOptions.data = null;
                    particularSeriesOptions.incidentOccured = that._incidentOccured;
                    seriesTheme = themeManager.getOptions("series", particularSeriesOptions, true);
                    seriesTheme.visibilityChanged = $.proxy(that._seriesVisibilityChanged, that);
                    seriesTheme.customizePoint = themeManager.getOptions("customizePoint");
                    seriesTheme.customizeLabel = themeManager.getOptions("customizeLabel");
                    particularSeries = core.CoreFactory.createSeries({
                        renderer: that.renderer,
                        seriesGroup: that._seriesGroup,
                        labelsGroup: that._labelsGroup
                    }, seriesTheme);
                    if (!particularSeries.isUpdated)
                        that._incidentOccured("E2101", [seriesTheme.type]);
                    else {
                        that._processSingleSeries(particularSeries);
                        that.series.push(particularSeries)
                    }
                    particularSeriesOptions.data = data
                }
                return that.series
            },
            _processSingleSeries: function(singleSeries) {
                singleSeries.arrangePoints()
            },
            _seriesPopulatedHandlerCore: _noop,
            _getLegendData: function() {
                return _map(this.series[0] ? this.series[0].getPoints() : [], function(item) {
                        return {
                                text: item.argument,
                                id: item.index,
                                states: item.getLegendStyles()
                            }
                    })
            },
            _prepareToRender: _noop,
            _isLegendInside: _noop,
            _renderAxes: _noop,
            _isRotated: _noop,
            _getLayoutTargets: function() {
                return [this]
            },
            _getAxesForTransform: function() {
                return {
                        verticalAxes: [],
                        horizontalAxes: []
                    }
            },
            _updateAxesLayout: _noop,
            _applyClipRects: _noop,
            _appendAdditionalSeriesGroups: _noop,
            _getSeriesRenderTimeout: _noop,
            _drawSeries: function(drawOptions) {
                var that = this,
                    singleSeries = that.series && that.series[0],
                    hideLayoutLabels;
                if (singleSeries) {
                    hideLayoutLabels = that.layoutManager.needMoreSpaceForPanesCanvas([that]) && !that.themeManager.getOptions("adaptiveLayout").keepLabels;
                    that.layoutManager.applyPieChartSeriesLayout(that.canvas, singleSeries, true);
                    singleSeries.canvas = that.canvas;
                    singleSeries.resetLabelSetups();
                    if (singleSeries.drawLabelsWOPoints(that._createTranslator(that.businessRanges[0], that.canvas)))
                        that.layoutManager.applyPieChartSeriesLayout(that.canvas, singleSeries, hideLayoutLabels);
                    singleSeries.draw(that._createTranslator(that.businessRanges[0], that.canvas), drawOptions.animate && that.renderer.animationEnabled(), hideLayoutLabels)
                }
            },
            _updateLegendAndTooltip: _noop,
            _renderTrackers: _noop,
            _createScrollBar: _noop,
            _resolveLabelOverlappingShift: function() {
                var points = _map(this.getSeries().getVisiblePoints(), function(point) {
                        var angleOfPoint = utils.normalizeAngle(point.middleAngle);
                        if (angleOfPoint < 90 || angleOfPoint >= 270)
                            return point
                    });
                this._resolveLabelOverlappingInOneDirection(points, this.canvas);
                points = _map(this.getSeries().getVisiblePoints(), function(point) {
                    var angleOfPoint = utils.normalizeAngle(point.middleAngle);
                    if (angleOfPoint >= 90 && angleOfPoint < 270)
                        return point
                });
                this._resolveLabelOverlappingInOneDirection(points, this.canvas);
                $.each(this.getSeries().getVisiblePoints(), function(_, point) {
                    point.setLabelEllipsis();
                    point.updateLabelCoord()
                })
            },
            getSeries: function getSeries() {
                return this.series && this.series[0]
            }
        }))
    })(jQuery, DevExpress);
    /*! Module viz-charts, file polarChart.js */
    (function($, DX, undefined) {
        var charts = DX.viz.charts,
            core = DX.viz.core,
            DEFAULT_PANE_NAME = 'default';
        var PolarChart = charts.AdvancedChart.inherit({
                _chartType: 'polar',
                _populateSeries: function() {
                    this.defaultPane = DEFAULT_PANE_NAME;
                    return this.callBase(arguments)
                },
                _createPanes: function() {
                    return [{name: DEFAULT_PANE_NAME}]
                },
                _prepareAxisOptions: function(typeSelector, axisOptions) {
                    return this.themeManager.getOptions(typeSelector, $.extend(true, axisOptions, {
                            drawingType: this._getTypeOfAxis(typeSelector),
                            incidentOccured: this._incidentOccured
                        }))
                },
                _getTypeOfAxis: function(type) {
                    type = type === "argumentAxis" ? "circular" : "linear";
                    if (this.option("useSpiderWeb"))
                        type += "Spider";
                    return type
                },
                _correctAxes: $.noop,
                _groupSeries: function() {
                    this._groupedSeries = [this.series];
                    this._groupedSeries[0].valueAxis = this._valueAxes[0];
                    this._groupedSeries.argumentAxes = this._argumentAxes
                },
                _processSingleSeries: $.noop,
                _prepareToRender: function() {
                    this._appendAxesGroups();
                    return {}
                },
                _isLegendInside: $.noop,
                _renderAxes: function(drawOptions) {
                    this._drawAxes({}, drawOptions)
                },
                _reinitTranslators: function() {
                    var that = this,
                        valueAxes = that._valueAxes,
                        argumentAxes = that._argumentAxes,
                        argumentBR = new core.Range(that.businessRanges[0].arg),
                        valueBR = new core.Range(that.businessRanges[0].val),
                        translator = that._createTranslator({
                            arg: argumentBR,
                            val: valueBR
                        });
                    that.translator = translator;
                    argumentAxes[0].setRange(argumentBR);
                    argumentAxes[0].setTranslator(translator);
                    for (var i = 0; i < valueAxes.length; i++) {
                        valueAxes[i].setRange(valueBR);
                        valueAxes[i].setTranslator(translator)
                    }
                },
                _prepareAxesAndDraw: function(drawAxes) {
                    var that = this,
                        valueAxes = that._valueAxes,
                        argAxes = that._argumentAxes,
                        argumentAxis = argAxes[0];
                    that._calcCanvas(argumentAxis.measureLabels());
                    that.translator.reinit();
                    argumentAxis.setTranslator(that.translator);
                    drawAxes(argAxes);
                    $.each(valueAxes, function(_, valAxis) {
                        valAxis.setSpiderTicks(argumentAxis.getSpiderTicks())
                    });
                    drawAxes(valueAxes)
                },
                _calcCanvas: function(measure) {
                    var canvas = this.translator.canvas;
                    canvas.left += measure.width;
                    canvas.right += measure.width;
                    canvas.top += measure.height;
                    canvas.bottom += measure.height
                },
                _isRotated: $.noop,
                _getLayoutTargets: function() {
                    return [this]
                },
                _getAxesForTransform: function() {
                    var argAxes = this._getArgumentAxes();
                    return {
                            verticalAxes: argAxes,
                            horizontalAxes: argAxes
                        }
                },
                _applyClipRects: $.noop,
                _getSeriesRenderTimeout: $.noop,
                _drawSeries: function(drawOptions) {
                    var that = this,
                        seriesFamilies = that.seriesFamilies || [],
                        series = that.series;
                    if (!series.length)
                        return;
                    for (var i = 0; i < seriesFamilies.length; i++) {
                        var translators = {};
                        translators.val = that.translator;
                        translators.arg = that.translator;
                        seriesFamilies[i].updateSeriesValues(translators);
                        seriesFamilies[i].adjustSeriesDimensions(translators)
                    }
                    for (var i = 0; i < series.length; i++)
                        series[i].draw(that.translator, drawOptions.animate && that.renderer.animationEnabled())
                },
                _updateLegendAndTooltip: $.noop,
                _createScrollBar: $.noop,
                _createTranslator: function(br) {
                    var themeManager = this.themeManager,
                        axisUserOptions = this.option("argumentAxis"),
                        axisOptions = themeManager.getOptions("argumentAxis", axisUserOptions) || {},
                        firstPointOnStartAngle = !this.option("useSpiderWeb") ? axisOptions.firstPointOnStartAngle : true;
                    return new core.PolarTranslator(br, $.extend(true, {}, this.canvas), {
                            startAngle: axisOptions.startAngle,
                            firstPointOnStartAngle: firstPointOnStartAngle
                        })
                },
                _getSeriesForPane: function() {
                    return this.series
                }
            });
        DX.registerComponent('dxPolarChart', charts, PolarChart)
    })(jQuery, DevExpress);
    /*! Module viz-charts, file layoutManager.js */
    (function($, DX, undefined) {
        var _isNumber = DX.utils.isNumber,
            _decreaseGaps = DX.viz.core.utils.decreaseGaps,
            _round = Math.round,
            _min = Math.min,
            _max = Math.max,
            _floor = Math.floor,
            _sqrt = Math.sqrt,
            _each = $.each,
            _extend = $.extend;
        function correctElementsPosition(elements, direction, canvas) {
            _each(elements, function(_, element) {
                var options = element.getLayoutOptions(),
                    side = options.cutLayoutSide;
                canvas[side] -= options[direction]
            })
        }
        function placeElementAndCutCanvas(elements, canvas) {
            _each(elements, function(_, element) {
                var shiftX,
                    shiftY,
                    options = element.getLayoutOptions(),
                    length = getLength(options.cutLayoutSide);
                if (!options.width)
                    return;
                switch (options.horizontalAlignment) {
                    case"left":
                        shiftX = canvas.left;
                        break;
                    case"center":
                        shiftX = (canvas.width - canvas.left - canvas.right - options.width) / 2 + canvas.left;
                        break;
                    case"right":
                        shiftX = canvas.width - canvas.right - options.width;
                        break
                }
                switch (options.verticalAlignment) {
                    case"top":
                        shiftY = canvas.top;
                        break;
                    case"bottom":
                        shiftY = canvas.height - canvas.bottom - options.height;
                        break
                }
                element.shift(_round(shiftX), _round(shiftY));
                canvas[options.cutLayoutSide] += options[length];
                setCanvasValues(canvas)
            })
        }
        function getLength(side) {
            return side === 'left' || side === 'right' ? 'width' : 'height'
        }
        function setCanvasValues(canvas) {
            if (canvas) {
                canvas.originalTop = canvas.top;
                canvas.originalBottom = canvas.bottom;
                canvas.originalLeft = canvas.left;
                canvas.originalRight = canvas.right
            }
        }
        function updateElements(elements, length, otherLength, dirtyCanvas, canvas, needRemoveSpace) {
            _each(elements, function(_, element) {
                var options = element.getLayoutOptions(),
                    side = options.cutLayoutSide,
                    freeSpaceWidth = dirtyCanvas.width - dirtyCanvas.left - dirtyCanvas.right,
                    freeSpaceHeight = dirtyCanvas.height - dirtyCanvas.top - dirtyCanvas.bottom,
                    updateObject = {};
                element.setSize({
                    width: freeSpaceWidth,
                    height: freeSpaceHeight
                });
                updateObject[otherLength] = 0;
                updateObject[length] = needRemoveSpace[length];
                element.changeSize(updateObject);
                canvas[side] -= options[length] - element.getLayoutOptions()[length];
                needRemoveSpace[length] -= options[length] - element.getLayoutOptions()[length]
            })
        }
        function updateAxis(axes, side, needRemoveSpace) {
            if (axes && needRemoveSpace[side] > 0) {
                _each(axes, function(i, axis) {
                    var bbox = axis.getBoundingRect();
                    axis.updateSize();
                    needRemoveSpace[side] -= bbox[side] - axis.getBoundingRect()[side]
                });
                if (needRemoveSpace[side] > 0)
                    _each(axes, function(_, axis) {
                        axis.updateSize(true)
                    })
            }
        }
        function getNearestCoord(firstCoord, secondCoord, pointCenterCoord) {
            var nearestCoord;
            if (pointCenterCoord < firstCoord)
                nearestCoord = firstCoord;
            else if (secondCoord < pointCenterCoord)
                nearestCoord = secondCoord;
            else
                nearestCoord = pointCenterCoord;
            return nearestCoord
        }
        function getLengthFromCenter(x, y, paneCenterX, paneCenterY) {
            return _sqrt((x - paneCenterX) * (x - paneCenterX) + (y - paneCenterY) * (y - paneCenterY))
        }
        function getInnerRadius(series) {
            var innerRadius;
            if (series.type === "pie")
                innerRadius = 0;
            else {
                innerRadius = _isNumber(series.innerRadius) ? Number(series.innerRadius) : 0.5;
                innerRadius = innerRadius < 0.2 ? 0.2 : innerRadius;
                innerRadius = innerRadius > 0.8 ? 0.8 : innerRadius
            }
            return innerRadius
        }
        function isValidBox(box) {
            return !!(box.x || box.y || box.width || box.height)
        }
        function correctDeltaMarginValue(panes, marginSides) {
            var canvasCell,
                canvas,
                deltaSide,
                requireAxesRedraw;
            _each(panes, function(_, pane) {
                canvas = pane.canvas;
                _each(marginSides, function(_, side) {
                    deltaSide = "delta" + side;
                    canvas[deltaSide] = _max(canvas[deltaSide] - (canvas[side.toLowerCase()] - canvas["original" + side]), 0);
                    if (canvas[deltaSide] > 0)
                        requireAxesRedraw = true
                })
            });
            return requireAxesRedraw
        }
        function getPane(name, panes) {
            var findPane = panes[0];
            _each(panes, function(_, pane) {
                if (name === pane.name)
                    findPane = pane
            });
            return findPane
        }
        function applyFoundExceedings(panes, rotated) {
            var stopDrawAxes,
                maxLeft = 0,
                maxRight = 0,
                maxTop = 0,
                maxBottom = 0,
                maxColNumber = 0;
            _each(panes, function(_, pane) {
                maxLeft = _max(maxLeft, pane.canvas.deltaLeft);
                maxRight = _max(maxRight, pane.canvas.deltaRight);
                maxTop = _max(maxTop, pane.canvas.deltaTop);
                maxBottom = _max(maxBottom, pane.canvas.deltaBottom)
            });
            if (rotated)
                _each(panes, function(_, pane) {
                    pane.canvas.top += maxTop;
                    pane.canvas.bottom += maxBottom;
                    pane.canvas.right += pane.canvas.deltaRight;
                    pane.canvas.left += pane.canvas.deltaLeft
                });
            else
                _each(panes, function(_, pane) {
                    pane.canvas.top += pane.canvas.deltaTop;
                    pane.canvas.bottom += pane.canvas.deltaBottom;
                    pane.canvas.right += maxRight;
                    pane.canvas.left += maxLeft
                });
            _each(panes, function(_, pane) {
                if (pane.canvas.top + pane.canvas.bottom > pane.canvas.height)
                    stopDrawAxes = true;
                if (pane.canvas.left + pane.canvas.right > pane.canvas.width)
                    stopDrawAxes = true
            });
            return stopDrawAxes
        }
        function LayoutManager(options) {
            this._verticalElements = [];
            this._horizontalElements = [];
            this._options = options
        }
        LayoutManager.prototype = {
            constructor: LayoutManager,
            dispose: function() {
                this._verticalElements = this._horizontalElements = this._options = null
            },
            drawElements: function(elements, canvas) {
                var horizontalElements = [],
                    verticalElements = [];
                _each(elements, function(_, element) {
                    var options,
                        length;
                    element.setSize({
                        width: canvas.width - canvas.left - canvas.right,
                        height: canvas.height - canvas.top - canvas.bottom
                    });
                    element.draw();
                    options = element.getLayoutOptions();
                    if (options) {
                        length = getLength(options.cutLayoutSide);
                        (length === 'width' ? horizontalElements : verticalElements).push(element);
                        canvas[options.cutLayoutSide] += options[length];
                        setCanvasValues(canvas)
                    }
                });
                this._horizontalElements = horizontalElements;
                this._verticalElements = verticalElements;
                return this
            },
            placeDrawnElements: function(canvas) {
                correctElementsPosition(this._horizontalElements, 'width', canvas);
                placeElementAndCutCanvas(this._horizontalElements, canvas);
                correctElementsPosition(this._verticalElements, 'height', canvas);
                placeElementAndCutCanvas(this._verticalElements, canvas);
                return this
            },
            updatePanesCanvases: function(panes, canvas, rotated) {
                var weightSum = 0;
                _each(panes, function(_, pane) {
                    pane.weight = pane.weight || 1;
                    weightSum += pane.weight
                });
                var distributedSpace = 0,
                    padding = panes.padding || 10,
                    paneSpace = rotated ? canvas.width - canvas.left - canvas.right : canvas.height - canvas.top - canvas.bottom,
                    oneWeight = (paneSpace - padding * (panes.length - 1)) / weightSum,
                    startName = rotated ? "left" : "top",
                    endName = rotated ? "right" : "bottom";
                _each(panes, function(_, pane) {
                    var calcLength = _round(pane.weight * oneWeight);
                    pane.canvas = pane.canvas || {};
                    _extend(pane.canvas, {
                        deltaLeft: 0,
                        deltaRight: 0,
                        deltaTop: 0,
                        deltaBottom: 0
                    }, canvas);
                    pane.canvas[startName] = canvas[startName] + distributedSpace;
                    pane.canvas[endName] = canvas[endName] + (paneSpace - calcLength - distributedSpace);
                    distributedSpace = distributedSpace + calcLength + padding;
                    setCanvasValues(pane.canvas)
                })
            },
            applyVerticalAxesLayout: function(axes, panes, rotated) {
                this._applyAxesLayout(axes, panes, rotated)
            },
            applyHorizontalAxesLayout: function(axes, panes, rotated) {
                axes.reverse();
                this._applyAxesLayout(axes, panes, rotated);
                axes.reverse()
            },
            _applyAxesLayout: function(axes, panes, rotated) {
                var that = this,
                    canvas,
                    axisPanePosition,
                    axisPosition,
                    canvasCell,
                    box,
                    delta,
                    axis,
                    axisLength,
                    direction,
                    directionMultiplier,
                    someDirection = [],
                    pane,
                    i;
                _each(panes, function(_, pane) {
                    _extend(pane.canvas, {
                        deltaLeft: 0,
                        deltaRight: 0,
                        deltaTop: 0,
                        deltaBottom: 0
                    })
                });
                for (i = 0; i < axes.length; i++) {
                    axis = axes[i];
                    axisPosition = axis.getOptions().position || "left";
                    axis.delta = {};
                    box = axis.getBoundingRect();
                    pane = getPane(axis.pane, panes);
                    canvas = pane.canvas;
                    if (!isValidBox(box))
                        continue;
                    direction = "delta" + axisPosition.slice(0, 1).toUpperCase() + axisPosition.slice(1);
                    switch (axisPosition) {
                        case"right":
                            directionMultiplier = 1;
                            canvas.deltaLeft += axis.padding ? axis.padding.left : 0;
                            break;
                        case"left":
                            directionMultiplier = -1;
                            canvas.deltaRight += axis.padding ? axis.padding.right : 0;
                            break;
                        case"top":
                            directionMultiplier = -1;
                            canvas.deltaBottom += axis.padding ? axis.padding.bottom : 0;
                            break;
                        case"bottom":
                            directionMultiplier = 1;
                            canvas.deltaTop += axis.padding ? axis.padding.top : 0;
                            break
                    }
                    switch (axisPosition) {
                        case"right":
                        case"left":
                            if (!box.isEmpty) {
                                delta = box.y + box.height - (canvas.height - canvas.originalBottom);
                                if (delta > 0) {
                                    that.requireAxesRedraw = true;
                                    canvas.deltaBottom += delta
                                }
                                delta = canvas.originalTop - box.y;
                                if (delta > 0) {
                                    that.requireAxesRedraw = true;
                                    canvas.deltaTop += delta
                                }
                            }
                            axisLength = box.width;
                            someDirection = ["Left", "Right"];
                            break;
                        case"top":
                        case"bottom":
                            if (!box.isEmpty) {
                                delta = box.x + box.width - (canvas.width - canvas.originalRight);
                                if (delta > 0) {
                                    that.requireAxesRedraw = true;
                                    canvas.deltaRight += delta
                                }
                                delta = canvas.originalLeft - box.x;
                                if (delta > 0) {
                                    that.requireAxesRedraw = true;
                                    canvas.deltaLeft += delta
                                }
                            }
                            someDirection = ["Bottom", "Top"];
                            axisLength = box.height;
                            break
                    }
                    if (!axis.delta[axisPosition] && canvas[direction] > 0)
                        canvas[direction] += axis.getMultipleAxesSpacing();
                    axis.delta[axisPosition] = axis.delta[axisPosition] || 0;
                    axis.delta[axisPosition] += canvas[direction] * directionMultiplier;
                    canvas[direction] += axisLength
                }
                that.requireAxesRedraw = correctDeltaMarginValue(panes, someDirection) || that.requireAxesRedraw;
                that.stopDrawAxes = applyFoundExceedings(panes, rotated)
            },
            applyPieChartSeriesLayout: function(canvas, singleSeries, hideLayoutLabels) {
                var paneSpaceHeight = canvas.height - canvas.top - canvas.bottom,
                    paneSpaceWidth = canvas.width - canvas.left - canvas.right,
                    paneCenterX = paneSpaceWidth / 2 + canvas.left,
                    paneCenterY = paneSpaceHeight / 2 + canvas.top,
                    piePercentage = this._options.piePercentage,
                    accessibleRadius = _isNumber(piePercentage) ? piePercentage * _min(canvas.height, canvas.width) / 2 : _min(paneSpaceWidth, paneSpaceHeight) / 2,
                    minR = 0.7 * accessibleRadius,
                    innerRadius = getInnerRadius(singleSeries);
                if (!hideLayoutLabels && !_isNumber(piePercentage))
                    _each(singleSeries.getPoints(), function(_, point) {
                        if (point._label.hasText() && point.isVisible()) {
                            var labelBBox = point._label.getBoundingRect(),
                                nearestX = getNearestCoord(labelBBox.x, labelBBox.x + labelBBox.width, paneCenterX),
                                nearestY = getNearestCoord(labelBBox.y, labelBBox.y + labelBBox.height, paneCenterY),
                                minRadiusWithLabels = _max(getLengthFromCenter(nearestX, nearestY, paneCenterX, paneCenterY) - DX.viz.core.series.helpers.consts.pieLabelIndent, minR);
                            accessibleRadius = _min(accessibleRadius, minRadiusWithLabels)
                        }
                    });
                singleSeries.correctPosition({
                    centerX: _floor(paneCenterX),
                    centerY: _floor(paneCenterY),
                    radiusInner: _floor(accessibleRadius * innerRadius),
                    radiusOuter: _floor(accessibleRadius)
                })
            },
            updateDrawnElements: function(axes, canvas, dirtyCanvas, panes, rotated) {
                var needRemoveSpace,
                    saveDirtyCanvas = _extend({}, dirtyCanvas);
                needRemoveSpace = this.needMoreSpaceForPanesCanvas(panes, rotated);
                if (!needRemoveSpace)
                    return;
                needRemoveSpace.height = _decreaseGaps(dirtyCanvas, ["top", "bottom"], needRemoveSpace.height);
                needRemoveSpace.width = _decreaseGaps(dirtyCanvas, ["left", "right"], needRemoveSpace.width);
                canvas.top -= saveDirtyCanvas.top - dirtyCanvas.top;
                canvas.bottom -= saveDirtyCanvas.bottom - dirtyCanvas.bottom;
                canvas.left -= saveDirtyCanvas.left - dirtyCanvas.left;
                canvas.right -= saveDirtyCanvas.right - dirtyCanvas.right;
                updateElements(this._horizontalElements, "width", "height", dirtyCanvas, canvas, needRemoveSpace);
                updateElements(this._verticalElements, "height", "width", dirtyCanvas, canvas, needRemoveSpace);
                updateAxis(axes.verticalAxes, "width", needRemoveSpace);
                updateAxis(axes.horizontalAxes, "height", needRemoveSpace)
            },
            needMoreSpaceForPanesCanvas: function(panes, rotated) {
                var options = this._options,
                    width = options.width,
                    height = options.height,
                    piePercentage = options.piePercentage,
                    percentageIsValid = _isNumber(piePercentage),
                    needHorizontalSpace = 0,
                    needVerticalSpace = 0;
                _each(panes, function(_, pane) {
                    var paneCanvas = pane.canvas,
                        minSize = percentageIsValid ? _min(paneCanvas.width, paneCanvas.height) * piePercentage : undefined,
                        needPaneHorizonralSpace = (percentageIsValid ? minSize : width) - (paneCanvas.width - paneCanvas.left - paneCanvas.right),
                        needPaneVerticalSpace = (percentageIsValid ? minSize : height) - (paneCanvas.height - paneCanvas.top - paneCanvas.bottom);
                    if (rotated) {
                        needHorizontalSpace += needPaneHorizonralSpace > 0 ? needPaneHorizonralSpace : 0;
                        needVerticalSpace = _max(needPaneVerticalSpace > 0 ? needPaneVerticalSpace : 0, needVerticalSpace)
                    }
                    else {
                        needHorizontalSpace = _max(needPaneHorizonralSpace > 0 ? needPaneHorizonralSpace : 0, needHorizontalSpace);
                        needVerticalSpace += needPaneVerticalSpace > 0 ? needPaneVerticalSpace : 0
                    }
                });
                return needHorizontalSpace > 0 || needVerticalSpace > 0 ? {
                        width: needHorizontalSpace,
                        height: needVerticalSpace
                    } : false
            },
            correctSizeElement: function(element, canvas) {
                element.setSize({
                    width: canvas.width - canvas.right - canvas.left,
                    height: canvas.width - canvas.right - canvas.left
                });
                element.changeSize({
                    width: 0,
                    height: 0
                })
            }
        };
        DX.viz.charts._setCanvasValues = setCanvasValues;
        DX.viz.charts.LayoutManager = LayoutManager
    })(jQuery, DevExpress);
    /*! Module viz-charts, file multiAxesSynchronizer.js */
    (function($, DX, undefined) {
        var Range = DX.viz.core.Range,
            utils = DX.utils,
            _adjustValue = utils.adjustValue,
            _applyPrecisionByMinDelta = utils.applyPrecisionByMinDelta,
            _isDefined = utils.isDefined,
            _math = Math,
            _floor = _math.floor,
            _max = _math.max,
            _each = $.each,
            MIN_RANGE_FOR_ADJUST_BOUNDS = 0.1;
        var getValueAxesPerPanes = function(valueAxes) {
                var result = {};
                _each(valueAxes, function(_, axis) {
                    var pane = axis.pane;
                    if (!result[pane])
                        result[pane] = [];
                    result[pane].push(axis)
                });
                return result
            };
        var restoreOriginalBusinessRange = function(axis) {
                var businessRange,
                    translator = axis.getTranslator();
                if (!translator._originalBusinessRange)
                    translator._originalBusinessRange = new Range(translator.getBusinessRange());
                else {
                    businessRange = new Range(translator._originalBusinessRange);
                    translator.updateBusinessRange(businessRange);
                    axis.setRange(businessRange)
                }
            };
        var linearConvertor = {
                transform: function(v, b) {
                    return utils.getLog(v, b)
                },
                addInterval: function(v, i) {
                    return v + i
                },
                getInterval: function(base, tickInterval) {
                    return tickInterval
                },
                adjustValue: _floor
            };
        var logConvertor = {
                transform: function(v, b) {
                    return utils.raiseTo(v, b)
                },
                addInterval: function(v, i) {
                    return v * i
                },
                getInterval: function(base, tickInterval) {
                    return _math.pow(base, tickInterval)
                },
                adjustValue: _adjustValue
            };
        var convertAxisInfo = function(axisInfo, convertor) {
                if (!axisInfo.isLogarithmic)
                    return;
                var base = axisInfo.logarithmicBase,
                    tickValues = axisInfo.tickValues,
                    tick,
                    ticks = [],
                    interval;
                axisInfo.minValue = convertor.transform(axisInfo.minValue, base);
                axisInfo.oldMinValue = convertor.transform(axisInfo.oldMinValue, base);
                axisInfo.maxValue = convertor.transform(axisInfo.maxValue, base);
                axisInfo.oldMaxValue = convertor.transform(axisInfo.oldMaxValue, base);
                axisInfo.tickInterval = _math.round(axisInfo.tickInterval);
                if (axisInfo.tickInterval < 1)
                    axisInfo.tickInterval = 1;
                interval = convertor.getInterval(base, axisInfo.tickInterval);
                for (tick = convertor.adjustValue(convertor.transform(tickValues[0], base)); ticks.length < tickValues.length; tick = convertor.addInterval(tick, interval))
                    ticks.push(tick);
                ticks.tickInterval = axisInfo.tickInterval;
                axisInfo.tickValues = ticks
            };
        var populateAxesInfo = function(axes) {
                return $.map(axes, function(axis) {
                        restoreOriginalBusinessRange(axis);
                        var ticksValues = axis.getTicksValues(),
                            majorTicks = ticksValues.majorTicksValues,
                            options = axis.getOptions(),
                            minValue,
                            maxValue,
                            axisInfo = null,
                            businessRange,
                            tickInterval,
                            synchronizedValue;
                        if (majorTicks && majorTicks.length > 0 && utils.isNumber(majorTicks[0]) && options.type !== "discrete") {
                            businessRange = axis.getTranslator().getBusinessRange();
                            tickInterval = axis._tickManager.getTickInterval();
                            minValue = businessRange.minVisible;
                            maxValue = businessRange.maxVisible;
                            synchronizedValue = options.synchronizedValue;
                            if (minValue === maxValue && _isDefined(synchronizedValue)) {
                                minValue = majorTicks[0] - 1;
                                maxValue = majorTicks[0] + 1;
                                tickInterval = 1
                            }
                            axisInfo = {
                                axis: axis,
                                isLogarithmic: options.type === "logarithmic",
                                logarithmicBase: businessRange.base,
                                tickValues: majorTicks,
                                minorValues: ticksValues.minorTicksValues,
                                minValue: minValue,
                                oldMinValue: minValue,
                                maxValue: maxValue,
                                oldMaxValue: maxValue,
                                inverted: businessRange.invert,
                                tickInterval: tickInterval,
                                synchronizedValue: synchronizedValue
                            };
                            if (businessRange.stubData) {
                                axisInfo.stubData = true;
                                axisInfo.tickInterval = axisInfo.tickInterval || options.tickInterval;
                                axisInfo.isLogarithmic = false
                            }
                            convertAxisInfo(axisInfo, linearConvertor);
                            DX.utils.debug.assert(axisInfo.tickInterval !== undefined && axisInfo.tickInterval !== null, "tickInterval was not provided")
                        }
                        return axisInfo
                    })
            };
        var updateTickValues = function(axesInfo) {
                var maxTicksCount = 0;
                _each(axesInfo, function(_, axisInfo) {
                    maxTicksCount = _max(maxTicksCount, axisInfo.tickValues.length)
                });
                _each(axesInfo, function(_, axisInfo) {
                    var ticksMultiplier,
                        ticksCount,
                        additionalStartTicksCount = 0,
                        synchronizedValue = axisInfo.synchronizedValue,
                        tickValues = axisInfo.tickValues,
                        tickInterval = axisInfo.tickInterval;
                    if (_isDefined(synchronizedValue)) {
                        axisInfo.baseTickValue = axisInfo.invertedBaseTickValue = synchronizedValue;
                        axisInfo.tickValues = [axisInfo.baseTickValue]
                    }
                    else {
                        if (tickValues.length > 1 && tickInterval) {
                            ticksMultiplier = _floor((maxTicksCount + 1) / tickValues.length);
                            ticksCount = ticksMultiplier > 1 ? _floor((maxTicksCount + 1) / ticksMultiplier) : maxTicksCount;
                            additionalStartTicksCount = _floor((ticksCount - tickValues.length) / 2);
                            while (additionalStartTicksCount > 0 && tickValues[0] !== 0) {
                                tickValues.unshift(_applyPrecisionByMinDelta(tickValues[0], tickInterval, tickValues[0] - tickInterval));
                                additionalStartTicksCount--
                            }
                            while (tickValues.length < ticksCount)
                                tickValues.push(_applyPrecisionByMinDelta(tickValues[0], tickInterval, tickValues[tickValues.length - 1] + tickInterval));
                            axisInfo.tickInterval = tickInterval / ticksMultiplier
                        }
                        axisInfo.baseTickValue = tickValues[0];
                        axisInfo.invertedBaseTickValue = tickValues[tickValues.length - 1]
                    }
                })
            };
        var getAxisRange = function(axisInfo) {
                return axisInfo.maxValue - axisInfo.minValue || 1
            };
        var getMainAxisInfo = function(axesInfo) {
                for (var i = 0; i < axesInfo.length; i++)
                    if (!axesInfo[i].stubData)
                        return axesInfo[i];
                return null
            };
        var correctMinMaxValues = function(axesInfo) {
                var mainAxisInfo = getMainAxisInfo(axesInfo),
                    mainAxisInfoTickInterval = mainAxisInfo.tickInterval;
                _each(axesInfo, function(_, axisInfo) {
                    var scale,
                        move,
                        mainAxisBaseValueOffset,
                        valueFromAxisInfo;
                    if (axisInfo !== mainAxisInfo) {
                        if (mainAxisInfoTickInterval && axisInfo.tickInterval) {
                            if (axisInfo.stubData && _isDefined(axisInfo.synchronizedValue)) {
                                axisInfo.oldMinValue = axisInfo.minValue = axisInfo.baseTickValue - (mainAxisInfo.baseTickValue - mainAxisInfo.minValue) / mainAxisInfoTickInterval * axisInfo.tickInterval;
                                axisInfo.oldMaxValue = axisInfo.maxValue = axisInfo.baseTickValue - (mainAxisInfo.baseTickValue - mainAxisInfo.maxValue) / mainAxisInfoTickInterval * axisInfo.tickInterval
                            }
                            scale = mainAxisInfoTickInterval / getAxisRange(mainAxisInfo) / axisInfo.tickInterval * getAxisRange(axisInfo);
                            axisInfo.maxValue = axisInfo.minValue + getAxisRange(axisInfo) / scale
                        }
                        if (mainAxisInfo.inverted && !axisInfo.inverted || !mainAxisInfo.inverted && axisInfo.inverted)
                            mainAxisBaseValueOffset = mainAxisInfo.maxValue - mainAxisInfo.invertedBaseTickValue;
                        else
                            mainAxisBaseValueOffset = mainAxisInfo.baseTickValue - mainAxisInfo.minValue;
                        valueFromAxisInfo = getAxisRange(axisInfo);
                        move = (mainAxisBaseValueOffset / getAxisRange(mainAxisInfo) - (axisInfo.baseTickValue - axisInfo.minValue) / valueFromAxisInfo) * valueFromAxisInfo;
                        axisInfo.minValue -= move;
                        axisInfo.maxValue -= move
                    }
                })
            };
        var calculatePaddings = function(axesInfo) {
                var minPadding,
                    maxPadding,
                    startPadding = 0,
                    endPadding = 0;
                _each(axesInfo, function(_, axisInfo) {
                    var inverted = axisInfo.inverted;
                    minPadding = axisInfo.minValue > axisInfo.oldMinValue ? (axisInfo.minValue - axisInfo.oldMinValue) / getAxisRange(axisInfo) : 0;
                    maxPadding = axisInfo.maxValue < axisInfo.oldMaxValue ? (axisInfo.oldMaxValue - axisInfo.maxValue) / getAxisRange(axisInfo) : 0;
                    startPadding = _max(startPadding, inverted ? maxPadding : minPadding);
                    endPadding = _max(endPadding, inverted ? minPadding : maxPadding)
                });
                return {
                        start: startPadding,
                        end: endPadding
                    }
            };
        var correctMinMaxValuesByPaddings = function(axesInfo, paddings) {
                _each(axesInfo, function(_, info) {
                    var range = getAxisRange(info),
                        inverted = info.inverted;
                    info.minValue -= paddings[inverted ? "end" : "start"] * range;
                    info.maxValue += paddings[inverted ? "start" : "end"] * range;
                    if (range > MIN_RANGE_FOR_ADJUST_BOUNDS) {
                        info.minValue = _math.min(info.minValue, _adjustValue(info.minValue));
                        info.maxValue = _max(info.maxValue, _adjustValue(info.maxValue))
                    }
                })
            };
        var updateTickValuesIfSyncronizedValueUsed = function(axesInfo) {
                var hasSyncronizedValue = false;
                _each(axesInfo, function(_, info) {
                    hasSyncronizedValue = hasSyncronizedValue || _isDefined(info.synchronizedValue)
                });
                _each(axesInfo, function(_, info) {
                    var lastTickValue,
                        tickInterval = info.tickInterval,
                        tickValues = info.tickValues,
                        maxValue = info.maxValue,
                        minValue = info.minValue;
                    if (hasSyncronizedValue && tickInterval) {
                        while (tickValues[0] - tickInterval >= minValue)
                            tickValues.unshift(_adjustValue(tickValues[0] - tickInterval));
                        lastTickValue = tickValues[tickValues.length - 1];
                        while ((lastTickValue = lastTickValue + tickInterval) <= maxValue)
                            tickValues.push(utils.isExponential(lastTickValue) ? _adjustValue(lastTickValue) : _applyPrecisionByMinDelta(minValue, tickInterval, lastTickValue))
                    }
                    while (tickValues[0] < minValue)
                        tickValues.shift();
                    while (tickValues[tickValues.length - 1] > maxValue)
                        tickValues.pop()
                })
            };
        var applyMinMaxValues = function(axesInfo) {
                _each(axesInfo, function(_, info) {
                    var axis = info.axis,
                        range = axis.getTranslator().getBusinessRange();
                    if (range.min === range.minVisible)
                        range.min = info.minValue;
                    if (range.max === range.maxVisible)
                        range.max = info.maxValue;
                    range.minVisible = info.minValue;
                    range.maxVisible = info.maxValue;
                    if (_isDefined(info.stubData))
                        range.stubData = info.stubData;
                    if (range.min > range.minVisible)
                        range.min = range.minVisible;
                    if (range.max < range.maxVisible)
                        range.max = range.maxVisible;
                    range.isSynchronized = true;
                    axis.getTranslator().updateBusinessRange(range);
                    axis.setRange(range);
                    axis.setTicks({
                        majorTicks: info.tickValues,
                        minorTicks: info.minorValues
                    })
                })
            };
        var correctAfterSynchronize = function(axesInfo) {
                var invalidAxisInfo = [],
                    correctValue,
                    validAxisInfo;
                _each(axesInfo, function(i, info) {
                    if (info.oldMaxValue - info.oldMinValue === 0)
                        invalidAxisInfo.push(info);
                    else if (!_isDefined(correctValue) && !_isDefined(info.synchronizedValue)) {
                        correctValue = _math.abs((info.maxValue - info.minValue) / (info.tickValues[_floor(info.tickValues.length / 2)] || info.maxValue));
                        validAxisInfo = info
                    }
                });
                if (!_isDefined(correctValue))
                    return;
                _each(invalidAxisInfo, function(i, info) {
                    var firstTick = info.tickValues[0],
                        correctedTick = firstTick * correctValue,
                        tickValues = validAxisInfo.tickValues,
                        centralTick = tickValues[_floor(tickValues.length / 2)];
                    if (firstTick > 0) {
                        info.maxValue = correctedTick;
                        info.minValue = 0
                    }
                    else if (firstTick < 0) {
                        info.minValue = correctedTick;
                        info.maxValue = 0
                    }
                    else if (firstTick === 0) {
                        info.maxValue = validAxisInfo.maxValue - centralTick;
                        info.minValue = validAxisInfo.minValue - centralTick
                    }
                })
            };
        DX.viz.charts.multiAxesSynchronizer = {synchronize: function(valueAxes) {
                _each(getValueAxesPerPanes(valueAxes), function(_, axes) {
                    var axesInfo,
                        paddings;
                    if (axes.length > 1) {
                        axesInfo = populateAxesInfo(axes);
                        if (axesInfo.length === 0 || !getMainAxisInfo(axesInfo))
                            return;
                        updateTickValues(axesInfo);
                        correctMinMaxValues(axesInfo);
                        paddings = calculatePaddings(axesInfo);
                        correctMinMaxValuesByPaddings(axesInfo, paddings);
                        correctAfterSynchronize(axesInfo);
                        updateTickValuesIfSyncronizedValueUsed(axesInfo);
                        _each(axesInfo, function() {
                            convertAxisInfo(this, logConvertor)
                        });
                        applyMinMaxValues(axesInfo)
                    }
                })
            }}
    })(jQuery, DevExpress);
    /*! Module viz-charts, file tracker.js */
    (function($, DX) {
        var charts = DX.viz.charts,
            eventsConsts = DX.viz.core.series.helpers.consts.events,
            utils = DX.utils,
            isFunction = utils.isFunction,
            isDefined = utils.isDefined,
            MULTIPLE_MODE = 'multiple',
            SINGLE_MODE = 'single',
            ALL_ARGUMENTS_POINTS_MODE = 'allargumentpoints',
            ALL_SERIES_POINTS_MODE = 'allseriespoints',
            NONE_MODE = 'none',
            POINTER_ACTION = "dxpointerdown dxpointermove";
        function processMode(mode) {
            return (mode + "").toLowerCase()
        }
        function getNonVirtualAxis(axisArray) {
            var axis;
            $.each(axisArray, function(_, a) {
                if (!a._virtual) {
                    axis = a;
                    return false
                }
            });
            return axis
        }
        var baseTrackerPrototype = {
                ctor: function(options) {
                    var that = this;
                    if (processMode(options.pointSelectionMode) === MULTIPLE_MODE) {
                        that._setSelectedPoint = that._selectPointMultipleMode;
                        that._releaseSelectedPoint = that._releaseSelectedPointMultipleMode
                    }
                    else {
                        that._setSelectedPoint = that._selectPointSingleMode;
                        that._releaseSelectedPoint = that._releaseSelectedPointSingleMode
                    }
                    if (processMode(options.seriesSelectionMode) === MULTIPLE_MODE) {
                        that._releaseSelectedSeries = that._releaseSelectedSeriesMultipleMode;
                        that._setSelectedSeries = that._setSelectedSeriesMultipleMode
                    }
                    else {
                        that._releaseSelectedSeries = that._releaseSelectedSeriesSingleMode;
                        that._setSelectedSeries = that._setSelectedSeriesSingleMode
                    }
                    that._renderer = options.renderer;
                    that._eventTrigger = options.eventTrigger;
                    $(options.seriesGroup.element).off().on(eventsConsts.selectSeries, {tracker: that}, that._selectSeries).on(eventsConsts.deselectSeries, {tracker: that}, that._deselectSeries).on(eventsConsts.selectPoint, {tracker: that}, that._selectPoint).on(eventsConsts.deselectPoint, {tracker: that}, that._deselectPoint).on(eventsConsts.showPointTooltip, {tracker: that}, that._showPointTooltip).on(eventsConsts.hidePointTooltip, {tracker: that}, that._hidePointTooltip)
                },
                update: function(options) {
                    var that = this;
                    if (that._storedSeries !== options.series) {
                        that._storedSeries = options.series || [];
                        that._clean()
                    }
                    else if (isDefined(that._storedSeries)) {
                        that._clearHover();
                        that._showTooltip(that.pointAtShownTooltip)
                    }
                    that._tooltip = options.tooltip;
                    that._tooltipEnabled = options.tooltip.enabled();
                    that._legend = options.legend;
                    that.legendCallback = options.legendCallback;
                    that._mainCanvas = options.mainCanvas;
                    that._prepare(that._renderer.root)
                },
                _prepare: function(root) {
                    var that = this,
                        data = {tracker: that};
                    $(root.element).off().on(POINTER_ACTION, data, that._pointerHandler).on("dxclick", data, that._clickHandler).on("dxhold", {timeout: 300}, $.noop)
                },
                _selectPointMultipleMode: function(point) {
                    var that = this;
                    that._selectedPoint = that._selectedPoint || [];
                    if ($.inArray(point, that._selectedPoint) < 0) {
                        that._selectedPoint.push(point);
                        that._setPointState(point, 'setPointSelectedState', processMode(point.getOptions().selectionMode), "pointSelectionChanged", that.legendCallback(point))
                    }
                },
                _releaseSelectedPointMultipleMode: function(point) {
                    var that = this,
                        points = that._selectedPoint || [],
                        pointIndex = $.inArray(point, points);
                    if (pointIndex >= 0) {
                        that._setPointState(point, 'releasePointSelectedState', processMode(point.getOptions().selectionMode), "pointSelectionChanged", that.legendCallback(point));
                        points.splice(pointIndex, 1)
                    }
                    else if (!point)
                        $.each(points, function(_, point) {
                            that._releaseSelectedPoint(point)
                        })
                },
                _selectPointSingleMode: function(point) {
                    var that = this;
                    if (that._selectedPoint !== point) {
                        that._releaseSelectedPoint();
                        that._selectedPoint = point;
                        that._setPointState(point, 'setPointSelectedState', processMode(point.getOptions().selectionMode), "pointSelectionChanged", that.legendCallback(point))
                    }
                },
                _releaseSelectedPointSingleMode: function() {
                    var that = this,
                        point = that._selectedPoint;
                    if (point) {
                        that._setPointState(point, 'releasePointSelectedState', processMode(point.getOptions().selectionMode), "pointSelectionChanged", that.legendCallback(point));
                        that._selectedPoint = null
                    }
                },
                _setPointState: function(point, action, mode, eventName, legendCallback) {
                    var that = this;
                    switch (mode) {
                        case ALL_ARGUMENTS_POINTS_MODE:
                            that._toAllArgumentPoints(point.argument, action, eventName);
                            break;
                        case ALL_SERIES_POINTS_MODE:
                            $.each(point.series.getPoints(), function(_, point) {
                                point.series[action](point);
                                that._eventTrigger(eventName, {target: point})
                            });
                            break;
                        case NONE_MODE:
                            break;
                        default:
                            point.series[action](point, legendCallback);
                            that._eventTrigger(eventName, {target: point})
                    }
                },
                _toAllArgumentPoints: function(argument, func, eventName) {
                    var that = this;
                    $.each(that._storedSeries, function(_, series) {
                        var neighborPoint = series.getPointByArg(argument);
                        if (neighborPoint) {
                            series[func](neighborPoint);
                            eventName && that._eventTrigger(eventName, {target: neighborPoint})
                        }
                    })
                },
                _setHoveredPoint: function(point, mode) {
                    var that = this;
                    var debug = DX.utils.debug;
                    debug.assert(point.series, 'series was not assigned to point or empty');
                    if (that.hoveredPoint === point && !point.series)
                        return;
                    that._releaseHoveredPoint();
                    if (point && point.getOptions() && mode !== NONE_MODE) {
                        that.hoveredPoint = point;
                        that._setPointState(point, 'setPointHoverState', mode || processMode(point.getOptions().hoverMode), "pointHoverChanged", that.legendCallback(point))
                    }
                },
                _releaseHoveredPoint: function() {
                    var that = this,
                        point = that.hoveredPoint,
                        mode;
                    if (!point || !point.getOptions())
                        return;
                    mode = processMode(point.getOptions().hoverMode);
                    if (mode === ALL_SERIES_POINTS_MODE)
                        $.each(point.series.getPoints(), function(_, point) {
                            point.series.releasePointHoverState(point);
                            that._eventTrigger("pointHoverChanged", {target: point})
                        });
                    else if (mode === ALL_ARGUMENTS_POINTS_MODE)
                        that._toAllArgumentPoints(point.argument, 'releasePointHoverState', "pointHoverChanged");
                    else {
                        point.releaseHoverState(that.legendCallback(point));
                        that._eventTrigger("pointHoverChanged", {target: point})
                    }
                    if (that._tooltipEnabled)
                        that._hideTooltip(point);
                    that.hoveredPoint = null
                },
                _setSelectedSeriesMultipleMode: function(series, mode) {
                    var that = this;
                    that._selectedSeries = that._selectedSeries || [];
                    if ($.inArray(series, that._selectedSeries) < 0) {
                        that._selectedSeries.push(series);
                        series.setSelectedState(true, mode, that.legendCallback(series));
                        that._eventTrigger("seriesSelectionChanged", {target: series})
                    }
                },
                _setSelectedSeriesSingleMode: function(series, mode) {
                    var that = this;
                    if (series !== that._selectedSeries || series.lastSelectionMode !== mode) {
                        this._releaseSelectedSeries();
                        that._selectedSeries = series;
                        series.setSelectedState(true, mode, that.legendCallback(series));
                        that._eventTrigger("seriesSelectionChanged", {target: series})
                    }
                },
                _releaseSelectedSeriesMultipleMode: function(series) {
                    var that = this,
                        selectedSeries = that._selectedSeries || [],
                        seriesIndex = $.inArray(series, selectedSeries);
                    if (seriesIndex >= 0) {
                        series.setSelectedState(false, undefined, that.legendCallback(series));
                        that._eventTrigger("seriesSelectionChanged", {target: series});
                        selectedSeries.splice(seriesIndex, 1)
                    }
                    else if (!series)
                        $.each(selectedSeries, function(_, series) {
                            that._releaseSelectedSeries(series)
                        })
                },
                _releaseSelectedSeriesSingleMode: function() {
                    var that = this,
                        series = that._selectedSeries;
                    if (series) {
                        series.setSelectedState(false, undefined, that.legendCallback(series));
                        that._eventTrigger("seriesSelectionChanged", {target: series});
                        that._selectedSeries = null
                    }
                },
                _setHoveredSeries: function(series, mode) {
                    var that = this;
                    if (mode !== NONE_MODE && that.hoveredSeries !== series || series.lastHoverMode !== mode) {
                        that._clearHover();
                        series.setHoverState(true, mode, that.legendCallback(series));
                        that._eventTrigger("seriesHoverChanged", {target: series})
                    }
                    that.hoveredSeries = series;
                    if (mode === NONE_MODE)
                        $(series).trigger('NoneMode')
                },
                _releaseHoveredSeries: function() {
                    var that = this;
                    if (that.hoveredSeries) {
                        that.hoveredSeries.setHoverState(false, undefined, that.legendCallback(that.hoveredSeries));
                        that._eventTrigger("seriesHoverChanged", {target: that.hoveredSeries});
                        that.hoveredSeries = null
                    }
                },
                _selectSeries: function(event, mode) {
                    event.data.tracker._setSelectedSeries(event.target, mode)
                },
                _deselectSeries: function(event, mode) {
                    event.data.tracker._releaseSelectedSeries(event.target, mode)
                },
                _selectPoint: function(event, point) {
                    event.data.tracker._setSelectedPoint(point)
                },
                _deselectPoint: function(event, point) {
                    event.data.tracker._releaseSelectedPoint(point)
                },
                _clearPointSelection: function() {
                    this._releaseSelectedPoint()
                },
                clearSelection: function() {
                    this._clearPointSelection();
                    this._releaseSelectedPoint()
                },
                _clean: function() {
                    var that = this;
                    that._selectedPoint = null;
                    that._selectedSeries = null;
                    that.hoveredPoint = null;
                    that.hoveredSeries = null;
                    that._hideTooltip(that.pointAtShownTooltip)
                },
                _clearHover: function() {
                    this._releaseHoveredSeries();
                    this._releaseHoveredPoint()
                },
                _hideTooltip: function(point) {
                    var tooltip = this._tooltip;
                    if (!tooltip || point && this.pointAtShownTooltip !== point)
                        return;
                    point = point || this.pointAtShownTooltip;
                    tooltip.hide();
                    if (this.pointAtShownTooltip) {
                        this.pointAtShownTooltip = null;
                        this._eventTrigger("tooltipHidden", {target: point})
                    }
                },
                _showTooltip: function(point) {
                    var tooltip = this._tooltip,
                        tooltipFormatObject;
                    if (point && point.getOptions()) {
                        tooltipFormatObject = point.getTooltipFormatObject(tooltip);
                        if (!isDefined(tooltipFormatObject.valueText) && !tooltipFormatObject.points || !point.isVisible())
                            return;
                        if (!tooltip.prepare(tooltipFormatObject, point.getTooltipParams(tooltip.getLocation())))
                            return;
                        tooltip.show();
                        !this.pointAtShownTooltip && this._eventTrigger("tooltipShown", {target: point});
                        this.pointAtShownTooltip = point
                    }
                },
                _showPointTooltip: function(event, point) {
                    event.data.tracker._showTooltip(point)
                },
                _hidePointTooltip: function(event, point) {
                    event.data.tracker._hideTooltip(point)
                },
                _enableOutHandler: function() {
                    if (this._outHandler)
                        return;
                    var that = this,
                        handler = function(e) {
                            var rootOffset = utils.getRootOffset(that._renderer),
                                x = parseInt(e.pageX - rootOffset.left),
                                y = parseInt(e.pageY - rootOffset.top);
                            if (!that._inCanvas(that._mainCanvas, x, y)) {
                                that._pointerOut();
                                that._disableOutHandler()
                            }
                        };
                    $(document).on(POINTER_ACTION, handler);
                    this._outHandler = handler
                },
                _disableOutHandler: function() {
                    this._outHandler && $(document).off(POINTER_ACTION, this._outHandler);
                    this._outHandler = null
                },
                _pointerOut: function() {
                    this._clearHover();
                    this._hideTooltip(this.pointAtShownTooltip)
                },
                _inCanvas: function(canvas, x, y) {
                    return x >= canvas.left && x <= canvas.right && y >= canvas.top && y <= canvas.bottom
                },
                dispose: function() {
                    var that = this;
                    that._disableOutHandler();
                    $.each(that, function(k) {
                        that[k] = null
                    })
                }
            };
        charts.ChartTracker = function(options) {
            this.ctor(options)
        };
        $.extend(charts.ChartTracker.prototype, baseTrackerPrototype, {
            ctor: function(options) {
                baseTrackerPrototype.ctor.call(this, options);
                this._crosshair = options.crosshair || []
            },
            _pointClick: function(point, event) {
                var that = this;
                that._eventTrigger("pointClick", {
                    target: point,
                    jQueryEvent: event
                }, function() {
                    !event.cancel && that._eventTrigger("seriesClick", {
                        target: point.series,
                        jQueryEvent: event
                    })
                })
            },
            _legendClick: function(series, event) {
                var that = this,
                    evetArgs = {
                        target: series,
                        jQueryEvent: event
                    };
                that._eventTrigger("legendClick", evetArgs, function() {
                    !event.cancel && that._eventTrigger("seriesClick", evetArgs)
                })
            },
            update: function(options) {
                var that = this;
                that._zoomingMode = (options.zoomingMode + '').toLowerCase();
                that._scrollingMode = (options.scrollingMode + '').toLowerCase();
                baseTrackerPrototype.update.call(this, options);
                that._argumentAxis = getNonVirtualAxis(options.argumentAxis || []);
                that._axisHoverEnabled = that._argumentAxis && processMode(that._argumentAxis.getOptions().hoverMode) === ALL_ARGUMENTS_POINTS_MODE;
                that._canvases = options.canvases;
                that._chart = options.chart;
                that._rotated = options.rotated
            },
            _getAxisArgument: function(event) {
                var $target = $(event.target);
                return event.target.tagName === "tspan" ? $target.parent().data('argument') : $target.data('argument')
            },
            _getCanvas: function(x, y) {
                var that = this,
                    canvases = that._canvases || [];
                for (var i = 0; i < canvases.length; i++) {
                    var c = canvases[i];
                    if (that._inCanvas(c, x, y))
                        return c
                }
                return null
            },
            _focusOnCanvas: function(canvas) {
                if (!canvas && this.hoveredSeries)
                    this._pointerOut()
            },
            _resetHoveredArgument: function() {
                if (isDefined(this.hoveredArgument)) {
                    this._toAllArgumentPoints(this.hoveredArgument, 'releasePointHoverState');
                    this.hoveredArgument = null
                }
            },
            _hideCrosshair: function() {
                $.each(this._crosshair, function(_, group) {
                    group.hide()
                })
            },
            _moveCrosshair: function(point, x, y) {
                if (point && this._crosshair) {
                    var coords = point.getCrosshairCoords(x, y);
                    $.each(this._crosshair, function(_, group) {
                        group.shift(coords.x, coords.y)
                    })
                }
            },
            _prepare: function(root) {
                var that = this,
                    touchScrollingEnabled = that._scrollingMode === 'all' || that._scrollingMode === 'touch',
                    touchZoomingEnabled = that._zoomingMode === 'all' || that._zoomingMode === 'touch',
                    cssValue = (!touchScrollingEnabled ? "pan-x pan-y " : '') + (!touchZoomingEnabled ? "pinch-zoom" : '') || "none",
                    rootStyles = {
                        'touch-action': cssValue,
                        '-ms-touch-action': cssValue
                    },
                    wheelzoomingEnabled = that._zoomingMode == "all" || that._zoomingMode == "mouse";
                baseTrackerPrototype._prepare.call(that, root);
                if (!that._gestureEndHandler) {
                    that._gestureEndHandler = function() {
                        that._gestureEnd()
                    };
                    $(document).on("dxpointerup", that._gestureEndHandler)
                }
                wheelzoomingEnabled && $(root.element).on("dxmousewheel", function(e) {
                    var rootOffset = utils.getRootOffset(that._renderer),
                        x = that._rotated ? e.pageY - rootOffset.top : e.pageX - rootOffset.left,
                        scale = that._argumentAxis.getTranslator().getMinScale(e.delta > 0),
                        translate = x - x * scale,
                        zoom = that._argumentAxis.getTranslator().zoom(-translate, scale);
                    that._pointerOut();
                    that._chart.zoomArgument(zoom.min, zoom.max, true);
                    e.preventDefault()
                });
                $(root.element).on("dxc-scroll-start", function(e) {
                    that._gestureStart(that._getGestureParams(e, {
                        left: 0,
                        top: 0
                    }))
                }).on("dxc-scroll-move", function(e) {
                    that._gestureChange(that._getGestureParams(e, {
                        left: 0,
                        top: 0
                    })) && e.preventDefault()
                });
                that._tooltip.off().on(POINTER_ACTION, {tracker: that}, that._tooltipPointerHandler);
                root.css(rootStyles)
            },
            _getGestureParams: function(e, offset) {
                var that = this,
                    x1,
                    x2,
                    touches = e.pointers.length,
                    left,
                    right,
                    eventCoordField = that._rotated ? "pageY" : "pageX";
                offset = that._rotated ? offset.top : offset.left;
                if (touches === 2)
                    x1 = e.pointers[0][eventCoordField] - offset,
                    x2 = e.pointers[1][eventCoordField] - offset;
                else if (touches === 1)
                    x1 = x2 = e.pointers[0][eventCoordField] - offset;
                left = Math.min(x1, x2);
                right = Math.max(x1, x2);
                return {
                        center: left + (right - left) / 2,
                        distance: right - left,
                        touches: touches,
                        scale: 1,
                        pointerType: e.pointerType
                    }
            },
            _gestureStart: function(gestureParams) {
                var that = this;
                that._startGesture = that._startGesture || gestureParams;
                if (that._startGesture.touches !== gestureParams.touches)
                    that._startGesture = gestureParams
            },
            _gestureChange: function(gestureParams) {
                var that = this,
                    startGesture = that._startGesture,
                    gestureChanged = false,
                    scrollingEnabled = that._scrollingMode === 'all' || that._scrollingMode !== 'none' && that._scrollingMode === gestureParams.pointerType,
                    zoommingEnabled = that._zoomingMode === 'all' || that._zoomingMode === 'touch';
                if (!startGesture)
                    return gestureChanged;
                if (startGesture.touches === 1 && Math.abs(startGesture.center - gestureParams.center) < 3) {
                    that._gestureStart(gestureParams);
                    return gestureChanged
                }
                if (startGesture.touches == 2 && zoommingEnabled) {
                    gestureChanged = true;
                    startGesture.scale = gestureParams.distance / startGesture.distance;
                    startGesture.scroll = gestureParams.center - startGesture.center + (startGesture.center - startGesture.center * startGesture.scale)
                }
                else if (startGesture.touches == 1 && scrollingEnabled) {
                    gestureChanged = true;
                    startGesture.scroll = gestureParams.center - startGesture.center
                }
                if (gestureChanged) {
                    startGesture.changed = gestureChanged;
                    that._chart._transformArgument(startGesture.scroll, startGesture.scale)
                }
                return gestureChanged
            },
            _gestureEnd: function() {
                var that = this,
                    startGesture = that._startGesture,
                    zoom,
                    renderer = that._renderer;
                that._startGesture = null;
                function complete() {
                    that._chart.zoomArgument(zoom.min, zoom.max, true)
                }
                if (startGesture && startGesture.changed) {
                    zoom = that._argumentAxis._translator.zoom(-startGesture.scroll, startGesture.scale);
                    if (renderer.animationEnabled() && (-startGesture.scroll !== zoom.translate || startGesture.scale !== zoom.scale)) {
                        var translateDelta = -(startGesture.scroll + zoom.translate),
                            scaleDelta = startGesture.scale - zoom.scale;
                        renderer.root.animate({_: 0}, {
                            step: function(pos) {
                                var translateValue = -startGesture.scroll - translateDelta * pos;
                                var scaleValue = startGesture.scale - scaleDelta * pos;
                                that._chart._transformArgument(-translateValue, scaleValue)
                            },
                            complete: complete,
                            duration: 250
                        })
                    }
                    else
                        complete()
                }
            },
            _getSeriesForShared: function(x, y) {
                var that = this,
                    points = [],
                    point = null,
                    distance = Infinity;
                if (that._tooltip.shared() && !that.hoveredSeries) {
                    $.each(that._storedSeries, function(_, series) {
                        var point = series.getNeighborPoint(x, y);
                        point && points.push(point)
                    });
                    $.each(points, function(_, p) {
                        var coords = p.getCrosshairCoords(x, y),
                            d = Math.sqrt((x - coords.x) * (x - coords.x) + (y - coords.y) * (y - coords.y));
                        if (d < distance) {
                            point = p;
                            distance = d
                        }
                    })
                }
                return point && point.series
            },
            _pointerHandler: function(e) {
                var that = e.data.tracker,
                    rootOffset = utils.getRootOffset(that._renderer),
                    x = parseInt(e.pageX - rootOffset.left),
                    y = parseInt(e.pageY - rootOffset.top),
                    point = $(e.target).data("point"),
                    canvas = that._getCanvas(x, y),
                    series = $(e.target).data("series") || point && point.series || that._getSeriesForShared(x, y);
                that._enableOutHandler();
                if (e.type === "dxpointerdown")
                    canvas && that._gestureStart(that._getGestureParams(e, rootOffset));
                else if (that._startGesture && canvas)
                    if (that._gestureChange(that._getGestureParams(e, rootOffset))) {
                        that._pointerOut();
                        e.preventDefault();
                        return
                    }
                if (that._legend.coordsIn(x, y)) {
                    var item = that._legend.getItemByCoord(x, y);
                    if (item) {
                        series = that._storedSeries[item.id];
                        that._setHoveredSeries(series, that._legend._options.hoverMode)
                    }
                    else
                        that._clearHover();
                    that._hideCrosshair();
                    return
                }
                if (that._axisHoverEnabled && that._argumentAxis.coordsIn(x, y)) {
                    var argument = that._getAxisArgument(e),
                        argumentDefined = isDefined(argument);
                    if (argumentDefined && that.hoveredArgument !== argument) {
                        that._clearHover();
                        that._resetHoveredArgument();
                        that._toAllArgumentPoints(argument, "setPointHoverState");
                        that.hoveredArgument = argument
                    }
                    else if (!argumentDefined)
                        that._resetHoveredArgument();
                    return
                }
                that._resetHoveredArgument();
                that._focusOnCanvas(canvas);
                if (!canvas && !point)
                    return;
                if (series && series !== that.hoveredSeries || that.hoveredSeries && that.hoveredSeries.lastHoverMode !== processMode(that.hoveredSeries.getOptions().hoverMode)) {
                    series = series || that.hoveredSeries;
                    that._setHoveredSeries(series, series.getOptions().hoverMode)
                }
                if (that.hoveredSeries) {
                    point = point || that.hoveredSeries.getNeighborPoint(x, y);
                    if (point && point != that.hoveredPoint) {
                        that._tooltipEnabled && that._showTooltip(point);
                        that._setHoveredPoint(point)
                    }
                    that._moveCrosshair(point, x, y)
                }
            },
            _pointerOut: function() {
                this._hideCrosshair();
                this._resetHoveredArgument();
                baseTrackerPrototype._pointerOut.call(this)
            },
            _clickHandler: function(e) {
                var that = e.data.tracker,
                    rootOffset = utils.getRootOffset(that._renderer),
                    x = parseInt(e.pageX - rootOffset.left),
                    y = parseInt(e.pageY - rootOffset.top),
                    point = $(e.target).data("point"),
                    series = that.hoveredSeries || $(e.target).data("series") || point && point.series,
                    axis = that._argumentAxis;
                if (that._legend.coordsIn(x, y)) {
                    var item = that._legend.getItemByCoord(x, y);
                    if (item) {
                        series = that._storedSeries[item.id];
                        that._legendClick(series, e)
                    }
                    return
                }
                if (axis && axis.coordsIn(x, y)) {
                    var argument = that._getAxisArgument(e);
                    if (isDefined(argument)) {
                        that._eventTrigger("argumentAxisClick", {
                            target: axis,
                            argument: argument,
                            jQueryEvent: e
                        });
                        return
                    }
                }
                if (series) {
                    point = point || series.getPointByCoord(x, y);
                    if (point)
                        that._pointClick(point, e);
                    else
                        $(e.target).data("series") && that._eventTrigger("seriesClick", {
                            target: series,
                            jQueryEvent: e
                        })
                }
            },
            _tooltipPointerHandler: function(e) {
                var that = e.data.tracker,
                    rootOffset = utils.getRootOffset(that._renderer),
                    x = parseInt(e.pageX - rootOffset.left),
                    y = parseInt(e.pageY - rootOffset.top),
                    series = that.hoveredSeries,
                    point;
                if (series && !series.getPointByCoord(x, y)) {
                    $.each(that._storedSeries, function(_, s) {
                        point = s.getPointByCoord(x, y);
                        if (point)
                            return false
                    });
                    point && that._tooltip.hide()
                }
            },
            dispose: function() {
                this._gestureEndHandler && $(document).off("dxpointerup", this._gestureEndHandler);
                baseTrackerPrototype.dispose.call(this)
            }
        });
        charts.PieTracker = function(options) {
            this.ctor(options)
        };
        $.extend(charts.PieTracker.prototype, baseTrackerPrototype, {
            _legendClick: function(point, event) {
                var that = this,
                    eventArg = {
                        target: point,
                        jQueryEvent: event
                    };
                that._eventTrigger("legendClick", eventArg, function() {
                    !event.cancel && that._eventTrigger("pointClick", eventArg)
                })
            },
            _pointerHandler: function(e) {
                var that = e.data.tracker,
                    rootOffset = utils.getRootOffset(that._renderer),
                    x = parseInt(e.pageX - rootOffset.left),
                    y = parseInt(e.pageY - rootOffset.top),
                    series = that._storedSeries[0],
                    point = $(e.target).data("point") || series && series.getPointByCoord(x, y),
                    item,
                    mode;
                that._enableOutHandler();
                if (that._legend.coordsIn(x, y)) {
                    var item = that._legend.getItemByCoord(x, y);
                    if (item) {
                        point = that._storedSeries[0].getPoints()[item.id];
                        mode = that._legend._options.hoverMode
                    }
                }
                if (point && point != that.hoveredPoint) {
                    that._tooltipEnabled && that._showTooltip(point);
                    that._setHoveredPoint(point, mode)
                }
                else if (!point)
                    that._pointerOut()
            },
            _clickHandler: function(e) {
                var that = e.data.tracker,
                    rootOffset = utils.getRootOffset(that._renderer),
                    x = parseInt(e.pageX - rootOffset.left),
                    y = parseInt(e.pageY - rootOffset.top),
                    storedSeries = that._storedSeries[0],
                    point;
                if (that._legend.coordsIn(x, y)) {
                    var item = that._legend.getItemByCoord(x, y);
                    if (item) {
                        point = storedSeries.getPoints()[item.id];
                        that._legendClick(point, e)
                    }
                }
                else {
                    point = $(e.target).data("point") || storedSeries && storedSeries.getPointByCoord(x, y);
                    point && that._eventTrigger("pointClick", {
                        target: point,
                        jQueryEvent: e
                    })
                }
            }
        })
    })(jQuery, DevExpress);
    /*! Module viz-charts, file crosshair.js */
    (function($, DX, undefined) {
        var mathMax = Math.max,
            HORIZONTAL_LINE = "horizontalLine",
            VERTICAL_LINE = "verticalLine",
            LABEL_BACKGROUND_PADDING_X = 8,
            LABEL_BACKGROUND_PADDING_Y = 4,
            CENTER = "center",
            RIGHT = "right",
            LEFT = "left",
            TOP = "top",
            BOTTOM = "bottom";
        function Crosshair() {
            this.ctor.apply(this, arguments)
        }
        DX.viz.charts.Crosshair = Crosshair;
        Crosshair.prototype = {
            ctor: function(renderer, options, isHorizontal, canvas, axes, group) {
                var that = this;
                that._isHorizontal = isHorizontal;
                that._renderer = renderer;
                that._crosshairGroup = group;
                that._init(options, canvas, axes)
            },
            dispose: function() {
                var that = this;
                that._renderer = null;
                that._crosshairGroup = null;
                that._options = null;
                that._axes = null;
                that._canvas = null;
                that._text = null;
                that._background = null;
                that._group = null
            },
            _init: function(options, canvas, axes) {
                var that = this;
                that._canvas = {
                    top: canvas.top,
                    bottom: canvas.height - canvas.bottom,
                    left: canvas.left,
                    right: canvas.width - canvas.right,
                    width: canvas.width,
                    height: canvas.height
                };
                that._axes = axes;
                that._prepareOptions(options, that._isHorizontal ? HORIZONTAL_LINE : VERTICAL_LINE)
            },
            _prepareOptions: function(options, direction) {
                this._options = {
                    visible: options[direction].visible,
                    line: {
                        stroke: options[direction].color || options.color,
                        "stroke-width": options[direction].width || options.width,
                        dashStyle: options[direction].dashStyle || options.dashStyle,
                        opacity: options[direction].opacity || options.opacity,
                        "stroke-linecap": "square"
                    },
                    label: $.extend(true, {}, options.label, options[direction].label)
                }
            },
            render: function() {
                var that = this,
                    renderer = that._renderer,
                    canvas = that._canvas,
                    options = that._options;
                if (!options.visible)
                    return;
                that._group = renderer.g().attr({visibility: "hidden"}).append(that._crosshairGroup);
                that._createLabel(options);
                renderer.path(that._isHorizontal ? [canvas.left, canvas.top, canvas.right, canvas.top] : [canvas.left, canvas.top, canvas.left, canvas.bottom], "line").attr(options.line).sharp().append(that._group)
            },
            _createLabel: function(options) {
                var that = this,
                    canvas = that._canvas,
                    isHorizontal = that._isHorizontal,
                    labelCanvas = isHorizontal ? {
                        left: 0,
                        right: canvas.width,
                        top: canvas.top,
                        bottom: canvas.bottom
                    } : {
                        left: canvas.left,
                        right: canvas.right,
                        top: 0,
                        bottom: canvas.height
                    },
                    renderer = that._renderer,
                    x,
                    y,
                    text,
                    background,
                    curentLabelPos,
                    bbox;
                if (!options.label || !options.label.visible)
                    return;
                that._text = [];
                that._background = [];
                $.each(that._axes, function(_, axis) {
                    var axisOptions = axis.getOptions();
                    if (axis._virtual || axisOptions.stubData) {
                        that._text.push(null);
                        that._background.push(null);
                        return
                    }
                    curentLabelPos = axis.getCurrentLabelPos();
                    if (isHorizontal) {
                        y = canvas.top;
                        x = curentLabelPos;
                        labelCanvas.left = labelCanvas.left < curentLabelPos && curentLabelPos < canvas.left ? curentLabelPos : labelCanvas.left;
                        labelCanvas.right = labelCanvas.right > curentLabelPos && curentLabelPos > canvas.right ? curentLabelPos : labelCanvas.right
                    }
                    else {
                        x = canvas.left;
                        y = curentLabelPos;
                        labelCanvas.top = labelCanvas.top < curentLabelPos && curentLabelPos < canvas.top ? curentLabelPos : labelCanvas.top;
                        labelCanvas.bottom = labelCanvas.bottom > curentLabelPos && curentLabelPos > canvas.bottom ? curentLabelPos : labelCanvas.bottom
                    }
                    text = renderer.text("0", x, y).css(DX.viz.core.utils.patchFontOptions(options.label.font)).attr({align: axisOptions.position === TOP || axisOptions.position === BOTTOM ? CENTER : axisOptions.position === RIGHT ? LEFT : RIGHT}).append(that._group);
                    bbox = text.getBBox();
                    text.attr({y: isHorizontal ? 2 * y - bbox.y - bbox.height / 2 : axisOptions.position === BOTTOM ? 2 * y - bbox.y : 2 * y - (bbox.y + bbox.height)});
                    background = renderer.rect(0, 0, 0, 0).attr({fill: options.label.backgroundColor || options.line.stroke}).append(that._group).toBackground();
                    that._text.push(text);
                    that._background.push(background)
                });
                canvas.left = labelCanvas.left || canvas.left;
                canvas.top = labelCanvas.top || canvas.top;
                canvas.right = labelCanvas.right !== canvas.width ? labelCanvas.right : canvas.right;
                canvas.bottom = labelCanvas.bottom !== canvas.height ? labelCanvas.bottom : canvas.bottom
            },
            _updateText: function(posX, posY) {
                var that = this,
                    bbox,
                    text,
                    textElement,
                    backgroundElement;
                if (!that._text)
                    return;
                $.each(that._axes, function(i, axis) {
                    textElement = that._text[i];
                    backgroundElement = that._background[i];
                    if (!textElement)
                        return;
                    text = axis.getUntranslatedValue(that._isHorizontal ? posY : posX);
                    if (DX.utils.isDefined(text)) {
                        textElement.attr({text: text});
                        bbox = textElement.getBBox();
                        backgroundElement.attr({
                            x: bbox.x - LABEL_BACKGROUND_PADDING_X,
                            y: bbox.y - LABEL_BACKGROUND_PADDING_Y,
                            width: bbox.width + LABEL_BACKGROUND_PADDING_X * 2,
                            height: bbox.height + LABEL_BACKGROUND_PADDING_Y * 2
                        })
                    }
                    else {
                        textElement.attr({text: ""});
                        backgroundElement.attr({
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0
                        })
                    }
                })
            },
            show: function() {
                var group = this._group;
                group && group.attr({visibility: "visible"})
            },
            hide: function() {
                var group = this._group;
                group && group.attr({visibility: "hidden"})
            },
            shift: function(x, y) {
                var that = this,
                    canvas = that._canvas,
                    group = that._group,
                    translate;
                if (!group)
                    return;
                if (x >= canvas.left && x <= canvas.right && y >= canvas.top && y <= canvas.bottom) {
                    that.show();
                    if (that._isHorizontal) {
                        translate = y - canvas.top;
                        group.attr({translateY: translate})
                    }
                    else {
                        translate = x - canvas.left;
                        group.attr({translateX: translate})
                    }
                    that._updateText(x, y)
                }
                else
                    that.hide()
            }
        }
    })(jQuery, DevExpress);
    DevExpress.MOD_VIZ_CHARTS = true
}