module.exports = Skill = function(sk, isClass, isPhysical){
    this.name = m.prop(sk.name);
    var self = this;
    this.bonus = function() {
        return self.character().stats[sk.stat].bonus()
            + sk.ranks
            + (isClass && sk.ranks > 0 ? 3 : 0)
            + (sk.bonus ? sk.bonus() : 0)
            + (isPhysical && self.character().isArmorEquipped() ? self.character().armor.acp : 0)
            + self.character().mods().skill();
    };
    this.conditional = function(){
        return sk.conditional ? sk.conditional() : "";
    };
    this.character = m.prop();
};
