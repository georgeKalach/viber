'use strict'

// var ws = require('ws')

//     var clients = {};
//     var socketServer = new ws.Server({
//         port : 3000
//     })
//     socketServer.on('connection', (socket) => {
//         var id = Math.random();
//         clients[id] = socket;
//         console.log("новое соединение " + id);
//         socket.on('message', (msg) => {
//             console.log('получено сообщение ' + msg);
//             for(var key in clients){
//                 clients[key].send(msg);
//             }
//         })
//         socket.on('close', () => {
//             console.log('соединение закрыто ' + id);
//             delete clients[id];
//         })
//     })
