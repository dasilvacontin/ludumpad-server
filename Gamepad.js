function Gamepad (socket) {
	this.id = socket.id;
	this.socket = socket;
}

Gamepad.prototype.getID = function () {
	return this.id;
}

Gamepad.prototype.channelDied = function () {
	this.socket.emit('channelDied');
}

module.exports = Gamepad;