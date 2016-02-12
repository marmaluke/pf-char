var model = require('../models/Model');

var utils = require('./Utils');

var Stat = function(name, label){
    this.name = m.prop(name);
    this.label = m.prop(label);
};
Stat.prototype.value = function() {
    return model.currentChar() ? model.currentChar().stats[this.name()].value() : 10;
};
Stat.prototype.bonus = function(){
    return utils.showBonus(model.currentChar() ? model.currentChar().stats[this.name()].bonus() : 0);
};
Stat.byName = function(name) {
    return model.character.stats.filter(function(s){
        return s.name() == name;
    })[0];
};

var SavingThrow = function(name, label){
    this.name = m.prop(name);
    this.label = m.prop(label);
};
SavingThrow.prototype.value = function(){
    return utils.showBonus(model.currentChar() ? model.currentChar().class.saves[this.name()].value(model.currentChar()) : 0);
};

var character = function() {
    this.level = function(){return model.currentChar() ? model.currentChar().level : "1";};
    this.name = function(){return model.currentChar() ? model.currentChar().name : "Character Name";};
    this.race = function(){return model.currentChar() ? model.currentChar().race : "Race";};
    this.alignment = function(){return model.currentChar() ? model.currentChar().alignment : "Alignment";};
    this.className = function(){return model.currentChar() ? model.currentChar().class.name : "Class";};
    this.ac = function(){return model.currentChar() ? model.currentChar().ac() : "10";};
    this.touchAc = function(){return model.currentChar() ? model.currentChar().touchAc() : "10";};
    this.bab = function(){return model.currentChar() ? model.currentChar().bab() : "0";};
    this.cmb = function(){return model.currentChar() ? utils.showBonus(model.currentChar().cmb()) : "0";};
    this.cmd = function(){return model.currentChar() ? model.currentChar().cmd() : "10";};
    this.currentHP = function(){return model.currentChar() ? model.currentChar().hp.max() - model.currentChar().hp.damage() : "0";};
    this.maxHP = function(){return model.currentChar() ? model.currentChar().hp.max() : "0";};
    this.tempHP = function(){return model.currentChar() ? model.currentChar().hp.temp() : "0";};
    this.stats = [
        new Stat("str", "Str"),
        new Stat("dex", "Dex"),
        new Stat("con", "Con"),
        new Stat("int", "Int"),
        new Stat("wis", "Wis"),
        new Stat("cha", "Cha")
    ];
    this.savingThrows = [
        new SavingThrow("fort", "Fort"),
        new SavingThrow("ref", "Ref"),
        new SavingThrow("will", "Will")
    ];
    this.trackedAbilities = model.currentChar().trackedAbilities.map(ability => ({
        name: ability.name,
        uses: Array.apply(null, Array(ability.perDay)).map(() => m.prop(false))
    }));
};

module.exports = character;
