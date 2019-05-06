import openSocket from "socket.io-client";
// const socket = openSocket("http://" + document.domain + ":8000");
const socket = openSocket("http://raspberrypi.local:8000");


export function device(returnData) {
  socket.on("device", data => {
    returnData(data);
  });
}

export function notification(returnData) {
  socket.on("notification", data => {
    returnData(data);
  });
}

export function connect(returnData) {
  socket.on("connect", data => {
    returnData(data)
  });
  // socket.emit('connect', {data: 'Connected to Backend.'});
}

