    var Robot = createClass({
        connect: function (_cbConnectionOpen, _cbConnectionLost, _sImgSelector) {
            var _this = this;
            this._imgSelector = _sImgSelector;
            if (!!EventSource) {
                this._source = new EventSource('/dron/events');
                this._source.addEventListener('message', function(_oEvent) { _this.onServerMessage(_oEvent); }, false);
                this._source.addEventListener('open',    function(_oEvent) { _this.onConnectionOpen(_oEvent); }, false);
                this._source.addEventListener('open',    _cbConnectionOpen, false);
                this._source.addEventListener('error',   function(_oEvent) { _this.onConnectionLost(_oEvent); }, false);
                this._source.addEventListener('error',   _cbConnectionLost, false);
            }
        },
                
        onServerMessage: function () {
            $(_sImgSelector).attr("src", event.data);
            //$(_sImgSelector).attr("src", "data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");            
        },
                
        onConnectionOpen: function () {
            this._initialized = true;
        },
        
        onConnectionLost: function () {
          this._initialized = false;
          if (event.target.readyState === EventSource.CLOSED) {
            this._source.close();
            status.textContent = "Connection closed!";
          } else if (event.target.readyState === EventSource.CONNECTING) {
            status.textContent = "Connection closed. Attempting to reconnect!";
          } else {
            status.textContent = "Connection closed. Unknown error!";
          }            
        },
        
        takeOff: function(_cbDone, _cbFail) {
            if (this._initialized) {
                $.ajax({
                    url: '/dron/takeoff',
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({}),
                    dataType: 'json'
                }).done(_cbDone).fail(_cbFail);
            }
        },
        
        /**
         * @param {String} _sCommand "leftright"|"updown"|"rotate"
         * @param {Number} _nValue -1..1
         */        
        move: function (_sCommand, _nValue) {
            if (this._initialized) {
                $.ajax({
                    url: '/dron/move',
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({ command : _sCommand, value: _nValue }),
                    dataType: 'json'
                });
            }
        },
                
        land: function(_cbDone, _cbFail) {
            if (this._initialized) {
                $.ajax({
                    url: '/dron/land',
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({}),
                    dataType: 'json'
                }).done(_cbDone).fail(_cbFail);
            }
        }
    });