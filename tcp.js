const tcp = require('net');
module.exports = {
    object: function() { return {
        outgoingBuffer: [],
        incomingBuffer: [],
        outgoingInterval: undefined,
        incomingInterval: undefined,
        incomingCallback: undefined,
        errorCallback: undefined,
        reconnectionCallback: undefined,
        handlerTimeout: 100,
        connected: false,
        server: undefined,

        //Start the server
        connect: function connect(port, ipAddress, callback) {
            var object = this;
            this.server = new tcp.Socket();
            this.server.connect(port, ipAddress, function() {
                object.connected = true;
                object.reconnectionCallback = callback;
                callback();
            });
            this.server.setKeepAlive(true, 1);

            //Listeners
            this.outgoingInterval = setInterval(function(){object.outgoingHandler(object);}, this.handlerTimeout);
            this.incomingInterval = setInterval(function(){object.incomingHandler(object);}, this.handlerTimeout);
            this.server.on("data", function(message){
                if(object.incomingBuffer.includes(message) == false) {
                    object.incomingBuffer.push(message);
                }
            });
            this.server.on("error", function(error) {
                object.errorCallback("socket", error);
            });
            this.server.on("close", function() {
                if(object.connected == true) {
                    object.errorCallback("disconnected", "lost connection");
                    object.server.connect(port, ipAddress, function() {
                        object.reconnectionCallback();
                        object.connected = true;
                    });
                    object.connected = false;
                }
            });
        },

        setIncomingCallback: function setIncomingCallback(callback) {
            this.incomingCallback = callback;
        },

        setErrorCallback: function setErrorCallback(callback) {
            this.errorCallback = callback;
        },

        close: function close() {
            this.connected = false;
            this.server.destroy();
            this.outgoingBuffer = [];
            this.incomingBuffer = [];
            clearInterval(this.outgoingInterval);
            clearInterval(this.incomingInterval);
        },

        addOn: function addOn(on, callback) {
            switch(on) {
                case "error": this.server.on("error", callback); break;
                case "close": this.server.on("close", callback); break;
                case "data": this.server.on("data", callback); break;
            }
        },

        addOnce: function addOnce(once, callback) {
            switch(once) {
                case "error": this.server.once("error", callback); break;
                case "close": this.server.once("close", callback); break;
                case "data": this.server.once("data", callback); break;
            }
        },

        //Add something to be sent to the buffer
        send: function send(buffer, successCallback, responseCallback) {
            if(this.connected == true) {
                //If it already exists don't resend it
                var process = true;
                for(var i = 0; i < this.outgoingBuffer.length; i++) {
                    if(this.outgoingBuffer[i].buffer.equals(buffer)) {
                        process = false;
                    }
                }
                if(process == true) {
                    var command = {
                        "buffer": buffer,
                        "successCallback": successCallback,
                        "timeout": 0,
                        "sent": false,
                        "retries": 0,
                        "responseCallback": responseCallback
                    }
                    this.outgoingBuffer.push(command);
                }
            }
            else {
                errorCallback("cannot send", "disconnected");
            }
        },

        //Incoming Handler
        incomingHandler: function(object) {
            var remove = [];
            for(var i = 0; i < object.incomingBuffer.length; i++) {
                //Pass the message to the outgoing function handler(s)
                for(var j = 0; j < object.outgoingBuffer.length; j++){
                    if(object.outgoingBuffer[j].responseCallback(object.incomingBuffer[i]) == true) {
                        //Workaround for a "feature" where it'll crash cause its been deleted by the outgoing handler
                        if(object.outgoingBuffer[i] !== undefined) {
                            object.outgoingBuffer[i].sent = true;
                        }
                    }
                }

                if(object.incomingCallback !== undefined) {
                    object.incomingCallback(object.incomingBuffer[i]);
                }
                remove.push(i);
            }
            //Remove the elements from the array
            for(var i = 0; i < remove.length; i++) {
                object.incomingBuffer.splice(remove[i], 1);
            }
        },

        //Outgoing Handler
        outgoingHandler: function(object) {
            if(object.connected = true) {
                var remove = [];
                for(var i = 0; i < object.outgoingBuffer.length; i++) {
                    if(object.outgoingBuffer[i].sent == false) {
                        if(object.outgoingBuffer[i].timeout <= 0){ 
                            if(object.outgoingBuffer[i].retries > 3) {
                                //Failed
                                object.outgoingBuffer[i].successCallback(false);
                                remove.push(i);
                            }
                            else {
                                //Send
                                object.outgoingBuffer[i].retries += 1;
                                object.outgoingBuffer[i].timeout = 10 + (i * 5) + (object.outgoingBuffer[i].retries * 5);
                                object.server.write(object.outgoingBuffer[i].buffer);
                            }
                        }
                        else {
                            this.outgoingBuffer[i].timeout -= 1;
                        }
                    }
                    else {
                        //Success
                        object.outgoingBuffer[i].successCallback(true);
                        remove.push(i);
                    }
                }
                //Remove the elements from the array
                for(var i = 0; i < remove.length; i++) {
                    object.outgoingBuffer.splice(remove[i], 1);
                }
            }
        }
    }}
}