var createClass = fabric.util.createClass;

// Coords of the accel x and y axises
var _ax;
var _ay;

var Accel = createClass({
    /**
     * X координата по акселерометру
     */
    getX : function () {
        return _ay;
    },

    /**
     * Y координата по акселерометру
     */
    getY : function () {
        return - _ax;
    },

    /**
     * Запуск учёта данных с акселерометра
     */
    start : function () {
        if (window.DeviceMotionEvent != undefined) {
	    window.ondevicemotion = function(e) {
		_ax = event.accelerationIncludingGravity.x * 1; /* TODO: scale coeff -- Aleksandr Vinokurov */
		_ay = event.accelerationIncludingGravity.y * 1;
		document.getElementById("accelerationX").innerHTML = e.accelerationIncludingGravity.x;
		document.getElementById("accelerationY").innerHTML = e.accelerationIncludingGravity.y;
	    }

            /* alert("Accelerometer started!"); */
        }
        else {
            /* alert("You do not have an accelerometer"); */
        }
    }
});
