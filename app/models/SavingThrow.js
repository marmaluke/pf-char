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

module.exports = SavingThrow;
