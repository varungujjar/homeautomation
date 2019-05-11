import React, {Component} from "react";
import openSocket from "socket.io-client";
// const socket = openSocket("http://" + document.domain + ":8000");
const socket = openSocket("http://192.168.1.114:8000");

export const notifications = (returnData) => {
  socket.on("notification", data => {
    returnData(data);
  });
}

export const device = (returnData) => {
  socket.on("device", data => {
    returnData(data);
  });
}


export const connect = (returnData) => {
  socket.on("connect", data => {
    returnData(data)
  });
  // socket.emit('connect', {data: 'Connected to Backend.'});
}

