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
                if (this._textField) {
                    this._textField.set({text: String(_nCoordX.toFixed(2)) + ' ' + String(_nCoordY.toFixed(2))});
                    this._textField.bringToFront();
                }

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
            this._initTextField();
            new SideManipulator({left: this._gerPreferredLeftManipulator1(), top: this._gerPreferredTopManipulator1(), originX: 'left', originY: 'top', radius: this._getPreferredSideRadius()}, function(_Object) {
                this._sideManipulator = _Object;
                this._sideManipulator._textField = this._textField;
                this._canvas.add(_Object);

            }.bind(this));

            //var t = this._getPreferredSideRadius();
            new SideManipulator({left: this._gerPreferredLeftManipulator2(), top: this._gerPreferredTopManipulator2(), originX: 'left', originY: 'top', radius: this._getPreferredSideRadius()}, function(_Object) {
                this._sideManipulator2 = _Object;
                //this._sideManipulator._textField = this._textField;
                this._canvas.add(_Object);
                if (confirm("Use accelerometer?")) {
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
                        this._timer = setInterval(this._sendControls.bind(this), 100);
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
            // TODO : заблокировать контролы?
        },
                
        _onImgChanged: function (_sImage) {
            if (this._canvas) {
                this._canvas.setBackgroundImage(_sImage);
//                var src = "data:image/gif;base64,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";
//                this._canvas.setBackgroundImage(src);
            }
        },
                
        _sendControls: function () {
            this._robotApi.move('forwardbackward', this._sideManipulator.getY());
            this._robotApi.move('leftright', this._sideManipulator.getX());
            this._robotApi.move('updown', this._sideManipulator2.getY());
            this._robotApi.move('rotate', this._sideManipulator2.getX());
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
