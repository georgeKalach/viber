'use strict'

exports.zohoToChat = function(){
var socket = io();

    socket.emit("message", {message: text, name: name});
}