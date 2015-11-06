var model = require('./Model');

module.exports = Skill = function(sk, isClass, isPhysical){
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
