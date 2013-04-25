/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function() {
    var createClass = fabric.util.createClass;
    function bindOrientationEvents() {
        $(window).bind('deviceorientation', function(_oJQEvent) {
            var _oOriginalEvent = _oJQEvent.originalEvent,
                    _oRotationRate = _oOriginalEvent;
            $('#test_orientation').text(_oRotationRate.alpha + ' ' + _oRotationRate.beta + ' ' + _oRotationRate.gamma);
        });
        $(window).bind('devicemotion', function(_oJQEvent) {
            var _oOriginalEvent = _oJQEvent.originalEvent,
                    _oRotationRate = _oOriginalEvent.rotationRate,
                    _oAcceleration = _oOriginalEvent.acceleration,
                    _aRotationRate = [];
            for (var i in _oAcceleration) {
                _aRotationRate.push(_oAcceleration[i].toFixed(2));
            }


            $('#test_motion').text(_aRotationRate.join("\n"));
        });
    }
    ;

    var MegaCircle = createClass(fabric.Circle, {
        initialize: function(_options) {
            var _Object = this;
            _Object.callSuper('initialize', _options);
            _Object.on('added', function(){
                _Object.off('added', arguments.callee);
                _Object._addedObject();
            });
        },
        _addedObject: function() {
            var _oCanvas = this.canvas;
            
        }
    });

    var JoyStikApplication = createClass({
        _initEvents: function() {
          this._canvas.on('mouse:down', this.observerShape.bind(this));
        },
                
        observerShape: function() {
            var _oCanvas = this._canvas,
                _fCallBack = this.mouseMove.bind(this);
            _oCanvas.on('mouse:move', _fCallBack);
            _oCanvas.on('mouse:up',this.mouseUp.bind(this, _fCallBack));
        },
               
        mouseMove: function(_oEvent){
          this.moveShape(this._circle, _oEvent.e.offsetX, _oEvent.e.offsetY);
        },
                
        mouseUp: function(_fMouseDownCallBack, _oEvent){
         this._canvas.off('mouse:move', _fMouseDownCallBack);
         this.moveShape(this._circle,10,10, true)
        },
                
        adjustSize: function() {
            //Временный Хак.
            //TODO: незабыть написать автору фреймворка
            this._canvas.setHeight(this.getPreferredHeight());
            this._canvas.setWidth(this.getPreferredWidth());
        },
        getPreferredHeight: function() {
            return $('#page_1').parent().height();
        },
        getPreferredWidth: function() {
            return $('#page_1').parent().width();
        },
        initialize: function() {
            this._canvas = new fabric.Canvas('main_canvas', {selection: false});
            this._circle = new MegaCircle({radius: 10, top: 10, left: 10, selectable: false, fill: 'rgb(100,100,200)'});
            this._canvas.add(this._circle);
            this.adjustSize();
            $(window).resize(this.adjustSize);
            this._initEvents();
        },
        moveShape: function(_oShape, _x, _y, _bAnimate) {
            if (_oShape) {
                var _oCanvas = this._canvas;
                
                if (_bAnimate){
                _oShape.animate({left: _x, top: _y}, {
                    duration: 100,
                    easing: fabric.util.ease.easeOutBounc,
                    onChange: _oCanvas.renderAll.bind(_oCanvas)});
                } else {
                  _oShape.set({left: _x, top: _y});
                 _oCanvas.renderAll();
                }
            }
        },
        start: function() {

        },
        stop: function() {
        }
    });

    $(function() {
        (new JoyStikApplication()).start();
        //bindOrientationEvents();
    });
})();
        