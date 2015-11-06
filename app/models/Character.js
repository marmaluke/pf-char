//var m = require('mithril');

var Character = function(c){
    var self = this;
    Object.getOwnPropertyNames(c).forEach(function(pname){
        self[pname] = c[pname];
    });

    this.hp = {
        max: function(){return self.level * ((self.class.hd / 2) + 1 + self.stats.con.bonus() + 1) + ((self.class.hd / 2) - 1);},
        damage: m.prop(0),
        temp: m.prop(0)
    };

    this.isArmorEquipped = m.prop(true);

    this.mods = m.prop({
        ac: m.prop(0),
        atk: m.prop(0),
        dam: m.prop(0),
        skill: m.prop(0)
    });
};

Character.prototype.bab = function(){
    var multiplier;
    switch (this.class.babProgression) {
    case "poor": multiplier = 0.5; break;
    case "med": multiplier = 0.75; break;
    default: multiplier = 1; break;
    }
    return Math.floor(this.level * multiplier);
};

Character.prototype.cmb = function(){
    return this.bab()
        + this.mods().atk()
        + this.stats.str.bonus();
};

Character.prototype.cmd = function(){
    return 10 + this.bab() + this.stats.str.bonus() + this.stats.dex.bonus();
};

Character.prototype.ac = function(){
    return 10
        + (this.isArmorEquipped() ? Math.min(this.stats.dex.bonus(), this.armor.maxDex) : this.stats.dex.bonus())
        + this.mods().ac()
        + (this.isArmorEquipped() ? this.armor.ac : 0);
};

Character.prototype.touchAc = function(){
    return 10
        + (this.isArmorEquipped() ? Math.min(this.stats.dex.bonus(), this.armor.maxDex) : this.stats.dex.bonus())
        + this.mods().ac();
};

Character.prototype.doDamage = function(amt) {
    var hp = this.hp;
    if (hp.temp() > amt) {
        hp.temp(hp.temp() - amt);
    } else {
        hp.damage(hp.damage() + amt - hp.temp());
        hp.temp(0);
    }
};

Character.prototype.doHeal = function(amt) {
    var hp = this.hp;
    hp.damage(Math.max(hp.damage() - amt, 0));
};

module.exports = Character;
