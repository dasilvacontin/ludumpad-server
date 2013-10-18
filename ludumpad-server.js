function getIPAddress() {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.address;
    }
  }

  return '0.0.0.0';
}

var localIP = getIPAddress();

var port = 4242;
var io = require('socket.io').listen(port),
	Gamepad = require('./Gamepad'),
	Channel = require('./Channel'),
	StatusCode = require('./StatusCode'),
	HashList = require('./HashList');

io.set('log level', 0);

var channelHash = new HashList ();
var gamepadHash = new HashList ();

function getGamepad (socket) {
	var gamepad = gamepadHash.get(socket.id);
	if (gamepad) return gamepad;
	gamepad = new Gamepad (socket);
	gamepadHash.push(gamepad);
	return gamepad;
}

io.sockets.on('connection', function (socket) {
	console.log("Socket connection!");

	socket.on('openChannel', function (channelID) { // {channelID, adress}
		if (channelHash.get(channelID)) return socket.emit('openChannelCallback', {statusCode:StatusCode.ChannelAlreadyExists, localIP:localIP});
		var channel = new Channel (socket, channelID);
		channelHash.push(channel);
		socket.emit('openChannelCallback', {statusCode:StatusCode.OK, localIP:localIP});

		socket.on('disconnect', function () {
			channel.gamepads.forEach(function (gamepad) {
				gamepad.channelDied();
				gamepadHash.remove(gamepad);
			});
			channel.gamepads.clear();
			channelHash.remove(channel);
		});

	});

	socket.on('connectToChannel', function (data) {
		var channel = channelHash.get(data.channel);
		if (!channel) return socket.emit('connectToChannelCallback', StatusCode.ChannelNotFound);
		var gamepad = getGamepad(socket);
		channel.connectGamepad(gamepad, data.g);

		gamepad.socket.on('disconnect', function () {
			gamepadHash.remove(gamepad);
			channel.gamepadDisconnected(gamepad);
		});

	});

	socket.on('gamepadPacket', function (data) {
		data.id = socket.id;
		var gamepad = getGamepad(socket);
		var channel = gamepad.channel;
		if (!channel) return;
		gamepad.channel.gotGamepadPacket(data);
	});

});

console.log("ludumpad-server is listening on port "+port+"!\n");