(function($, DX, undefined) {
    DX.framework.html.OverlayLayoutControllerBase = DX.framework.html.DefaultLayoutController.inherit({
        ctor: function(options) {
            options = options || {};
            if (!options.childController) {
                this._ensureChildController("SimpleLayoutController", "SimpleLayout");
                this.childController = new DX.framework.html.SimpleLayoutController
            }
            else
                this.childController = options.childController;
            this.contentContainerSelector = options.contentContainerSelector;
            this.callBase(options)
        },
        _initChildController: function(options) {
            var that = this,
                $targetViewPort = that._$mainLayout.find(this.contentContainerSelector);
            that.childController.init($.extend({}, options, {$viewPort: $targetViewPort}));
            $.each(["viewRendered", "viewReleased"], function(_, callbacksPropertyName) {
                that.childController.on(callbacksPropertyName, function(args) {
                    that.fireEvent(callbacksPropertyName, [args])
                })
            })
        },
        _ensureChildController: function(controllerName, layoutName) {
            if (!DX.framework.html[controllerName])
                throw new Error("The '" + controllerName + "' is not found. Make sure the '" + layoutName + "'* files are referenced in your main *.html file.");
        },
        _base: function() {
            return DX.framework.html.DefaultLayoutController.prototype
        },
        _showContainerWidget: DX.abstract,
        _hideContainerWidget: DX.abstract,
        init: function(options) {
            options = options || {};
            this.callBase(options);
            this._initChildController(options)
        },
        activate: function($target) {
            var that = this,
                result;
            that.childController.activate();
            that._base().activate.call(that, $target);
            result = that._showContainerWidget($target);
            return result
        },
        deactivate: function() {
            var that = this,
                result;
            result = that._hideContainerWidget();
            result.done(function() {
                that._base().deactivate.call(that);
                that.childController.deactivate()
            });
            return result
        },
        setViewLoadingState: function(viewInfo, direction) {
            return this.childController.setViewLoadingState(viewInfo, direction)
        },
        showView: function(viewInfo, direction) {
            return this.childController.showView(viewInfo, direction)
        }
    });
    DX.framework.html.PopupLayoutController = DX.framework.html.OverlayLayoutControllerBase.inherit({
        ctor: function(options) {
            options = options || {};
            options.name = options.name || "popup";
            options.contentContainerSelector = options.contentContainerSelector || ".child-controller-content";
            this.isOverlay = true;
            this._targetContainer = options.targetContainer;
            this.callBase(options)
        },
        init: function(options) {
            this.callBase(options);
            this._popup = this._$mainLayout.find(".popup-container").dxPopup("instance");
            if (this._targetContainer)
                this._popup.option("targetContainer", this._targetContainer)
        },
        _showContainerWidget: function() {
            return this._popup.show()
        },
        _hideContainerWidget: function() {
            return this._popup.hide()
        }
    });
    var layoutSets = DX.framework.html.layoutSets;
    $.each(["navbar", "simple", "slideout", "pivot", "split"], function(index, name) {
        layoutSets[name] = layoutSets[name] || [];
        $.each(layoutSets[name], function(index, layoutInfo) {
            layoutInfo.modal = false
        });
        layoutSets[name].push({
            modal: true,
            controller: new DX.framework.html.PopupLayoutController
        })
    })
})(jQuery, DevExpress);