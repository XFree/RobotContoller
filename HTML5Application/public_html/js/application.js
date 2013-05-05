/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function() {

    function loadSvgObject(_oCanvas) {
        fabric.loadSVGFromURL('js/img.svg', function(objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            _oCanvas.add(obj).renderAll();
        })
    }
    //var log = log4javascript.getDefaultLogger();
    var createClass = fabric.util.createClass;
    //fabric.util.extend(window,fabric.util);
    function getOrientation() {
        return  window.matchMedia("(orientation: portrait)").matches ? 'portrait' : 'landscape';
    }


    function isCoordsCont(tlX, tlY, brX, brY, _nX, _nY) {
        return _nX > tlX && _nX < brX && _nY > tlY && _nY < brY;
    }

    function isTarget(_oObject, _oEvent) {
        var _oOriginalEvent = _oEvent.originalEvent,
                _nX, _nY,
                _elementOffset = $(_oObject.canvas.lowerCanvasEl).offset(),
                _nOffsetObjectLeft = _elementOffset.left + _oObject.getLeft(),
                _nOffsetObjectTop = _elementOffset.top + _oObject.getTop(),
                _nOffsetObjectWidth = _nOffsetObjectLeft + _oObject.getWidth(),
                _nOffsetObjectHeight = _nOffsetObjectTop + _oObject.getHeight()
        if (_oEvent.data.type == 'mstouch' || _oEvent.data.type == 'mouse') {
            if (isCoordsCont(_nOffsetObjectLeft, _nOffsetObjectTop, _nOffsetObjectWidth, _nOffsetObjectHeight, _oOriginalEvent.pageX, _oOriginalEvent.pageY)) {
                _nX = _oOriginalEvent.pageX,
                        _nY = _oOriginalEvent.pageY;
            }
        } else if (_oEvent.data.type == 'wktouch') {
            var _aTouches = _oOriginalEvent.touches,
                    i = _aTouches.length;
            while (i--) {
                if (isCoordsCont(_nOffsetObjectLeft, _nOffsetObjectTop, _nOffsetObjectWidth, _nOffsetObjectHeight, _aTouches[i].pageX, _aTouches[i].pageY)) {
                    _nX = _aTouches[i].pageX,
                            _nY = _aTouches[i].pageY;
                    break;
                }
            }

        }

        return _nY ? {x: _nX, y: _nY} : null;
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
            this._observe = 0;
            this.mouseDown = this._mouseDown.bind(this);
            this.mouseMove = this._mouseMove.bind(this);
            this.mouseUp = this._mouseUp.bind(this);
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
            this.canvas.add(this._getCircle());
            //loadSvgObject(this.canvas);
            this._getCircle().bringToFront();
            this.canvas.renderAll();
            if (window.navigator.msPointerEnabled) {
                $(this.getCanvasEl()).on('MSPointerDown', {type: 'mstouch'}, this.mouseDown);
                $(this.getCanvasEl()).on('MSPointerMove', {type: 'mstouch'}, this.mouseMove);
                $(this.getCanvasEl()).on('MSPointerUp', {type: 'mstouch'}, this.mouseUp);
            } else {
                $(this.getCanvasEl()).on('touchstart', {type: 'wktouch'}, this.mouseDown);
                $(this.getCanvasEl()).on('touchmove', {type: 'wktouch'}, this.mouseMove);
                $(this.getCanvasEl()).on('touchend', {type: 'wktouch'}, this.mouseUp);
            }
            $(this.getCanvasEl()).on('mousedown', {type: 'mouse'}, this.mouseDown);
            $(this.getCanvasEl()).on('mousemove', {type: 'mouse'}, this.mouseMove);
            $(this.getCanvasEl()).on('mouseup', {type: 'mouse'}, this.mouseUp);

        },
        getCanvasEl: function() {
            return this.canvas.lowerCanvasEl;
        },
        _getCircle: function() {
            if (!this._circle) {
                this._circle = new fabric.Circle({radius: 20, left: this.getCenterPoint().x, top: this.getCenterPoint().y, selectable: false, stroke: '0000CC', fill: 'rgb(100,100,200)'});
                //this._circle = new fabric.Circle({radius: 100, left: 100, top: 100});
                this._circle.setGradient('fill', {
                    x1: 4, y1: -2, r1: this._circle.get('radius') / 10,
                    x2: 0, y2: 0, r2: this._circle.get('radius'),
                    colorStops: {
                        '0': "CCCCFF",
                        '0.4': "9933FF",
                        "0.8": "9900FF",
                        '1': "6600FF"}
                });
            }
            return this._circle;
        },
        _mouseDown: function(_oEvent) {
            _oEvent.preventDefault();
            if (isTarget(this, _oEvent)) {
                this._observe += 1;
                this.mouseMove(_oEvent);
            }
        },
        _mouseMove: function(_oEvent) {
            _oEvent.preventDefault();
            var _oOriginalEvent = _oEvent.originalEvent,
                    _oCoords = isTarget(this, _oEvent);
            if (this._observe <= 0) {
                return;
            } else if (!_oCoords) {
                this.mouseUp(_oEvent);
                return;
            }

            this.moveShape(this._getCircle(), _oCoords.x, _oCoords.y);
        },
        _mouseUp: function(_oEvent) {

            if (this._observe > 0) {
                this._observe -= 1;
                if (this._observe <= 0) {
                    this._observe = 0;
                    this.moveShape(this._getCircle(), this.getCenterPoint().x, this.getCenterPoint().y, false);
                }
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
                var _oCanvasOffset = _oCanvas._offset,
                        _x1 = _oCanvasOffset.left + this.getLeft() + this.getWidth()/2,
                        _y1 = _oCanvasOffset.top + this.getTop() + + this.getHeight()/2;
                var _nFullX = this.getWidth() / 200,
                        _nFullY = this.getHeight() / 200,
                        _nCurentPosX = _x - _x1,
                        _nCurentPosY = _y - _y1,
                        _nCoordX = (_nCurentPosX / _nFullX),
                        _nCoordY = -(_nCurentPosY / _nFullY);
                if (this._textField) {
                    this._textField.set({text: String(_nCoordX) + ' ' + String(_nCoordY)})
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
            this._canvas = new fabric.StaticCanvas('main_canvas', {selection: false});
            this.adjustSize();
            fabric.util.addListener(window, 'resize', this.adjustSize.bind(this));
            this._initTextField();
            new SideManipulator(undefined, {left: 0, top: 0}, function(_Object) {
                _Object.scaleToWidth(this._canvas.getWidth()/2);
                this._sideManipulator = _Object;
                this._sideManipulator._textField = this._textField;
                this._canvas.add(_Object);

            }.bind(this));

            this._initEvents();

        },
        _onOrientationChange: function(_oEvent) {
            alert('change');
        },
        _initEvents: function() {
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
            var text = new fabric.Text('', {fontSize: 15, left: 700, top: 500});
            text.originX = 'left';
            text.originY = 'top';
            this._canvas.add(text);
            this._textField = text;
        },
        adjustSize: function() {
            this._canvas.setHeight(this.getPreferredHeight());
            this._canvas.setWidth(this.getPreferredWidth());
            if (this._sideManipulator) {
                //this._sideManipulator.set({height: this.getPreferredHeight(), width: this.getPreferredWidth()});
                //this._sideManipulator.scaleToHeight(this.getPreferredHeight());
                //if (this._sideManipulator.getWidth() > this.getPreferredWidth()) {
                //    this._sideManipulator.scaleToWidth(this.getPreferredWidth());
                //}

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
