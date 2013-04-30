/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function() {
    //var log = log4javascript.getDefaultLogger();
    var createClass = fabric.util.createClass;
    //fabric.util.extend(window,fabric.util);
    function getOrientation() {
        return  window.matchMedia("(orientation: portrait)").matches ? 'portrait' : 'landscape';
    }


    function isTarget(_oObject, _oEvent) {
        var _nX, _nY,
            _elementOffset = fabric.util.getElementOffset(_oObject.canvas.upperCanvasEl),
            _objectOffser = {left: _elementOffset + }
    debugger;
        if (_oEvent.e instanceof MouseEvent || (window.MSPointerEvent && _oEvent.e instanceof window.MSPointerEvent)) {
                _nX = _oEvent.e.pageX,
                        _nY = _oEvent.e.pageY;
            } else {
                _nX = _oEvent.e.touches[_oEvent.e.touches.length - 1].pageX,
                        _nY = _oEvent.e.touches[_oEvent.e.touches.length - 1].pageY;

            }
        var tl = new fabric.Point(_oObject.getLeft(), _oObject.getTop()),
                br = new fabric.Point(_oObject.getLeft() + _oObject.getWidth(), _oObject.getTop() + _oObject.getHeight());
        return _nX > tl.x && _nX < br.x &&
                _nY > tl.y && _nY < br.y ? _oObject : null;
    }


    function bindOrientationEvents() {
            return
        $(window).bind('deviceorientation', function(_oJQEvent) {
            if (this._textField) {
                var _oOriginalEvent = _oJQEvent.originalEvent,
                        _oRotationRate = _oOriginalEvent,
                        _aRotationRate = [];
//                for (var i in _oRotationRate) {
//                    _aRotationRate.push(i + ': ' + _oRotationRate[i]);
//                }
                if (_oRotationRate) {
                    this._textField.setText(_oRotationRate.alpha + ' ' + _oRotationRate.beta + ' ' + _oRotationRate.gamma);
                    this._canvas.renderAll();
                }
            }
        }.bind(this));
//        $(window).on('devicemotion', function(_oJQEvent) {
//            if (this._textField) {
//                var _oOriginalEvent = _oJQEvent.originalEvent,
//                        _oRotationRate = _oOriginalEvent.rotationRate,
//                        _oAcceleration = _oOriginalEvent.acceleration,
//                        _oAccelerationIncludingGravity = _oOriginalEvent.accelerationIncludingGravity,
//                        _aRotationRate = [];
//                
//                for (var i in _oAccelerationIncludingGravity) {
//                    _aRotationRate.push(i + ': ' + _oAccelerationIncludingGravity[i].toFixed(2));
//                }
//                
//
//                this._textField.setText(_aRotationRate.join(" "));
//                this._canvas.renderAll();
//                
//            }
//        }.bind(this));
    }


    var SideManipulator = createClass(fabric.Image, {
        initialize: function(element, _options, _fCallBack) {
            if (!element) {
                this._createElement('css/images/target.png', this._onCreate.bind(this, _options, _fCallBack));
            } else {
                this._onCreate(_options, _fCallBack, element);
            }
        },
        _createElement: function(url, _fCallBack) {
            var img = fabric.document.createElement('img');
            /** @ignore */
            img.onload = function() {
                if (typeof _fCallBack == 'function') {
                    _fCallBack(img);
                }
                img = img.onload = null;
            };
            img.src = url;
        },
        _onCreate: function(_options, _fCallBack, element) {
            this.callSuper('initialize', element, _options);
            this.set({perPixelTargetFind: true,
                selectable: false,
                originX: 'left',
                originY: 'top'});
            this.on('added', function() {
                this.off('added', arguments.callee);
                this._addedObject();
            }.bind(this));
            if (typeof _fCallBack == 'function') {
                _fCallBack(this);
           }
        },
        _addedObject: function() {
            this.canvas.add(this._getCircle());
            this._getCircle().bringToFront();
            this.canvas.on('mouse:down', this.mouseDown.bind(this));
            this.canvas.on('mouse:move', this.mouseMove.bind(this));
            this.canvas.on('mouse:up', this.mouseUp.bind(this));
        },
                
        _getCircle: function() {
            if (!this._circle) {
                this._circle = new fabric.Circle({radius: 10, left: this.getCenterPoint().x, top: this.getCenterPoint().y, selectable: false, fill: 'rgb(100,100,200)'});
            }
            return this._circle;
        },
        mouseDown: function(_oEvent) {
            if (isTarget(this, _oEvent)) {
                this._observe = true;
                this.canvas.fire('mouse:move', _oEvent);
            }
        },
        mouseMove: function(_oEvent) {
            var _bIsTarget = isTarget(this, _oEvent);
            if (!this._observe) {
                return;
            } else if (false && !_bIsTarget) {
                this.canvas.fire('mouse:up', _oEvent);
                return;
            }
            var _nX,
                    _nY,
                    _oPoint;
            if (_oEvent.e instanceof MouseEvent || (window.MSPointerEvent && _oEvent.e instanceof window.MSPointerEvent)) {
                _nX = _oEvent.e.offsetX,
                        _nY = _oEvent.e.offsetY;
            } else {
                _nX = _oEvent.e.touches[_oEvent.e.touches.length - 1].offsetX,
                        _nY = _oEvent.e.touches[_oEvent.e.touches.length - 1].offsetX;

            }
            this.moveShape(this._getCircle(), _nX, _nY);
        },
        mouseUp: function(_oEvent) {
            if (this._observe) {
                this._observe = false;
                this.moveShape(this._getCircle(), this.getCenterPoint().x, this.getCenterPoint().y, true);
            }
        },
        moveShape: function(_oShape, _x, _y, _bAnimate) {
            if (_oShape) {
                var _oCanvas = this.canvas;
                if (_bAnimate) {
                    _oShape.animate({left: _x, top: _y}, {
                        duration: 100,
                        easing: fabric.util.ease.easeOutElastic,
                        onChange: _oCanvas.renderAll.bind(_oCanvas)});
                } else {
                    _oShape.set({left: _x, top: _y});
                    _oCanvas.renderAll();
                }
            }
        }
    });

    var JoyStikApplication = createClass({
//        launchFullScreen: function (element) {
//            if(element.requestFullScreen) {
//              element.requestFullScreen();
//            } else if(element.mozRequestFullScreen) {
//              element.mozRequestFullScreen();
//            } else if(element.webkitRequestFullScreen) {
//              element.webkitRequestFullScreen();
//            }
//          },
        initialize: function() {
            this._canvas = new fabric.Canvas('main_canvas', {selection: false});
            this.adjustSize();
            fabric.util.addListener(window, 'resize', this.adjustSize.bind(this));
            new SideManipulator(undefined, {left: 0, top: 0, width: 300, height: 300}, function(_Object) {
                this._sideManipulator =  _Object;
                this._canvas.add(_Object);
            }.bind(this));
            this._initTextField();
            this._initEvents();

        },
        _msTouchSupport: function() {
//            MSPointerDown
//            MSPointerMove
//            MSPointerUp
//            MSPointerOver
//            MSPointerOut
//            MSPointerHover

//Событие MSGestureTap
//Событие MSGestureHold
//Событие MSGestureStart
//Событие MSGestureChange
//Событие MSGestureEnd
//Событие MSInertiaStart
            if (window.navigator.msPointerEnabled) {
                fabric.util.addListener(this._canvas.upperCanvasEl, "MSGestureTap", this._canvas._onMouseDown);
                fabric.util.addListener(this._canvas.upperCanvasEl, "MSPointerDown", this._canvas._onMouseDown);
                fabric.util.addListener(this._canvas.upperCanvasEl, "MSPointerMove", this._canvas._onMouseMove);
                fabric.util.addListener(this._canvas.upperCanvasEl, "MSPointerUp", this._canvas._onMouseUp);
            }
            //Исправление ошибки библиотеки 
            if (fabric.isTouchSupported) {
                fabric.util.addListener(this._canvas.upperCanvasEl, 'mousedown', this._canvas._onMouseDown);
                fabric.util.addListener(this._canvas.upperCanvasEl, 'mousemove', this._canvas._onMouseMove);
                fabric.util.addListener(fabric.document, 'mouseup', this._canvas._onMouseUp);
                fabric.util.addListener(fabric.document, 'mousemove', this._canvas._onMouseMove);
            }


        },
        _onOrientationChange: function(_oEvent) {
            alert('change');
        },
        _initEvents: function() {
            this._msTouchSupport();
            //window.addEventListener('load', setOrientation, false);
            bindOrientationEvents.bind(this).call();
            //$(this._canvas.upperCanvasEl).on('mousedown', function(){debugger;});

            $(this._canvas.upperCanvasEl).on("selectstart", function(e) {
                e.preventDefault();
            }, false);
            $(this._canvas.upperCanvasEl).on("MSGestureHold", function(e) {
                e.preventDefault();
            }, false);
            // Disables visual
            $(this._canvas.upperCanvasEl).on("contextmenu", function(e) {
                e.preventDefault();
            }, false);
            // Disables menu
        },
        _initTextField: function() {
            var text = new fabric.Text('', {fontSize: 15, left: 10, top: 10});
            text.originX = 'left';
            text.originY = 'top';
            this._canvas.add(text);
            this._textField = text;
        },
        adjustSize: function() {
            this._canvas.setHeight(this.getPreferredHeight());
            this._canvas.setWidth(this.getPreferredWidth());
            if (this._sideManipulator){
                //this._sideManipulator.set({height: this.getPreferredHeight(), width: this.getPreferredWidth()});
                this._sideManipulator.scaleToHeight(this.getPreferredHeight());
                if (this._sideManipulator.getWidth() > this.getPreferredWidth()){
                    this._sideManipulator.scaleToWidth(this.getPreferredWidth());
                }
                
            }
            this._canvas.renderAll();
//            if (!this._observe && this._sideManipulator) {
//                this._sideManipulator.center();
//            }
        },
        getPreferredHeight: function() {
            return window.innerHeight;
        },
        getPreferredWidth: function() {
            return window.innerWidth;
        },
        start: function() {

        },
        stop: function() {
        }
    });
    fabric.util.addListener(window, 'load', function() {
        (new JoyStikApplication()).start();


    });
//    $(function() {
//        (new JoyStikApplication()).start();
//
//
//    });

    //bindOrientationEvents();

})();
        