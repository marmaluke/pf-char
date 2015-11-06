//var m = require('mithril');

var model = {
    currentChar: m.prop(),
    characters: {}
};

model.Stat = require('./Stat');

model.Character = require('./Character');

var SavingThrow = require('./SavingThrow');

model.FortSave = require('./FortSave');
model.RefSave = require('./RefSave');
model.WillSave = require('./WillSave');

model.ActivatedEffect = function(ae){
    this.name = m.prop(ae.name);
    this.active = m.prop(false);
    this.description = m.prop(ae.description);
    this.start = function(){
        if (this.active()) return;
        this.active(true);
        ae.start(model.currentChar());
    };
    this.end = function(){
        if (!this.active()) return;
        this.active(false);
        ae.end(model.currentChar());
    };
};

model.PassiveEffect = function(name, description){
    this.name = typeof name === "function" ? description : m.prop(name);
    this.description = typeof description === "function" ? description : m.prop(description);
};

model.Skill = function(sk, isClass, isPhysical){
    this.name = m.prop(sk.name);
    this.bonus = function(){
        return model.currentChar().stats[sk.stat].bonus()
            + sk.ranks
            + (isClass && sk.ranks > 0 ? 3 : 0)
            + (sk.bonus ? sk.bonus() : 0)
            + (isPhysical && model.currentChar().isArmorEquipped() ? model.currentChar().armor.acp : 0)
            + model.currentChar().mods().skill();
    };
    this.conditional = function(){
        return sk.conditional ? sk.conditional() : "";
    };
};

model.Weapon = function(args){
    args.atkStat = args.atkStat ? args.atkStat : "str";
    args.damStat = args.damStat ? args.damStat : "str";
    this.name = function(){return args.name;};
    this.atkStat = function(){return args.atkStat;};
    this.damStat = function(){return args.damStat;};
    this.atkBonus = m.prop(args.atkBonus);
    this.damBonus = m.prop(args.damBonus);
    this.isTwoHanded = function(){return args.isTwoHanded;};
    this.damageDice = function(){return args.damageDice;};
    this.type = function(){return args.type;};
    this.crit = function(){return args.crit;};
};

model.DexWeapon = function(args){
    args.atkStat = "dex";
    return new model.Weapon(args);
};

module.exports = model;
