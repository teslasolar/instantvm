// viewer.js — subscribe to MQTT screen stream, render on canvas
var STREAM = { client:null, connected:false, channel:null, fps:0, lastFrame:0 };

function connectStream(channel) {
  STREAM.channel = channel || 'default';
  var cfg = { broker:'wss://broker.hivemq.com:8884/mqtt', topic:'instantvm/screen/' + STREAM.channel };

  var script = document.createElement('script');
  script.src = 'https://unpkg.com/mqtt@5/dist/mqtt.min.js';
  script.onload = function() {
    STREAM.client = mqtt.connect(cfg.broker, { clientId:'ivm-view-' + Math.random().toString(36).substring(7) });

    STREAM.client.on('connect', function() {
      STREAM.connected = true;
      STREAM.client.subscribe(cfg.topic);
      setStatus('● STREAMING ' + STREAM.channel, 'var(--ok)');
    });

    STREAM.client.on('message', function(topic, msg) {
      var now = performance.now();
      STREAM.fps = Math.round(1000 / (now - STREAM.lastFrame));
      STREAM.lastFrame = now;
      renderFrame(msg);
    });

    STREAM.client.on('close', function() {
      STREAM.connected = false;
      setStatus('● DISCONNECTED', 'var(--er)');
    });
  };
  document.head.appendChild(script);
}

function renderFrame(data) {
  var blob = new Blob([data], { type:'image/jpeg' });
  var url = URL.createObjectURL(blob);
  var img = new Image();
  img.onload = function() {
    var canvas = document.getElementById('stream-canvas');
    if (!canvas) return;
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    fitStreamCanvas();
  };
  img.src = url;
}

function fitStreamCanvas() {
  var canvas = document.getElementById('stream-canvas');
  var scr = document.getElementById('vm-screen');
  if (!canvas || !scr) return;
  var sw = scr.parentElement.clientWidth;
  var sh = scr.parentElement.clientHeight;
  var sx = sw / (canvas.width || 800);
  var sy = sh / (canvas.height || 600);
  canvas.style.cssText = 'display:block;transform-origin:0 0;transform:scale('+sx+','+sy+');image-rendering:auto';
}

function disconnectStream() {
  if (STREAM.client) { STREAM.client.end(); STREAM.client = null; }
  STREAM.connected = false;
}
