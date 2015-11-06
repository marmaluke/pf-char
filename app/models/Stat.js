//var m = require('mithril');

var Stat = function(value){
    this.value = m.prop(value);
};
Stat.prototype.bonus = function(){
    return Math.floor((this.value() - 10) / 2);
};

module.exports = Stat;
