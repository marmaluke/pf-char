//var m = require('mithril');

var model = {
    currentChar: m.prop(),
    characters: {}
};

model.DexWeapon = function(args){
    args.atkStat = "dex";
    return new model.Weapon(args);
};

module.exports = model;
