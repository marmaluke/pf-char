var model = require('../models/Model');

var utils = require('./Utils');

var character = {
    level: function(){return model.currentChar() ? model.currentChar().level : "1";},
    name: function(){return model.currentChar() ? model.currentChar().name : "Character Name";},
    race: function(){return model.currentChar() ? model.currentChar().race : "Race";},
    alignment: function(){return model.currentChar() ? model.currentChar().alignment : "Alignment";},
    className: function(){return model.currentChar() ? model.currentChar().class.name : "Class";},
    ac: function(){return model.currentChar() ? model.currentChar().ac() : "10";},
    touchAc: function(){return model.currentChar() ? model.currentChar().touchAc() : "10";},
    bab: function(){return model.currentChar() ? model.currentChar().bab() : "0";},
    cmb: function(){return model.currentChar() ? model.currentChar().cmb() : 0;},
    cmd: function(){return model.currentChar() ? model.currentChar().cmd() : "10";},
    currentHP: function(){return model.currentChar() ? model.currentChar().hp.max() - model.currentChar().hp.damage() : "0";},
    maxHP: function(){return model.currentChar() ? model.currentChar().hp.max() : "0";},
    tempHP: function(){return model.currentChar() ? model.currentChar().hp.temp() : "0";}
};

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
character.stats = [
    new Stat("str", "Str"),
    new Stat("dex", "Dex"),
    new Stat("con", "Con"),
    new Stat("int", "Int"),
    new Stat("wis", "Wis"),
    new Stat("cha", "Cha")
];
var SavingThrow = function(name, label){
    this.name = m.prop(name);
    this.label = m.prop(label);
};
SavingThrow.prototype.value = function(){
    return utils.showBonus(model.currentChar() ? model.currentChar().class.saves[this.name()].value(model.currentChar()) : 0);
};
character.savingThrows = [
    new SavingThrow("fort", "Fort"),
    new SavingThrow("ref", "Ref"),
    new SavingThrow("will", "Will")
];

module.exports = character;
