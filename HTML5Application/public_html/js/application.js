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

    function bindOrientationEvents() {
        $(window).bind('deviceorientation', function(_oJQEvent) {
            return
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
    
    
    var SideManipulator = createClass({
        initialize: function(_options, _fCallBack) {
            var  _oNewOptions  = {
                    perPixelTargetFind: true,
                    selectable: false,
                    originX: 'left',
                    originY: 'top',
                    clipTo: function(ctx){
                        ctx.arc(0, 0, this.getHeight()/2, 0, Math.PI * 2, true);
                   }}
               fabric.util.object.extend(_oNewOptions, _options);
            //_Object.callSuper('initialize', _oNewOptions);
             this = fabric.Image.fromURL('css/images/target.png', _fCallBack);
//            _Object.on('added', function() {
//                _Object.off('added', arguments.callee);
//                _Object._addedObject();
//            });
        },
        _addedObject: function() {
            var _oCanvas = this.canvas;

        }
    });


    var MegaCircle = createClass(fabric.Circle, {
        initialize: function(_options) {
            var _Object = this;
            _Object.callSuper('initialize', _options);
//            _Object.on('added', function() {
//                _Object.off('added', arguments.callee);
//                _Object._addedObject();
//            });
        },
        _addedObject: function() {
            var _oCanvas = this.canvas;

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
//            var _width = $('body').width(),
//                _height = $('body').height();
            this._canvas = new fabric.Canvas('main_canvas', {selection: false});
//            this._canvas.setWidth(_width);
//            this._canvas.setHeight(_height);
            
            new SideManipulator({left: 0, top: 0,}, function(_oSideManipulator) {
                this._canvas.add(_oSideManipulator);
                this._targetImage = _oSideManipulator;
                this.adjustSize();
                this._circle = new MegaCircle({radius: 10, left: this._canvas.getCenter().left, top: this._canvas.getCenter().top, selectable: false, fill: 'rgb(100,100,200)'});
                this._canvas.add(this._circle);
                fabric.util.addListener(window, 'resize', this.adjustSize.bind(this));
                //$(window).resize(this.adjustSize.bind(this));
                this._initTextField();
                this._initEvents();
            }.bind(this));
//          
//            this._canvas.add(new fabric.Rect({
//                backgroundImage: 'css/images/target.png', backgroundImageStretch: true,
//                width: this._canvas.getWidth(), height: this._canvas.getHeight(),
//                left: 0, top: 0,
//                angle: 90
//              }));


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
            this._canvas.on('mouse:down', this.mouseDown.bind(this));
            this._canvas.on('mouse:move', this.mouseMove.bind(this));
            this._canvas.on('mouse:up', this.mouseUp.bind(this));

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
                
        isTarget: function(_oObject, _oEvent) {
            var tl = new fabric.Point(_oObject.getLeft(), _oObject.getTop()),
                    br = new fabric.Point(_oObject.getLeft() + _oObject.getWidth(), _oObject.getTop() + _oObject.getHeight());

            return _oEvent.e.offsetX > tl.x && _oEvent.e.offsetX < br.x &&
                    _oEvent.e.offsetY > tl.y && _oEvent.e.offsetY < br.y ? _oObject : null;
        },
        mouseDown: function(_oEvent) {
            var _nX = _oEvent.e.x,
                    _nY = _oEvent.e.y;
            
            if (this.isTarget(this._targetImage, _oEvent)) {
                this._observe = true;
                this._canvas.fire('mouse:move', _oEvent);
            }
        },
        mouseMove: function(_oEvent) {
            var _bIsTarget = this.isTarget(this._targetImage, _oEvent);
            if (!this._observe) {
                return;
            } else if (!_bIsTarget) {
                this._canvas.fire('mouse:up', _oEvent);
                return;
            }
            var _nX,
                    _nY,
                    _oPoint;
            if (_oEvent.e instanceof MouseEvent || (window.MSPointerEvent && _oEvent.e instanceof window.MSPointerEvent)) {
                _nX = _oEvent.e.offsetX,
                        _nY = _oEvent.e.offsetY;
            } else {
                _nX = _oEvent.e.touches[_oEvent.e.touches.length - 1].pageX,
                        _nY = _oEvent.e.touches[_oEvent.e.touches.length - 1].pageY;

            }
            this.moveShape(this._circle, _nX, _nY);
        },
        mouseUp: function(_fMouseDownCallBack, _oEvent) {

            if (this._observe) {
                this._observe = false;
                this.moveShape(this._circle, this._targetImage.getCenterPoint().x, this._targetImage.getCenterPoint().y);
            }
        },
        adjustSize: function() {
            //Временный Хак.
            //TODO: незабыть написать автору фреймворка
            //$('#page_1').css({height: '100%'});
//            canvas.width = window.innerWidth;
//            canvas.height = window.innerHeight;
            this._canvas.setHeight(this.getPreferredHeight());
            this._canvas.setWidth(this.getPreferredWidth());
            this._targetImage.scaleToHeight(this._canvas.getHeight());
                if (this._targetImage.getWidth() > this._canvas.getWidth()){
                    this._targetImage.scaleToWidth(this._canvas.getWidth());
                }
            if (!this._observe && this._circle) {
                this._circle.center();
            }
        },
        getPreferredHeight: function() {
            return window.innerHeight;
        },
        getPreferredWidth: function() {
            return window.innerWidth;
        },
        moveShape: function(_oShape, _x, _y, _bAnimate) {
            if (_oShape) {
                var _oCanvas = this._canvas;

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
        