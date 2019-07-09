import React, {Component} from "react";
import openSocket from "socket.io-client";
export const socket = openSocket("http://" + document.domain + ":8000");
// export const socket = openSocket("http://raspberrypi.local:8000");

socket.on("connect", data => {
  console.log("Connected!");
});

export const sio = (type, callback) => {
  socket.on(type, data => {
    callback(data);
  });
}
