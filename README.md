# node-red-contrib-ptzoptics
TCP Control for PTZ Optics cameras via Node Red
Tested Using the PT20X

# In the testing phase, might have bugs, use at your own risk.

# Required MSG Object
#### msg.payload.mode*
The mode to be sent to the camera, look below for supported modes
#### msg.payload.action*
The action to be sent to the camera under the mode
#### msg.payload.value*
If the command requires a value these will be passed here as an array of hex. Example: msg.payload.value = [0x01] will select preset 1 if passed to the memory recall function
(* = required)
# List of Supported Commands
## msg.payload.mode = "zoom"
* msg.payload.action = "stop"
* msg.payload.action = "teleStandard"
* msg.payload.action = "wideStandard"
* msg.payload.action = "teleVariable"
* msg.payload.action = "wideVariable"
* msg.payload.action = "direct"*
## msg.payload.mode = "focus"
* msg.payload.action = "stop"
* msg.payload.action = "farStandard"
* msg.payload.action = "nearStandard"
* msg.payload.action = "farVariable"
* msg.payload.action = "nearVariable"
* msg.payload.action = "autoFocus"
* msg.payload.action = "manualFocus"
* msg.payload.action = "autoManual"
* msg.payload.action = "direct"*
## msg.payload.mode = "panTilt"
* msg.payload.action = "stop"*
* msg.payload.action = "absolutePosition"*
* msg.payload.action = "relativePosition"*
* msg.payload.action = "home"
## msg.payload.mode = "memory"
* msg.payload.action = "reset"*
* msg.payload.action = "set"*
* msg.payload.action = "recall"*
(* = requires a msg.payload.value to be passed. Look at the offical documentation)

[More Commands Avaliable in The Documentation->](https://ptzoptics.com/wp-content/uploads/2014/09/PTZOptics_TCP_UDP_CGI_Control-1.pdf" "Documentation")
