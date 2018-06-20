var packetHead = [0x80, 0x01]; //first byte += the id
var packetEnd = [0xFF];
var responses = {
    "acknowledge": [0x90, 0x41, 0x90, 0x51, 0xFF],
    "syntaxError": [0x90, 0x60, 0x02, 0xFF],
    "cannotExecute": [0x90, 0x61, 0x41, 0xFF]
};

var modes = {
    "zoom": {
        "byte": [0x04],
        "subModes": {
            "stop": [[0x07, 0x00], [], false],
            "teleStandard": [[0x07, 0x02], [], false],
            "wideStandard": [[0x07, 0x03], [], false],
            "teleVariable": [[0x07, 0x20], [], false], //+= speed
            "wideVariable": [[0x07, 0x30], [], false], //+= speed
            "direct": [[0x47], [], true] //+= zoom position
        }
    },
    "focus": {
        "byte": [0x04],
        "subModes": {
            "stop": [[0x08, 0x00], [], false],
            "farStandard": [[0x08, 0x02], [], false],
            "nearStandard": [[0x08, 0x03], [], false],
            "farVariable": [[0x08, 0x20], [], false], //+= speed
            "nearVariable": [[0x08, 0x30], [], false], //+= speed
            "autoFocus": [[0x38, 0x02], [], false], //+= zoom position
            "manualFocus": [[0x38, 0x03], [], false],
            "autoManual": [[0x38, 0x10], [], false],
            "direct": [[0x48], [], true]
        }
    },
    "panTilt": {
        "byte": [0x06],
        "subModes": {
            "up": [[0x01], [0x03, 0x01], true],
            "down": [[0x01], [0x03, 0x02], true],
            "left": [[0x01], [0x01, 0x03], true],
            "right": [[0x01], [0x02, 0x03], true],
            "upLeft": [[0x01], [0x01, 0x01], true],
            "upRight": [[0x01], [0x02, 0x01], true],
            "downLeft": [[0x01], [0x01, 0x02], true],
            "downRight": [[0x01], [0x02, 0x02], true],
            "stop": [[0x01], [0x03, 0x03], true],
            "absolutePosition": [[0x02], [], true],
            "relativePosition": [[0x03], [], true],
            "home": [[0x04], [], false] //+= speed
        }
    },
    "memory": {
        "byte": [0x04],
        "subModes": {
            "reset": [[0x3F, 0x00], [], true],
            "set": [[0x3F, 0x01], [], true],
            "recall": [[0x3F, 0x02], [], true],
        }
    }
}

module.exports = {
    modes: modes,
    responses: responses,
    success: function(message) {
        return message == responses.acknowledge;
    },
    generateBuffer: function generateBuffer(id, mode, action, value) {
        var startBuffer = Buffer.from([packetHead[0] + id, packetHead[1]]);
        var dataBuffer;
        var endBuffer = Buffer.from(packetEnd);
        //Find mode
        for(var key in modes) {
            if(mode == key) {
                //Find the submode
                for(var key2 in modes[key].subModes){
                    if(action == key2) {
                        dataBuffer = new Buffer(1 + modes[key].subModes[key2].length - 1);
                        dataBuffer.writeUInt8(modes[key].byte, 0);

                        var startDataBuffer = Buffer.from(modes[key].subModes[key2][0]);
                        var innerDataBuffer = new Buffer(0);
                        var endDataBuffer = Buffer.from(modes[key].subModes[key2][1]);

                        //If there is an expected value
                        if(modes[key].subModes[key2][2] == true) {
                            if(value !== undefined && value !== null && Buffer.isBuffer(value)) {
                                innerDataBuffer = value;
                            }
                            else {
                                return "Error: Value expected as an buffer";
                            }
                        }
                        dataBuffer = Buffer.concat([Buffer.from(modes[key].byte), startDataBuffer, innerDataBuffer, endDataBuffer]);
                    }
                }
            }
        }
        return Buffer.concat([startBuffer, dataBuffer, endBuffer]);
    }
}