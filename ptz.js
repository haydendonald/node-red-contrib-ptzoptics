var commands = require("./commands.js");
module.exports = function(RED)
{
    //Main Function
    function Ptz(config)
    {
        RED.nodes.createNode(this, config);
        var network = RED.nodes.getNode(config.network);
        var node = this;

        network.link(node);
        node.on("close", function() {
            network.server.close();
        });

        node.on("input", function(msg) {
            var good = false;
            for(var key in commands.modes) {
                if(key == msg.payload.mode) {good = true;}
            }
            if(good == false){showError(node, "Input Error", "Mode was not found, make sure msg.payload.mode exists"); return;}
            good = false;
            for(var key in commands.modes[msg.payload.mode].subModes) {
                if(key == msg.payload.action) {good = true;}
            }
            if(good == false){showError(node, "Input Error", "Action was not found, make sure msg.payload.action exists");}

            if(msg.payload.value !== undefined && msg.payload.value !== null){msg.payload.value = Buffer.from(msg.payload.value);}
            var buffer = commands.generateBuffer(1, msg.payload.mode, msg.payload.action, msg.payload.value);
            if(Buffer.isBuffer(buffer) == false){showError(node, "An Error Occured", "Some error occured while generating the buffer. This might be because there is a value expected but you did not pass one. Please check msg.payload.value"); return;}
        
            //Send it!
             network.server.send(buffer, function(state) {
                 if(state == true) {
                    node.status({fill:"green",shape:"dot",text:"Sent!"});
                 }
                 else {
                    node.error(node, "An error occured while sending the command, please check your connection");
                    node.status({fill:"red",shape:"dot",text:"Could not send"});
                 }
             }, function(message) {
                 return true;
             });
        });
    }
    RED.nodes.registerType("ptz-ptz", Ptz);
}

//Show an error
function showError(node, errorShort, errorLong) {
    node.error(errorLong);
    node.status({fill:"red",shape:"dot",text:errorShort});
}