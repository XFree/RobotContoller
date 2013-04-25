/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var createClass = fabric.util.createClass,
        createAccessors = fabric.util.createAccessors;
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


var JoyStikApplication = createClass({
    adjustSize: function() {
        //Временный Хак.
        //TODO: незабыть написать автору фреймворка
        this._canvas.setHeight(this.getPreferredHeight());
        this._canvas.setWidth(this.getPreferredWidth());
    },
    
    getPreferredHeight: function(){
      return $('#page_1').parent().height();
    },
            
    getPreferredWidth: function(){
      return $('#page_1').parent().width();
    },
    
    initialize: function() {
        this._canvas = new fabric.Canvas('main_canvas');
        this._canvas.add(new fabric.Circle({width: 10, height: 10, radius: 10, x: 10, y: 10, selectable: true}));
        this.adjustSize();
        $(window).resize(this.adjustSize);
    },
    start: {
    }
});




$(function() {
    var app = new JoyStikApplication();
    //bindOrientationEvents();
});
