/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var JoyStikApplication = atom.declare('JoyStikApplication');

JoyStikApplication.MoveController = atom.declare('JoyStikApplication.MoveController', {
    initialize: function(id) {
        alert(id);
    }});

JoyStikApplication.prototype.initialize = function() {
    this._moveController = new JoyStikApplication.MoveController(1);
    $('#test_orientation').text('ready');
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
};

$(function() {
    new JoyStikApplication();
});
