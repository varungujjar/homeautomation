import openSocket from "socket.io-client";
const socket = openSocket("http://" + document.domain + ":8000");


export function device(returnData) {
  socket.on("device", data => {
    returnData(data);
  });
}

export function featuredSensor(returnData) {
  socket.on("device", data => {
    if (data.weather==1){
      returnData(data);
    }
  });
}

export function horizon(returnData) {
  socket.on("horizon", data => {
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
