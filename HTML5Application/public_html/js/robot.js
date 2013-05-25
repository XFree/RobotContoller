   var createClass = fabric.util.createClass;
   
   var Robot = createClass({
       /**
        * Подключение к серверу управления дроном.
        * @param {Function} _cbReadyState обработчик изменения статуса.
        * @param {Function} _cbConnectionLost обработчик ошибки.
        * @param {String} _cbImgShow обработчик отображения полученной с сервера картинки.
        */
        connect: function (_cbReadyState, _cbConnectionLost, _cbImgShow) {
            this._cbImgShow = _cbImgShow;
            this._cbReadyState = _cbReadyState;
            this._cbConnectionLost = _cbConnectionLost;
            this._readyState = null;
            if (!!window.EventSource) {
                this._source = new EventSource('/dron/events');
                this._source.addEventListener('message', this._onServerMessage.bind(this), false);
                this._source.addEventListener('open',    this._onConnectionOpen.bind(this), false);
                this._source.addEventListener('error',   this._onConnectionLost.bind(this), false);
            }
            return this._source;
        },
                
        /**
         * Обработчик события сервера.
         * @param {Event} _oEvent событие.
         */        
        _onServerMessage: function (_oEvent) {
            var _oMessage  = JSON.parse(_oEvent.data);
          for (var k in _oMessage) {
            switch(k) {
              case 'readystate':
                if (this._cbReadyState && this._readyState != _oMessage[k]) {
                  this._readyState = _oMessage[k];
                  this._cbReadyState(this._readyState);
                }
                break;
              case 'img':
                this._cbImgShow(_oMessage[k]);
            }
          }

            //$(_sImgSelector).attr("src", "data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");            
        },
        
        /**
         * Обработчик успешного открытия соединения.
         */        
        _onConnectionOpen: function () {
            this._initialized = true;
        },
        
        /**
         * Обработчик ошибоки при соединении с сервером.
         */        
        _onConnectionLost: function (_oEvent) {
          this._initialized = false;
          if (_oEvent.target.readyState === EventSource.CLOSED) {
            this._cbConnectionLost('closed');
            this._cbReadyState = null;
            this._readyState = null;
            this._cbConnectionLost = null;
            this._source.close();
            //status.textContent = "Connection closed!";
        } else if (_oEvent.target.readyState === EventSource.CONNECTING) {
            this._readyState = null;
            this._cbConnectionLost('connecting');
            //status.textContent = "Connection closed. Attempting to reconnect!";
        } else {
            this._cbConnectionLost('unknown');
            //status.textContent = "Connection closed. Unknown error!";
        }
    },
    /**
     * Взлет.
     * @param {Function} _cbDone обработчик успешного взлета.
     * @param {Function} _cbFail обработчик ошибки при взлете.
     */
    takeOff: function(_cbDone, _cbFail) {
        if (this._initialized) {
            $.ajax({
                url: '/dron/takeoff',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({}),
                dataType: 'json'
            }).done(_cbDone).fail(_cbFail);
        }
    },
    /**
     * Движение.
     * @param {String} _sCommand "forwardbackward"|"leftright"|"updown"|"rotate"
     * @param {Number} _nValue -1..1
     */
    move: function(_sCommand, _nValue) {
        if (this._initialized) {
            $.ajax({
                url: '/dron/move',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({command: _sCommand, value: _nValue}),
                dataType: 'json'
            });
        }
    },
    /**
     * Приземление.
     * @param {Function} _cbDone обработчик успешного взлета.
     * @param {Function} _cbFail обработчик ошибки при взлете.
     */
    land: function(_cbDone, _cbFail) {
        if (this._initialized) {
            $.ajax({
                url: '/dron/land',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({}),
                dataType: 'json'
            }).done(_cbDone).fail(_cbFail);
        }
    }
});
