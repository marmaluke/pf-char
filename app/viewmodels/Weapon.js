var currentChar = require('../models/Model').currentChar;

var Weapon = function(w){
    this.weapon = w;
};

Weapon.prototype.name = function(){
    return this.weapon.name();
};

Weapon.prototype.attack = function(){
    var bonus = currentChar().bab()
            + this.weapon.atkBonus()
            + currentChar().mods().atk()
            + (this.weapon.atkStat() ? currentChar().stats[this.weapon.atkStat()].bonus() : 0);
    return (bonus < 0 ? "" : "+") + bonus + (currentChar().bab() > 5 ? "/+" + (bonus - 5) : "");
};

Weapon.prototype.damage = function(){
    var statBonus = (this.weapon.damStat() ? currentChar().stats[this.weapon.damStat()].bonus() : 0) * (this.weapon.isTwoHanded() ? 1.5 : 1),
        bonus = (statBonus < 0 ? Math.ceil(statBonus) : Math.floor(statBonus))
            + this.weapon.damBonus()
            + currentChar().mods().dam();
    return this.weapon.damageDice() + (bonus < 0 ? "" : "+") + bonus;
};

Weapon.prototype.type = function(){
    return this.weapon.type();
};

Weapon.prototype.crit = function(){
    return this.weapon.crit();
};

module.exports = Weapon;
