/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function() {

    //var log = log4javascript.getDefaultLogger();
    var createClass = fabric.util.createClass;
    function addMouseEvent(_oObject, _sEventName, _fEventCallback) {
        var _sTouchEventName,
                _bMsSupport = window.navigator.msPointerEnabled,
                _sType = _bMsSupport ? 'mstouch' : 'wktouch',
                _fCallBack = function(_oEvent) {
            _oEvent.preventDefault();
            _fEventCallback.apply(this, arguments);
        };
        switch (_sEventName) {
            case 'mousedown':
                _sTouchEventName = _bMsSupport ? 'MSPointerDown' : 'touchstart';
                break;
            case 'mouseup':
                _sTouchEventName = _bMsSupport ? 'MSPointerUp' : 'touchend';
                break;
            case 'mousemove':
                _sTouchEventName = _bMsSupport ? 'MSPointerMove' : 'touchmove';
                break;
            case 'mouseout':
                if (_bMsSupport) {
                    _sTouchEventName = 'MSPointerOut';
                }
        }
        if (_sTouchEventName) {
            $(_oObject).on(_sTouchEventName, {type: _sType}, _fCallBack);
        }


        $(_oObject).on(_sEventName, {type: 'mouse'}, _fEventCallback);

    }
    ;
    function isCoordsCont(tlX, tlY, brX, brY, _nX, _nY) {
        var dx = _nX - (tlX + brX) / 2;
        var dy = _nY - (tlY + brY) / 2;
        var R = (brY - tlY) / 2;
        return (dx * dx + dy * dy) <= R * R;
        /*return _nX > tlX && _nX < brX && _nY > tlY && _nY < brY; */
    }

    function isTarget(_oObject, _oEvent) {
        var _oOriginalEvent = _oEvent.originalEvent,
                _nX, _nY,
                _elementOffset = _oObject.canvas._offset,
                _nOffsetObjectLeft = _elementOffset.left + _oObject.getLeft() - (_oObject.get('originX') == 'center' ? _oObject.getWidth() / 2 : 0),
                _nOffsetObjectTop = _elementOffset.top + _oObject.getTop() - (_oObject.get('originY') == 'center' ? _oObject.getHeight() / 2 : 0),
                _nOffsetObjectWidth = _nOffsetObjectLeft + _oObject.getWidth(),
                _nOffsetObjectHeight = _nOffsetObjectTop + _oObject.getHeight();
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

    var SideManipulator = createClass(fabric.Object, {
        initialize: function(_options, _fCallBack) {
            this._observe = 0;
            this.mouseDown = this._mouseDown.bind(this);
            this.mouseMove = this._mouseMove.bind(this);
            this.mouseUp = this._mouseUp.bind(this);

            this.isTarget = isTarget.bind(this, this);
            this._onCreate(_options, _fCallBack);
        },
        _render: function(ctx) {
        },
        _createCircleObject: function(_fCallback) {
            if (this._circle && this._circle.getWidth() == (this._getPreferredCircleRadius() * 2)) {
                this._circle.bringToFront();
                if (typeof _fCallback == 'function') {
                    _fCallback.apply(this);
                }
            } else {
                var _oCircle = this._getCircle();
                _oCircle.cloneAsImage(function(_oImg) {
                    _oCircle = null;
                    _oImg.set({left: this.getCenterPoint().x, top: this.getCenterPoint().y,
                        perPixelTargetFind: true});
                    if (this.canvas) {
                        this.canvas.remove(this._circle);
                        delete this._circle;
                        this._circle = _oImg;
                        this.canvas.add(this._circle);
                        this._circle.bringToFront();
                    } else {
                        this.on('added', function() {
                            this.off('added', arguments.callee);
                            this.canvas.remove(this._circle);
                            delete this._circle;
                            this._circle = _oImg;
                            this.canvas.add(this._circle);
                            this._circle.bringToFront();
                        }.bind(this));
                    }

                    if (typeof _fCallback == 'function') {
                        _fCallback.apply(this);
                    }
                }.bind(this));
            }
        },
        _getBackgroundObject: function(_options) {
            var _oCircle = new fabric.Circle(_options);

            _oCircle.setGradient('fill', {
                x1: 0, y1: 0, r1: _oCircle.get('radius') / 10,
                x2: 0, y2: 0, r2: _oCircle.get('radius'),
                opacity: 0.3,
                colorStops: {
                    '0': "white",
                    '0.2': "black",
                    '0.6': "gray",
                    '0.8': "black",
                    '1': "white"}
            });
            return _oCircle;
        },
        _createBackgroundObject: function(_options, _fCallBack) {
            var _default = $.extend({}, _options, {originX: 'center', originY: 'center', selectable: false, transparentCorners: true, opacity: 0.7, stroke: 'black'});
            this._getBackgroundObject(_default).cloneAsImage(function(_oImg) {
                //Сохранить в картинку
                //window.open(document.getElementById("canvas").toDataURL("image/png"),"tfract_save");
                _oImg.set({top: this.getTop(), left: this.getLeft(), perPixelTargetFind: true,
                    selectable: this.get('selectable'),
                    originX: this.get('originX'),
                    originY: this.get('originY')});

                if (this.canvas) {
                    this.canvas.remove(this._backgroundObject);
                    delete this._backgroundObject;
                    this._backgroundObject = _oImg;
                    this.canvas.add(this._backgroundObject);
                } else {
                    this.on('added', function() {
                        this.off('added', arguments.callee);
                        this.canvas.remove(this._backgroundObject);
                        delete this._backgroundObject;
                        this._backgroundObject = _oImg;
                        this.canvas.add(this._backgroundObject);
                    }.bind(this));
                }
                _fCallBack.apply(this);
            }.bind(this));
        },
        setRadius: function(_nRadius) {
            //FIXME: Есть проблема с перерисовкой, если объект не пересоздается
            if (false && this.get('radius') == _nRadius) {
                return;
            }
            fabric.Circle.prototype.setRadius.apply(this, arguments);
            //this.callSuper('setRadius', _nRadius);
            if (this._backgroundObject) {
                this._backgroundObject.set({width: this.getWidth(), height: this.getHeight()});
                if (this._circle) {
                    this._circle.set({left: this.getCenterPoint().x, top: this.getCenterPoint().y})
                }
                if (this.canvas) {
                    this.canvas.renderAll();
                }
                setTimeout(this._reCreateObjects.bind(this), 1);
            }
        },
        _reCreateObjects: function() {
            var _options = {left: this._backgroundObject.getLeft(), top: this._backgroundObject.getTop(), originX: this._backgroundObject.getOriginX(), originY: this._backgroundObject.getOriginY(), radius: this.getWidth() / 2};
            this._createBackgroundObject(_options, this._createCircleObject.bind(this, function() {
                this.canvas.renderAll();
            }.bind(this)));
        },
        _onCreate: function(_options, _fCallBack) {
            fabric.Circle.prototype.initialize.apply(this, arguments);
            //this.callSuper('initialize', _options);
            this.on('added', function() {
                this.off('added', arguments.callee);
                this._addedObject();
            }.bind(this));
            this._createBackgroundObject(_options, this._createCircleObject.bind(this, _fCallBack.bind(this, this)));

        },
        _setAccelerometerActivate: function(_bActivate) {
/*            $(window).bind('devicemotion', function(_oJQEvent) {
                var _oOriginalEvent = _oJQEvent.originalEvent,
                        _oRotationRate = _oOriginalEvent.rotationRate,
                        _oAcceleration = _oOriginalEvent.acceleration,
                        _oAccelerationIncludingGravity = _oOriginalEvent.accelerationIncludingGravity,

            }.bind(this));
*/
            alert("*****Accelerometer activated!");
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

            this.canvas.renderAll();
            addMouseEvent(this.getCanvasEl(), 'mousedown', this.mouseDown);
            addMouseEvent(this.getCanvasEl(), 'mousemove', this.mouseMove);
            addMouseEvent(this.getCanvasEl(), 'mouseup', this.mouseUp);
            addMouseEvent(this.getCanvasEl(), 'mouseout', this.mouseUp);
//            if (window.navigator.msPointerEnabled) {
//                //$(this.getCanvasEl()).on('MSPointerDown', {type: 'mstouch'}, this.mouseDown);
//                //$(this.getCanvasEl()).on('MSPointerMove', {type: 'mstouch'}, this.mouseMove);
//                //$(this.getCanvasEl()).on('MSPointerUp', {type: 'mstouch'}, this.mouseUp);
//                //$(this.getCanvasEl()).on('MSPointerCancel', {type: 'mstouch'}, this.mouseUp); 
//                //$(this.getCanvasEl()).on('MSPointerOut', {type: 'mstouch'}, this.mouseUp); 
//
//            } else {
//                $(this.getCanvasEl()).on('touchstart', {type: 'wktouch'}, this.mouseDown);
//                $(this.getCanvasEl()).on('touchmove', {type: 'wktouch'}, this.mouseMove);
//                $(this.getCanvasEl()).on('touchend', {type: 'wktouch'}, this.mouseUp);
//            }
//
//            $(this.getCanvasEl()).on('mousedown', {type: 'mouse'}, this.mouseDown);
//            $(this.getCanvasEl()).on('mousemove', {type: 'mouse'}, this.mouseMove);
//            $(this.getCanvasEl()).on('mouseup', {type: 'mouse'}, this.mouseUp);
//            $(this.getCanvasEl()).on('mouseout', {type: 'mouse'}, this.mouseUp);

        },
        getCanvasEl: function() {
            return this.canvas.lowerCanvasEl;
        },
        getCircle: function() {
            return this._circle;
        },
        _getPreferredCircleRadius: function() {
            return (this.get('radius') / 8 > 20) ? this.get('radius') / 8 : 20;
        },
        _getCircle: function() {
            var _oCircle = new fabric.Circle({radius: this._getPreferredCircleRadius(), left: this.getCenterPoint().x, top: this.getCenterPoint().y, selectable: false, stroke: '0000CC'});
            //this._circle = new fabric.Circle({radius: 100, left: 100, top: 100});
            _oCircle.setGradient('fill', {
                x1: 4, y1: -2, r1: _oCircle.get('radius') / 10,
                x2: 0, y2: 0, r2: _oCircle.get('radius'),
                colorStops: {
                    '0': "CCCCFF",
                    '0.4': "9933FF",
                    "0.8": "9900FF",
                    '1': "9900FF"}
            });
            return _oCircle;
        },
        _mouseDown: function(_oEvent) {
            _oEvent.preventDefault();
            if (this.isTarget(_oEvent)) {
                this._observe += 1;
                this.mouseMove(_oEvent);
            }
        },
        _mouseMove: function(_oEvent) {
            if (!this._usingAccel) {
                _oEvent.preventDefault();
                var _oOriginalEvent = _oEvent.originalEvent,
                _oCoords = this._observe > 0 ? this.isTarget(_oEvent) : null;
                if (_oCoords) {
                    this.moveShape(this.getCircle(), _oCoords.x, _oCoords.y);
                }
            }
        },
        _mouseUp: function(_oEvent) {
            _oEvent.preventDefault();
            if (this._observe > 0) {
                this._observe -= 1;
                if (this._observe <= 0) {
                    this._observe = 0;
                    this.moveShape(this.getCircle(), this.getCenterPoint().x, this.getCenterPoint().y, false);
                }
            }
        },
        timerMove: function() {
/*            var landscapeOrientation = window.innerWidth/window.innerHeight > 1;
		if ( landscapeOrientation) {
			vx = vx + ay;
			vy = vy + ax;
		} else {
			vy = vy - ay;
			vx = vx + ax;
		}
		vx = vx * 0.98;
		vy = vy * 0.98;
		y = parseInt(y + vy / 50);
		x = parseInt(x + vx / 50);
*/
            if (this._observe > 0) {
                var _accel = this._accel;
                var _x = this._normalizeAxis(_accel.getX() / 7);
                var _y = this._normalizeAxis(_accel.getY() / 7);

                var _oCanvas = this.canvas,
                _oCanvasOffset = _oCanvas._offset,
                _x1 = _oCanvasOffset.left + this.getLeft() + this.getWidth() / 2,
                _nXMax = _oCanvasOffset.left + this.getLeft() + this.getWidth(),
                _y1 = _oCanvasOffset.top + this.getTop() + +this.getHeight() / 2,
                _nYMax = _oCanvasOffset.top + this.getHeight() + this.getHeight();
                var _nFullX = this.getWidth() / 2,
                _nFullY = this.getHeight() / 2,
                _nCurentPosX = _x - _x1,
                _nCurentPosY = _y - _y1,
                _nCoordX = (_nCurentPosX / _nFullX),
                _nCoordY = -(_nCurentPosY / _nFullY);

                var nCurPosX = _x * _nFullX;
                var nCurPosY = - _y * _nFullY;
                var x = nCurPosX + _x1;
                var y = nCurPosY + _y1;

                this.moveShape(this.getCircle(), x, y);
            }
        },
        _normalizeAxis: function(_val) {
            return  Math.max(-1, Math.min(1, _val));
        }.bind(this),
        setAccelMove: function(_accel) {
            this._accel = _accel;
            this._accelMoveTimer = setInterval(this.timerMove.bind(this), 10);
            this._usingAccel = true;
        },
        getX: function () {
            return this._coordX ? this._coordX : 0;
        },

        getY: function () {
            return this._coordY ? this._coordY : 0;
        },
        moveShape: function(_oShape, _x, _y, _bAnimate) {
            if (_oShape) {
                var _oCanvas = this.canvas,
                        _oCanvasOffset = _oCanvas._offset,
                        _x1 = _oCanvasOffset.left + this.getLeft() + this.getWidth() / 2,
                        _nXMax = _oCanvasOffset.left + this.getLeft() + this.getWidth(),
                        _y1 = _oCanvasOffset.top + this.getTop() + +this.getHeight() / 2,
                        _nYMax = _oCanvasOffset.top + this.getHeight() + this.getHeight();
                var _nFullX = this.getWidth() / 2,
                        _nFullY = this.getHeight() / 2,
                        _nCurentPosX = _x - _x1,
                        _nCurentPosY = _y - _y1,
                        _nCoordX = (_nCurentPosX / _nFullX),
                        _nCoordY = -(_nCurentPosY / _nFullY);
                this._coordX = _nCoordX;
                this._coordY = _nCoordY;
//                if (this._textField) {
//                    this._textField.set({text: String(_nCoordX.toFixed(2)) + ' ' + String(_nCoordY.toFixed(2))});
//                    this._textField.bringToFront();
//                }

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
        getCanvasEl: function() {
            return this._canvas ? this._canvas.lowerCanvasEl : null;
        },
        initialize: function() {
            this._robotApi = new Robot();
            this._accel = new Accel();
            this._accel.start();
            this._canvas = new fabric.StaticCanvas('main_canvas', {selection: false, backgroundImage: 'dron2.jpg', backgroundImageStretch: true});
            this.adjustSize();
            $(window).resize(this.adjustSize.bind(this));
            //this._initTextField();
            new SideManipulator({left: this._gerPreferredLeftManipulator1(), top: this._gerPreferredTopManipulator1(), originX: 'left', originY: 'top', radius: this._getPreferredSideRadius()}, function(_Object) {
                this._sideManipulator = _Object;
                //this._sideManipulator._textField = this._textField;
                this._canvas.add(_Object);

            }.bind(this));

            //var t = this._getPreferredSideRadius();
            new SideManipulator({left: this._gerPreferredLeftManipulator2(), top: this._gerPreferredTopManipulator2(), originX: 'left', originY: 'top', radius: this._getPreferredSideRadius()}, function(_Object) {
                this._sideManipulator2 = _Object;
                //this._sideManipulator._textField = this._textField;
                this._canvas.add(_Object);
                if (window.ondevicemotion && confirm("Use accelerometer?")) {
                    /* Using Accelerometer as input device for this manipulator */
                    _Object.setAccelMove(this._accel);
                }
                else {
                    /* Using touchscreen as input device for this manipulator */
                    /* This is the default */
                }
            }.bind(this));
            this._startStopButton = this._createStartStopButton(function(_oEvent) {
                if (isTarget(this._startStopButton, _oEvent)) {
                    switch (this._startStopButtonState) {
                    case 'flying':
                      console.log(new Date() + ': land')
                        this._robotApi.land();
                        break;
                    case 'landed':
                        this._robotApi.takeOff();
                        break;
                    }
                }
            }.bind(this));
            this._setStartStopButtonState('uninited');
            this._canvas.add(this._startStopButton);
            this._initEvents();

        },
        _getPreferredStartStopSize: function() {
            return (this._getPreferredSideRadius() / 8 > 20) ? this._getPreferredSideRadius() / 8 : 20;
        },
        _gerPreferredTopManipulator1: function() {
            return this.getPreferredHeight() < this.getPreferredWidth() ? this._canvas.getCenter().top - this._getPreferredSideRadius() : 0;
        },
        _gerPreferredTopManipulator2: function() {
            return this.getPreferredHeight() < this.getPreferredWidth() ? this._gerPreferredTopManipulator1() : this.getPreferredHeight() - this._getPreferredSideRadius() * 2;
        },
        _gerPreferredLeftManipulator1: function() {
            return  0;
        },
        _gerPreferredLeftManipulator2: function() {
            return  this.getPreferredHeight() < this.getPreferredWidth() ? this.getPreferredWidth() - (this._getPreferredSideRadius() * 2) : this._gerPreferredLeftManipulator1();

        },
        _createStartStopButton: function(_fCallBack) {
            var _nRadius = this._getPreferredStartStopSize();
            var _oCircle = new fabric.Circle({radius: _nRadius, left: this._canvas.getCenter().left, top: (this.getPreferredHeight() - _nRadius) - 5, selectable: false, stroke: '0000CC', fill: '9900FF'});
            if (typeof _fCallBack == 'function') {
                addMouseEvent(this.getCanvasEl(), 'mousedown', _fCallBack.bind(_oCircle));
            }
            //
            //this._circle = new fabric.Circle({radius: 100, left: 100, top: 100});
//            _oCircle.setGradient('fill', {
//                x1: 4, y1: -2, r1: _nRadius / 10,
//                x2: 0, y2: 0, r2: _nRadius,
//                colorStops: {
//                    '0': "CCCCFF",
//                    '0.4': "9933FF",
//                    "0.8": "9900FF",
//                    '1': "9900FF"}
//            });
            return _oCircle;
        },
        _initEvents: function() {
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
            $(this._canvas.upperCanvasEl).on("contextmenu", function(e) {
                e.preventDefault();
            }, false);
            // Disables menu
        },
        _initTextField: function() {
            var text = new fabric.Text('', {fontSize: 15});
            text.originX = 'left';
            text.originY = 'top';
            this._canvas.add(text);
            this._textField = text;
        },
        _getPreferredSideRadius: function() {
            return ((this.getPreferredHeight() < this.getPreferredWidth() ? this.getPreferredHeight() : this.getPreferredWidth()) / 2).toFixed() - 20;
        },
        adjustSize: function(_oEvent) {
            this._canvas.setHeight(this.getPreferredHeight());
            this._canvas.setWidth(this.getPreferredWidth());

            if (this._sideManipulator) {

                this._sideManipulator.set({top: this._gerPreferredTopManipulator1(), left: this._gerPreferredLeftManipulator1()});
                this._sideManipulator.setRadius(this._getPreferredSideRadius());

            }
            if (this._sideManipulator2) {

                this._sideManipulator2.set({top: this._gerPreferredTopManipulator2(), left: this._gerPreferredLeftManipulator2()});
                this._sideManipulator2.setRadius(this._getPreferredSideRadius());

            }

            this._canvas.clear();
            if (this._startStopButton) {
                this._startStopButton.setRadius(this._getPreferredStartStopSize());
                this._startStopButton.set({left: this._canvas.getCenter().left, top: this.getPreferredHeight() - this._startStopButton.getHeight() - 5});
                this._startStopButton.bringToFront();
            }

            setTimeout(this._canvas.renderAll.bind(this._canvas), 1);

        },
        getPreferredHeight: function() {
            return document.getElementById('joystik').clientHeight;
        },
        getPreferredWidth: function() {
            return document.getElementById('joystik').clientWidth;
        },
        start: function() {
            if (this._robotApi) {
                this._robotApi.connect(this._onReadyState.bind(this), this._onConnectionLost.bind(this), this._onImgChanged.bind(this));
            }
        },
        stop: function() {
        },

        _onReadyState: function(_sState) {
            this._setStartStopButtonState(_sState);
            switch(_sState) {
                case 'flying':
                    if (!this._timer) {
                        this._timer = setInterval(this._sendControls.bind(this), 200);
                    }
                    break;
                case 'landed':
                    if (this._timer) {
                        clearInterval(this._timer);
                        this._timer = null;
                    }
                    break;
            }
        },
                
        _onConnectionLost: function (_bType) {
            if (_bType != 'connecting') {
                this.start();
            }
        },
                
        _onImgChanged: function (_sImage) {
            if (this._canvas) {
                this._canvas.setBackgroundImage(_sImage);
            }
        },
                
//        _sendControls: function () {
//          this._robotApi.move('forwardbackward', this._sideManipulator.getY());
//          this._robotApi.move('leftright', this._sideManipulator.getX());
//          this._robotApi.move('updown', this._sideManipulator2.getY());
//          this._robotApi.move('rotate', this._sideManipulator2.getX());
//        },

        _sendControls: function () {
            this._robotApi.move({
                forwardbackward : this._sideManipulator.getY(),
                leftright : this._sideManipulator.getX(),
                updown : this._sideManipulator2.getY(),
                rotate : this._sideManipulator2.getX()
            });
        },
                
        _setStartStopButtonState: function (_sState) {
          if (this._startStopButtonState != _sState) {
                this._startStopButtonState = _sState;
                switch (this._startStopButtonState) {
                    case 'flying':
                        this._startStopButton.setFill("blue");
                        break;
                    case 'landed':
                        this._startStopButton.setFill("green");
                        break;
                    default:
                        this._startStopButton.setFill("red");
                }
                this._canvas.renderAll();
            }   
        }
    });
    $(window).on('load', function() {
        (new JoyStikApplication()).start();
    });
})();
