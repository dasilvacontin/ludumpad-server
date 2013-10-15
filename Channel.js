var HashList = require('./HashList'),
	StatusCode = require('./StatusCode');

function Channel (socket, channel) {
	this.name = channel;
	this.gamepads = new HashList ();
	this.socket = socket;
	this.socket.emit('openChannelCallback', StatusCode.OK);
	this.socket.on('packetToGamepads', function (data) { //{t:TPYE, p:p, g:gidlist}
		var gidlist = data.g;
		for (var i = 0; i < gidlist.length; ++i) {
			var gamepad = this.gamepads.get(gidlist[i]);
			if (gamepad && gamepad.socket) gamepad.socket.emit('channelPacket', {t:data.t, p:data.p});
		}
	}.bind(this));
}

Channel.prototype.getID = function () {
	return this.name;
}

Channel.prototype.gotGamepadPacket = function (packet) {
	this.socket.emit('gotGamepadPacket', packet);
}

Channel.prototype.connectGamepad = function (gamepad, p) {
	this.gamepads.push(gamepad);
	gamepad.channel = this;
	p.id = gamepad.id;
	this.socket.emit('GamepadConnected', p);
	gamepad.socket.emit('connectToChannelCallback', StatusCode.OK);
}

Channel.prototype.gamepadDisconnected = function (gamepad) {
	this.gamepads.remove(gamepad);
	this.socket.emit('GamepadDisconnected', gamepad.id);
}

module.exports = Channel;