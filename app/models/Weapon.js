module.exports = Weapon = function(args) {
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
