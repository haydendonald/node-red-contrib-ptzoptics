var tcp = require('net');
var outgoingBuffer = [];
var incomingBuffer = [];
var outgoingInterval;
var incomingInterval;
var incomingCallback = undefined;
var errorCallback = undefined;
var reconnectionCallback;
var handlerTimeout = 100;
var connected = false;
var server;
module.exports = {
    //Start the server
    connect: function connect(port, ipAddress, callback) {
        server = new tcp.Socket();
        server.connect(port, ipAddress, function() {
            connected = true;
            reconnectionCallback = callback;
            callback();
        });
        server.setKeepAlive(true, 1);

        //Listeners
        outgoingInterval = setInterval(outgoingHandler, handlerTimeout);
        incomingInterval = setInterval(incomingHandler, handlerTimeout);
        server.on("data", function(message){
            if(incomingBuffer.includes(message) == false) {
                incomingBuffer.push(message);
            }
        });
        server.on("error", function(error) {
            errorCallback("socket", error);
        });
        server.on("close", function() {
            if(connected == true) {
                errorCallback("disconnected", "lost connection");
                server.connect(port, ipAddress, function() {
                    reconnectionCallback();
                    connected = true;
                });
                connected = false;
            }
        });
    },

    setIncomingCallback: function setIncomingCallback(callback) {
        incomingCallback = callback;
    },

    setErrorCallback: function setErrorCallback(callback) {
        errorCallback = callback;
    },

    close: function close() {
        connected = false;
        server.destroy();
        outgoingBuffer = [];
        incomingBuffer = [];
        clearInterval(outgoingInterval);
        clearInterval(incomingInterval);
    },

    addOn: function addOn(on, callback) {
        switch(on) {
            case "error": server.on("error", callback); break;
            case "close": server.on("close", callback); break;
            case "data": server.on("data", callback); break;
        }
    },

    addOnce: function addOnce(once, callback) {
        switch(once) {
            case "error": server.once("error", callback); break;
            case "close": server.once("close", callback); break;
            case "data": server.once("data", callback); break;
        }
    },

    //Add something to be sent to the buffer
    send: function send(buffer, successCallback, responseCallback) {
        if(connected == true) {
            //If it already exists don't resend it
            var process = true;
            for(var i = 0; i < outgoingBuffer.length; i++) {
                if(outgoingBuffer[i].buffer.equals(buffer)) {
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
                outgoingBuffer.push(command);
            }
        }
        else {
            errorCallback("cannot send", "disconnected");
        }
    }

}

//Incoming Handler
function incomingHandler() {
    var remove = [];
    for(var i = 0; i < incomingBuffer.length; i++) {
        //Pass the message to the outgoing function handler(s)
        for(var j = 0; j < outgoingBuffer.length; j++){
            if(outgoingBuffer[j].responseCallback(incomingBuffer[i]) == true) {
                //Workaround for a "feature" where it'll crash cause its been deleted by the outgoing handler
                if(outgoingBuffer[i] !== undefined) {
                    outgoingBuffer[i].sent = true;
                }
            }
        }

        if(incomingCallback !== undefined) {
            incomingCallback(incomingBuffer[i]);
        }
        remove.push(i);
    }
    //Remove the elements from the array
    for(var i = 0; i < remove.length; i++) {
        incomingBuffer.splice(remove[i], 1);
    }
}

//Outgoing Handler
function outgoingHandler() {
    if(connected = true) {
        var remove = [];
        for(var i = 0; i < outgoingBuffer.length; i++) {
            if(outgoingBuffer[i].sent == false) {
                if(outgoingBuffer[i].timeout <= 0){ 
                    if(outgoingBuffer[i].retries > 3) {
                        //Failed
                        outgoingBuffer[i].successCallback(false);
                        remove.push(i);
                    }
                    else {
                        //Send
                        outgoingBuffer[i].retries += 1;
                        outgoingBuffer[i].timeout = 10 + (i * 5) + (outgoingBuffer[i].retries * 5);
                        server.write(outgoingBuffer[i].buffer);
                    }
                }
                else {
                    outgoingBuffer[i].timeout -= 1;
                }
            }
            else {
                //Success
                outgoingBuffer[i].successCallback(true);
                remove.push(i);
            }
        }
        //Remove the elements from the array
        for(var i = 0; i < remove.length; i++) {
            outgoingBuffer.splice(remove[i], 1);
        }
    }
}