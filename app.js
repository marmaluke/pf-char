var model = {
    currentChar: m.prop()
};

model.Stat = function(value){
    this.value = m.prop(value);
};
model.Stat.prototype.bonus = function(){
    return Math.floor((this.value() - 10) / 2);
};

model.Character = function(c){
    var self = this;
    Object.getOwnPropertyNames(c).forEach(function(pname){
        self[pname] = c[pname];
    });

    this.hp = {
        max: function(){return self.level * ((self.class.hd / 2) + 1 + self.stats.con.bonus() + 1) + ((self.class.hd / 2) - 1);},
        damage: m.prop(0),
        temp: m.prop(0)
    };

    this.mods = {
        ac: m.prop(0),
        atk: m.prop(0),
        dam: m.prop(0),
        skill: m.prop(0)
    };
};
model.Character.prototype.bab = function(){
    var multiplier;
    switch (this.class.babProgression) {
    case "poor": multiplier = 0.5; break;
    case "med": multiplier = 0.75; break;
    default: multiplier = 1; break;
    }
    return Math.floor(this.level * multiplier);
};
model.Character.prototype.cmb = function(){
    return this.bab() + this.stats.str.bonus();
};
model.Character.prototype.cmd = function(){
    return 10 + this.bab() + this.stats.str.bonus() + this.stats.dex.bonus();
};
model.Character.prototype.ac = function(){
    return 10
        + Math.min(this.stats.dex.bonus(), this.armor.maxDex)
        + this.mods.ac()
        + this.armor.ac;
};
model.Character.prototype.doDamage = function(amt) {
    var hp = this.hp;
    if (hp.temp() > amt) {
        hp.temp(hp.temp() - amt);
    } else {
        hp.damage(hp.damage() + amt - hp.temp());
        hp.temp(0);
    }
};
model.Character.prototype.doHeal = function(amt) {
    var hp = this.hp;
    hp.damage(hp.damage() - amt);
    if (hp.damage() < 0) hp.damage(0);
};
model.SavingThrow = function(progression, stat){
    this.progression = m.prop(progression);
    this.stat = m.prop(stat);
    this.bonus = m.prop(0);
};
model.SavingThrow.prototype.value = function(){
    var level = model.currentChar().level,
        levelBonus;

    if (this.progression() == "good") {
        levelBonus = 2 + Math.floor(level / 2);
    } else {
        levelBonus = Math.floor(level / 3);
    }

    return levelBonus + model.currentChar().stats[this.stat()].bonus() + this.bonus();
};
model.FortSave = function(progression){
    return new model.SavingThrow(progression, "con");
};
model.RefSave = function(progression){
    return new model.SavingThrow(progression, "dex");
};
model.WillSave = function(progression){
    return new model.SavingThrow(progression, "wis");
};

model.ActivatedEffect = function(ae){
    this.name = m.prop(ae.name);
    this.startFn = ae.start;
    this.endFn = ae.end;
    this.active = m.prop(false);
};
model.ActivatedEffect.prototype.start = function(){
    if (this.active()) return;
    this.active(true);
    this.startFn(model.currentChar());
};
model.ActivatedEffect.prototype.end = function(){
    if (!this.active()) return;
    this.active(false);
    this.endFn(model.currentChar());
};

model.characters = {
    artuk: new model.Character({
        name: "Artuk",
        alignment: "Chaotic Evil",
        stats: { str: new model.Stat(19), dex: new model.Stat(12), con: new model.Stat(14), int: new model.Stat(6), wis: new model.Stat(8), cha: new model.Stat(14) },
        level: 5,
        class: {
            name: "Skald",
            hd: 8,
            babProgression: "med",
            saves: {
                fort: new model.FortSave("good"),
                ref: new model.RefSave("poor"),
                will: new model.WillSave("good")
            }
        },
        armor: {
            name: "MW Breastplate",
            ac: 6,
            maxDex: 3,
            acp: -3
        },
        attacks: [
            {
                name: "Cutlass",
                stat: "str",
                atk: 0,
                dam: 0,
                twoHanded: false,
                damage: "1d6",
                type: "S",
                crit: "18-20/x2"
            },
            {
                name: "Cutlass (2H)",
                stat: "str",
                atk: 0,
                dam: 0,
                twoHanded: true,
                damage: "1d6",
                type: "S",
                crit: "18-20/x2"
            }
        ],
        activatedEffects: [
            new model.ActivatedEffect({
                name: "Raging Song",
                start: function(c){
                    c.stats.str.value(c.stats.str.value() + 2);
                    c.stats.con.value(c.stats.con.value() + 2);
                    c.class.saves.will.bonus(c.class.saves.will.bonus() + 2);
                    c.mods.ac(c.mods.ac() - 1);
                },
                end: function(c){
                    c.stats.str.value(c.stats.str.value() - 2);
                    c.stats.con.value(c.stats.con.value() - 2);
                    c.class.saves.will.bonus(c.class.saves.will.bonus() - 2);
                    c.mods.ac(c.mods.ac() + 1);
                }
            }),
            new model.ActivatedEffect({
              name: "Heroism",
              start: function(c){
                  c.mods.atk(c.mods.atk() + 2);
                  c.mods.skill(c.mods.skill() + 2);
              },
              end: function(c){
                  c.mods.atk(c.mods.atk() - 2);
                  c.mods.skill(c.mods.skill() - 2);
              }
            }),
            new model.ActivatedEffect({
                name: "Arcane Strike",
                start: function(c){
                    c.mods.dam(c.mods.dam() + (1 + Math.floor(c.level / 5)));
                },
                end: function(c){
                    c.mods.dam(c.mods.dam() - (1 + Math.floor(c.level / 5)));
                }
            }),
            new model.ActivatedEffect({
                name: "Power Attack",
                start: function(c){
                    c.mods.atk(c.mods.atk() - 1);
                    c.attacks.forEach(function(w){
                        w.dam = w.dam + (w.twoHanded ? 3 : 2);
                    });
                },
                end: function(c){
                    c.mods.atk(c.mods.atk() + 1);
                    c.attacks.forEach(function(w){
                        w.dam = w.dam - (w.twoHanded ? 3 : 2);
                    });
                }
            })
        ]
    })
};

var viewmodel = {
    character: {
        level: function(){return model.currentChar() ? model.currentChar().level : "1";},
        name: function(){return model.currentChar() ? model.currentChar().name : "Character Name";},
        alignment: function(){return model.currentChar() ? model.currentChar().alignment : "Alignment";},
        className: function(){return model.currentChar() ? model.currentChar().class.name : "Class";},
        ac: function(){return model.currentChar() ? model.currentChar().ac() : "10";},
        bab: function(){return model.currentChar() ? model.currentChar().bab() : "0";},
        cmb: function(){return "+" + (model.currentChar() ? model.currentChar().cmb() : "0");},
        cmd: function(){return model.currentChar() ? model.currentChar().cmd() : "10";},
        currentHP: function(){return model.currentChar() ? model.currentChar().hp.max() - model.currentChar().hp.damage() : "0";},
        maxHP: function(){return model.currentChar() ? model.currentChar().hp.max() : "0";},
        tempHP: function(){return model.currentChar() ? model.currentChar().hp.temp() : "0";}
    },
    showBonus: function(bonus){
        return (bonus < 0 ? "" : "+") + bonus;
    },
    toOption: function(obj){
        return m("option", obj);
    },
    attack: function(weapon){
        return "+" + (model.currentChar().bab()
                      + weapon.atk
                      + model.currentChar().mods.atk()
                      + model.currentChar().stats[weapon.stat].bonus());
    },
    damage: function(weapon){
        return weapon.damage + "+"
            + (Math.floor(model.currentChar().stats[weapon.stat].bonus() * (weapon.twoHanded ? 1.5 : 1))
               + weapon.dam
               + model.currentChar().mods.dam());
    }
};
viewmodel.Stat = function(name, label){
    this.name = m.prop(name);
    this.label = m.prop(label);
};
viewmodel.Stat.prototype.value = function() {
    return model.currentChar() ? model.currentChar().stats[this.name()].value() : 10;
};
viewmodel.Stat.prototype.bonus = function(){
    return viewmodel.showBonus(model.currentChar() ? model.currentChar().stats[this.name()].bonus() : 0);
};
viewmodel.Stat.byName = function(name) {
    return model.character.stats.filter(function(s){
        return s.name() == name;
    })[0];
};
viewmodel.character.stats = [
    new viewmodel.Stat("str", "Strength"),
    new viewmodel.Stat("dex", "Dexterity"),
    new viewmodel.Stat("con", "Constitution"),
    new viewmodel.Stat("int", "Intelligence"),
    new viewmodel.Stat("wis", "Wisdom"),
    new viewmodel.Stat("cha", "Charisma")
];
viewmodel.SavingThrow = function(name, label){
    this.name = m.prop(name);
    this.label = m.prop(label);
};
viewmodel.SavingThrow.prototype.value = function(){
    return viewmodel.showBonus(model.currentChar() ? model.currentChar().class.saves[this.name()].value() : 0);
};
viewmodel.character.savingThrows = [
    new viewmodel.SavingThrow("fort", "Fortitude"),
    new viewmodel.SavingThrow("ref", "Reflex"),
    new viewmodel.SavingThrow("will", "Will")
];

var component = {};
component.Layout = {
    view: function(ctrl, subComponent){
        return m(".pure-g", [
            m(".pure-u-1-8"),
            m(".pure-u-3-4", subComponent),
            m(".pure-u-1-8")
        ]);
    }
};

component.Editable = {
    controller: function(){
        var newValue = m.prop(),
            editing = m.prop(false);
        return {
            editing: editing,
            newValue: newValue,
            save: function(stored){
                return function(evt){
                    stored(newValue());
                    editing(false);
                };
            }
        };
    },
    view: function(ctrl, args){
        return ctrl.editing() ?
            m("input", {id: args.id, value: ctrl.newValue(), onchange: m.withAttr("value", ctrl.newValue), onblur: ctrl.save(args.value)})
        : m("span", {onclick: function(){ctrl.editing(true);ctrl.newValue(args.value());}}, args.value());
    }
};

component.ListEditable = {
    controller: function(){
        var newValue = m.prop(),
            editing = m.prop(false);
        return {
            editing: editing,
            newValue: newValue,
            save: function(stored){
                return function(chosen){
                    stored(chosen);
                    editing(false);
                };
            }
        };
    },
    view: function(ctrl, args){
        return ctrl.editing() ?
            m("select", {id: args.id, value: args.value(), onchange: m.withAttr("value", ctrl.save(args.value))}, args.list.map(viewmodel.toOption))
            : m("span", {onclick: function(){ctrl.editing(true);ctrl.newValue(args.value());}}, args.value());
    }
};

component.Separator = {
    view: function(){
        return m(".pure-u-1", m("hr"));
    }
};

component.Sheet = {
    controller: function(){
        var character = m.route.param("char");
        model.currentChar(model.characters[character]);
        return {};
    },
    view: function(ctrl) {
        return m(".pure-g", [
            component.Separator,
            m(".pure-u-1-3", m("span", viewmodel.character.name())),
            m(".pure-u-1-6", m("span", viewmodel.character.className())),
            m(".pure-u-1-6", m("span", viewmodel.character.level())),
            m(".pure-u-1-3", m("span", viewmodel.character.alignment())),
            component.Separator,
            m(".pure-u-1-3",
              viewmodel.character.stats.map(function(s){
                  return [
                      m(".pure-u-1-3", m("label", s.label())),
                      m(".pure-u-1-3", m("span", s.value())),
                      m(".pure-u-1-3", m("span", s.bonus()))
                  ];
              })),
            m(".pure-u-1-3", [
                viewmodel.character.savingThrows.map(function(s){
                    return [
                        m(".pure-u-1-3", m("label", s.label())),
                        m(".pure-u-1-3", m("span", s.value())),
                        m(".pure-u-1-3")
                    ];
                }),
                m(".pure-u-1"),
                m(".pure-u-1-3", m("label", "CMB")), m(".pure-u-1-3", m("span", viewmodel.character.cmb())), m(".pure-u-1-3"),
                m(".pure-u-1-3", m("label", "CMD")), m(".pure-u-1-3", m("span", viewmodel.character.cmd())), m(".pure-u-1-3")
            ]),
            m(".pure-u-1-3", [
                m(".pure-u-1-3", m("label", "Armor Class")),
                m(".pure-u-1-3", m("span", viewmodel.character.ac())),
                m(".pure-u-1-3"),
                m(".pure-u-1-3", m("label", "HP [" + viewmodel.character.maxHP() + "]")),
                m(".pure-u-1-3", m("span", viewmodel.character.currentHP() + (viewmodel.character.tempHP() ? " (" + viewmodel.character.tempHP() + ")" : ""))),
                m(".pure-u-1-3")
            ]),
            component.Separator,
            model.currentChar().attacks.map(function(weapon){
                return [
                    m(".pure-u-1-5", weapon.name),
                    m(".pure-u-1-5", viewmodel.attack(weapon)),
                    m(".pure-u-1-5", viewmodel.damage(weapon)),
                    m(".pure-u-1-5", weapon.type),
                    m(".pure-u-1-5", weapon.crit)
                ];
            }),
            component.Separator,
            m(".pure-u-1-3", model.currentChar().activatedEffects.map(function(effect){
                return [
                    m(".pure-u-1-3", m("label", effect.name())),
                    m(".pure-u-1-3", m("input[type=checkbox]", {onchange: function(e){
                        if (e.target.checked) {
                            effect.start();
                        } else {
                            effect.end();
                        }
                    }})),
                    m(".pure-u-1-3")
                ];
            }))
        ]);
    }
};

component.ChooseCharacter = {
    view: function(){
        return m(".pure.g", [
            m("h2", "Choose a character"),
            Object.getOwnPropertyNames(model.characters).map(function(cname){
                return m("a", {href: "/" + cname, config: m.route}, model.characters[cname].name);
            })
        ]);
    }
};

m.route(document.getElementById("layout"), "/", {
    "/:char": m.component(component.Layout, component.Sheet),
    "/": m.component(component.Layout, component.ChooseCharacter)
});
