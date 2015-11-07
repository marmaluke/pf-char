//var m = require('mithril');

var SavingThrow = function(progression, stat){
    this.progression = m.prop(progression);
    this.stat = m.prop(stat);
    this.bonus = m.prop(0);
    this.character = m.prop();
};

SavingThrow.prototype.value = function(){
    var level = this.character().level,
        levelBonus;

    if (this.progression() == "good") {
        levelBonus = 2 + Math.floor(level / 2);
    } else {
        levelBonus = Math.floor(level / 3);
    }

    return levelBonus + this.character().stats[this.stat()].bonus() + this.bonus();
};

exports.FortSave = function(progression){
    return new SavingThrow(progression, "con");
};

exports.RefSave = function(progression){
    return new SavingThrow(progression, "dex");
};

exports.WillSave = function(progression){
    return new SavingThrow(progression, "wis");
};
