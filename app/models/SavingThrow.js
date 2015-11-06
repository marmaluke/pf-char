//var m = require('mithril');

var SavingThrow = function(progression, stat){
    this.progression = m.prop(progression);
    this.stat = m.prop(stat);
    this.bonus = m.prop(0);
};

SavingThrow.prototype.value = function(character){
    var level = character.level,
        levelBonus;

    if (this.progression() == "good") {
        levelBonus = 2 + Math.floor(level / 2);
    } else {
        levelBonus = Math.floor(level / 3);
    }

    return levelBonus + character.stats[this.stat()].bonus() + this.bonus();
};

var FortSave = function(progression){
    return new SavingThrow(progression, "con");
};

var RefSave = function(progression){
    return new SavingThrow(progression, "dex");
};

var WillSave = function(progression){
    return new SavingThrow(progression, "wis");
};

exports.FortSave = FortSave;
exports.RefSave = RefSave;
exports.WillSave = WillSave;
