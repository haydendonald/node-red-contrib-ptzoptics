# node-red-contrib-kramer
Kramer Control for Node Red  
Tested Using the VP-774A

# In Development Not Ready For Use!


# Required MSG Object (Will also be the same on the output unless msg.topic is response in which case the msg.payload will be the response)
#### msg.payload.type*
The type of command to be set, can either be "set" or "get"
#### msg.payload.func*
The function to be processed, look below at the supported functions, can also be sent the raw command ID found in the offical documentation
#### msg.payload.param*
The parameters for the function, look below for the supported parameters, can also be sent the raw command ID found in the offical documentation
(* = required)
# List of Supported Commands
## msg.payload.func = "display mode"
* msg.payload.param = "single window"
* msg.payload.param = "picture In picture"
* msg.payload.param = "picture + picture"
* msg.payload.param = "split"
* msg.payload.param = "customized"
## msg.payload.func = "input source"
* msg.payload.param = "hdmi1"
* msg.payload.param = "hdmi2"
* msg.payload.param = "hdmi3"
* msg.payload.param = "hdmi4"
* msg.payload.param = "pc1"
* msg.payload.param = "pc2"
* msg.payload.param = "vc"
* msg.payload.param = "dp"
* msg.payload.param = "sdi"
## msg.payload.func = "input volume"
msg.payload.param = volume level (-20 -> 4) [dB]
## msg.payload.func = "output volume"
msg.payload.param = volume level (-80 -> 20) [dB]
## msg.payload.func = "mic1 volume"
msg.payload.param = volume level (-100 -> 12) [dB]
## msg.payload.func = "mic2 volume"
msg.payload.param = volume level (-100 -> 12) [dB]
## msg.payload.func = "mic1 mix"
msg.payload.param = volume level (-100 -> 1) [dB]
## msg.payload.func = "mix2 mix"
msg.payload.param = volume level (-100 -> 1) [dB]
## msg.payload.func = "line mix"
msg.payload.param = volume level (-100 -> 0) [dB]

[More Commands Avaliable in The Documentation on Page 104 ->](https://k.kramerav.com/downloads/manuals/vp-774a_rev_2.pdf#page=112 "Documentation")
