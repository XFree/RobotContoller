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
            this._canvas.on('mouse:down', this.mouseDown.bind(this));
        },
                
        mouseDown: function(_oEvent) {
            this._observe = true;
            var _oCanvas = this._canvas,
                _fCallBack = this.mouseMove.bind(this);
            _oCanvas.on('mouse:move', _fCallBack);
            _oCanvas.fire('mouse:move',_oEvent);
           _oCanvas.on('mouse:up',this.mouseUp.bind(this, _fCallBack));

        },
               
        mouseMove: function(_oEvent){
            var _bMouseEvent = _oEvent.e instanceof MouseEvent,
                _nX,
                _nY,
                _oPoint;
            if (_bMouseEvent){
                _nX = _oEvent.e.offsetX,
                _nY = _oEvent.e.offsetY; 
                _oPoint = new fabric.Point(_nX,_nY);
            } else {
                _nX = _oEvent.e.touches[0].pageX,
                _nY = _oEvent.e.touches[0].pageY;  
                //_oPoint = this._circle.toLocalPoint(new fabric.Point(_nX, _nY)); 
                _oPoint = new fabric.Point(_nX, _nY);
            }
            this.moveShape(this._circle, _oPoint.x, _oPoint.y);
        },
                
        mouseUp: function(_fMouseDownCallBack, _oEvent){
         this._observe = false;
         this._canvas.off('mouse:up', arguments.callee);
         this._canvas.off('mouse:move', _fMouseDownCallBack);
         this.moveShape(this._circle,this._canvas.getCenter().left,this._canvas.getCenter().top, true);
        },
                
        adjustSize: function() {
            //Временный Хак.
            //TODO: незабыть написать автору фреймворка
            //$('#page_1').css({height: '100%'});
//            canvas.width = window.innerWidth;
//            canvas.height = window.innerHeight;
            this._canvas.setHeight(this.getPreferredHeight());
            this._canvas.setWidth(this.getPreferredWidth());
            if (!this._observe && this._circle){
                this._circle.center();
            }
        },
        getPreferredHeight: function() {
            return window.innerHeight;
        },
        getPreferredWidth: function() {
            return window.innerWidth;
        },
        initialize: function() {
//            var _width = $('body').width(),
//                _height = $('body').height();
            this._canvas = new fabric.Canvas('main_canvas', {selection: false});
//            this._canvas.setWidth(_width);
//            this._canvas.setHeight(_height);
            this.adjustSize();
            this._circle = new MegaCircle({radius: 10, left: this._canvas.getCenter().left, top: this._canvas.getCenter().top, selectable: false, fill: 'rgb(100,100,200)'});
              this._canvas.add(this._circle);
            $(window).resize(this.adjustSize.bind(this));
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

        $(function(){
            (new JoyStikApplication()).start();
            
            
        });
        
        //bindOrientationEvents();
    
})();
        