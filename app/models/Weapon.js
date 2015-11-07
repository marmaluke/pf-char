var Weapon = function(args) {
    this.name = function(){ return args.name; };
    this.atkStat = function(){ return args.atkStat; };
    this.damStat = function(){ return args.damStat; };
    this.atkBonus = m.prop(args.atkBonus ? args.atkBonus : 0);
    this.damBonus = m.prop(args.damBonus ? args.damBonus : 0);
    this.isTwoHanded = function(){ return args.isTwoHanded; };
    this.isRanged = function(){ return args.isRanged; };
    this.damageDice = function(){ return args.damageDice; };
    this.type = function(){ return args.type; };
    this.crit = function(){ return args.crit; };
};

exports.Melee = function(args) {
    args.atkStat = "str";
    args.damStat = "str";
    args.isTwoHanded = false;
    args.isRanged = false;
    return new Weapon(args);
};

exports.Melee2H = function(args) {
    args.atkStat = "str";
    args.damStat = "str";
    args.isTwoHanded = true;
    args.isRanged = false;
    return new Weapon(args);
};

exports.Finesse = function(args) {
    args.atkStat = "dex";
    args.damStat = "str";
    args.isTwoHanded = false;
    args.isRanged = false;
    return new Weapon(args);
};

exports.Ranged = function(args) {
    args.atkStat = "dex";
    args.damStat = null;
    args.isTwoHanded = false;
    args.isRanged = true;
    return new Weapon(args);
};

exports.Special = function(args) {
    return new Weapon(args);
};
