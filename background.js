/**
 * Created by mait on 22.12.14.
 */
var L = console.log;
var ws;
var timerID = 0;
var Serverlocation = 'ws://192.168.1.2:8080';

function start(Serverlocation) {
  var ws = new WebSocket(Serverlocation, 'jetpack-protocol');
  ws.onmessage = function(ev) {
    self.postMessage(ev.data);
  }

  ws.onclose=function(event) {
    self.postMessage({type: 'timerStart'});
  }
  ws.onopen=function(event) {
    self.postMessage({type: 'timerStop'});
  }
}
start(Serverlocation);

self.port.on('message', function(m) {
  ws.send(m);
});

self.port.on("start", function() {
  start(Serverlocation);
});
