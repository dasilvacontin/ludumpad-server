//There can't be two copies of the same object in the same HashList

Array.prototype.binarySearch = function (objid, comparator) {
  var low = 0, high = this.length - 1,
      i, comparison;
  while (low <= high) {
    i = Math.floor((low + high) / 2);
    comparison = comparator(this[i], objid);
    if (comparison < 0) { low = i + 1; continue; };
    if (comparison > 0) { high = i - 1; continue; };
    return i;
  }
  return null;
};

function hashListComparator (o, fid) {
	var oid = o.getID();
	if (oid < fid) return -1;
	if (fid < oid) return 1;
	return 0;
}

function HashList () {
	this.list = [];
	this.hash = {};
}

HashList.prototype._insertIntoList = function (obj, objid) {
	var index = this.list.binarySearch(objid, hashListComparator);
	while (this.list[index-1] > objid) --index;
	while (this.list[index] < objid) ++index;
	this.list.splice(index, 0, obj);
}

HashList.prototype._removeFromList = function (objid) {
	var index = this.list.binarySearch(objid, hashListComparator);
	this.list.splice(index, 1);
}

HashList.prototype.get = function (objid) {
	return this.hash[objid];
}

HashList.prototype.push = function (obj) {
	var objid = obj.getID();
	if (this.hash[objid]) return;
	this.hash[objid] = obj;
	this._insertIntoList(obj, objid);
}

HashList.prototype.remove = function (obj) {
	var objid = obj.getID();
	if (!this.hash[objid]) return;
	delete this.hash[objid];
	this._removeFromList(objid);
}

HashList.prototype.forEach = function (f) {
	for (var i = 0; i < this.list.length; ++i) if (this.list[i] != undefined) f(this.list[i]);
}

HashList.prototype.clear = function () {
	this.list = [];
	this.hash = {};
}

module.exports = HashList;