//var m = require('mithril');

var model = require('./models/Model');

var viewmodel = {
    character: {
        level: function(){return model.currentChar() ? model.currentChar().level : "1";},
        name: function(){return model.currentChar() ? model.currentChar().name : "Character Name";},
        race: function(){return model.currentChar() ? model.currentChar().race : "Race";},
        alignment: function(){return model.currentChar() ? model.currentChar().alignment : "Alignment";},
        className: function(){return model.currentChar() ? model.currentChar().class.name : "Class";},
        ac: function(){return model.currentChar() ? model.currentChar().ac() : "10";},
        touchAc: function(){return model.currentChar() ? model.currentChar().touchAc() : "10";},
        bab: function(){return model.currentChar() ? model.currentChar().bab() : "0";},
        cmb: function(){return "+" + (model.currentChar() ? model.currentChar().cmb() : "0");},
        cmd: function(){return model.currentChar() ? model.currentChar().cmd() : "10";},
        currentHP: function(){return model.currentChar() ? model.currentChar().hp.max() - model.currentChar().hp.damage() : "0";},
        maxHP: function(){return model.currentChar() ? model.currentChar().hp.max() : "0";},
        tempHP: function(){return model.currentChar() ? model.currentChar().hp.temp() : "0";}
    },
    hp: {
        change: m.prop()
    },
    showBonus: function(bonus){
        return (bonus < 0 ? "" : "+") + bonus;
    },
    toOption: function(obj){
        return m("option", obj);
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
    new viewmodel.Stat("str", "Str"),
    new viewmodel.Stat("dex", "Dex"),
    new viewmodel.Stat("con", "Con"),
    new viewmodel.Stat("int", "Int"),
    new viewmodel.Stat("wis", "Wis"),
    new viewmodel.Stat("cha", "Cha")
];
viewmodel.SavingThrow = function(name, label){
    this.name = m.prop(name);
    this.label = m.prop(label);
};
viewmodel.SavingThrow.prototype.value = function(){
    return viewmodel.showBonus(model.currentChar() ? model.currentChar().class.saves[this.name()].value(model.currentChar()) : 0);
};
viewmodel.character.savingThrows = [
    new viewmodel.SavingThrow("fort", "Fort"),
    new viewmodel.SavingThrow("ref", "Ref"),
    new viewmodel.SavingThrow("will", "Will")
];

viewmodel.Weapon = function(w){
    this.weapon = w;
};
viewmodel.Weapon.prototype.name = function(){
    return this.weapon.name();
};
viewmodel.Weapon.prototype.attack = function(){
    var bonus = model.currentChar().bab()
            + this.weapon.atkBonus()
            + model.currentChar().mods().atk()
            + (this.weapon.atkStat() ? model.currentChar().stats[this.weapon.atkStat()].bonus() : 0);
    return (bonus < 0 ? "" : "+") + bonus + (model.currentChar().bab() > 5 ? "/+" + (bonus - 5) : "");
};
viewmodel.Weapon.prototype.damage = function(){
    var statBonus = (this.weapon.damStat() ? model.currentChar().stats[this.weapon.damStat()].bonus() : 0) * (this.weapon.isTwoHanded() ? 1.5 : 1),
        bonus = (statBonus < 0 ? Math.ceil(statBonus) : Math.floor(statBonus))
            + this.weapon.damBonus()
            + model.currentChar().mods().dam();
    return this.weapon.damageDice() + (bonus < 0 ? "" : "+") + bonus;
};
viewmodel.Weapon.prototype.type = function(){
    return this.weapon.type();
};
viewmodel.Weapon.prototype.crit = function(){
    return this.weapon.crit();
};

var component = {};
component.Layout = {
    view: function(ctrl, subComponent){
        return m(".pure-g", [
            m(".pure-u-1-24"),
            m(".pure-u-11-12", subComponent),
            m(".pure-u-1-24")
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
        return {
            changeHp: function(hpChangeFn) {
                return function(e){
                    e.preventDefault();
                    if (typeof +viewmodel.hp.change() === 'number') hpChangeFn(+viewmodel.hp.change());
                    viewmodel.hp.change(null);
                };
            }
        };
    },
    view: function(ctrl) {
        return m(".pure-g", [
            m(".pure-u-11-24", [
                component.Separator,
                m(".pure-u-1-6", m("span", viewmodel.character.name())),
                m(".pure-u-1-6", m("span", viewmodel.character.race())),
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
                    m(".pure-u-1-4", m("label", "AC")),
                    m(".pure-u-1-4", m("span", viewmodel.character.ac())),
                    m(".pure-u-1-4", m("label", "touch")),
                    m(".pure-u-1-4", m("span", viewmodel.character.touchAc())),
                    m(".pure-u-1-3", m("label", "HP [" + viewmodel.character.maxHP() + "]")),
                    m(".pure-u-1-3", m("span", viewmodel.character.currentHP() + (viewmodel.character.tempHP() ? " (" + viewmodel.character.tempHP() + ")" : ""))),
                    m(".pure-u-1-3"),
                    m(".pure-u-1-4", m("input[type=number][style='width:100%']", {onchange: m.withAttr("value", viewmodel.hp.change), value: viewmodel.hp.change()})),
                    m(".pure-u-1-4", m("button", {onclick: ctrl.changeHp(model.currentChar().doHeal.bind(model.currentChar()))}, "Heal")),
                    m(".pure-u-1-4", m("button", {onclick: ctrl.changeHp(model.currentChar().doDamage.bind(model.currentChar()))}, "Dam")),
                    m(".pure-u-1-4", m("button", {onclick: ctrl.changeHp(model.currentChar().hp.temp.bind(model.currentChar()))}, "Temp"))
                ]),
                component.Separator,
                model.currentChar().attacks.map(function(weapon){return new viewmodel.Weapon(weapon);})
                    .map(function(weapon){
                        return [
                            m(".pure-u-1-2", weapon.name()),
                            m(".pure-u-3-24[style='text-align:center']", weapon.attack()),
                            m(".pure-u-3-24[style='text-align:center']", weapon.damage()),
                            m(".pure-u-3-24[style='text-align:center']", weapon.type()),
                            m(".pure-u-3-24[style='text-align:center']", weapon.crit())
                        ];
                    }),
                component.Separator,
                m(".pure-u-1", model.currentChar().trackedAbilities.map(function(ability){
                    return m(".pure-g", [
                        m(".pure-u-1-4", ability.name),
                        m(".pure-u-3-4",
                          Array.apply(null, Array(ability.perDay)).map(function(){
                              return m("input[type=checkbox]");
                          }))
                    ]);
                })),
                component.Separator,
                m(".pure-u-1", [
                    m(".pure-u-1-24", m("input[type=checkbox]", {checked: model.currentChar().isArmorEquipped(), onchange: function(e){
                        if (e.target.checked) {
                            model.currentChar().isArmorEquipped(true);
                        } else {
                            model.currentChar().isArmorEquipped(false);
                        }
                    }})),
                    m(".pure-u-23-24", m("label", "Armor equipped?")),
                    model.currentChar().effects.map(function(effect){
                        return [
                            m(".pure-u-1-24", effect instanceof model.ActivatedEffect ? m("input[type=checkbox]", {checked: effect.active(), onchange: function(e){
                                if (e.target.checked) {
                                    effect.start();
                                } else {
                                    effect.end();
                                }
                            }}) : ""),
                            m(".pure-u-23-24", [
                                m("strong", effect.name()),
                                m.trust("&nbsp;"),
                                effect.description()
                            ])
                        ];
                    })]),
                component.Separator
            ]),
            m(".pure-u-1-12"),
            m(".pure-u-11-24", [
                component.Separator,
                model.currentChar().skills.map(function(skill){
                    return [
                        m(".pure-u-1-3", skill.name()),
                        m(".pure-u-1-3", viewmodel.showBonus(skill.bonus())),
                        m(".pure-u-1-3", skill.conditional())
                    ];
                }),
                component.Separator,
                model.currentChar().spells.map(function(spellLevel){
                    return [
                        m(".pure-u-1-2", m.trust("Level " + spellLevel.level + " spells - " + spellLevel.perDay + " per day")),
                        m(".pure-u-1-2", typeof spellLevel.perDay !== "number" ? "" : Array.apply(null, Array(spellLevel.perDay)).map(function(){
                              return m("input[type=checkbox]");
                          })),
                        component.Separator,
                        spellLevel.known.map(function(knownSpell){
                            return m(".pure-u-1", knownSpell);
                        }),
                        component.Separator
                    ];
                })
            ])]);
    }
};

component.ChooseCharacter = {
    view: function(){
        return m(".pure.g", [
            m("h2", "Choose a character"),
            m("ul", Object.getOwnPropertyNames(model.characters).map(function(cname){
                return m("li", m("a", {href: "/" + cname, config: m.route}, model.characters[cname].name));
            }))
        ]);
    }
};

model.characters = {
    artuk: new model.Character({
        name: "Artuk",
        race: "Orc",
        alignment: "Chaotic Evil",
        stats: {
            str: new model.Stat(19),
            dex: new model.Stat(12),
            con: new model.Stat(14),
            int: new model.Stat(8),
            wis: new model.Stat(6),
            cha: new model.Stat(14)
        },
        level: 6,
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
            name: "+1 Mithril Breastplate",
            ac: 7,
            maxDex: 5,
            acp: -1
        },
        attacks: [
            new model.Weapon({
                name: "Cutlass",
                atkBonus: 0,
                damBonus: 0,
                isTwoHanded: false,
                damageDice: "1d6",
                type: "S",
                crit: "18-20/x2"
            }),
            new model.Weapon({
                name: "Cutlass (2H)",
                atkBonus: 0,
                damBonus: 0,
                isTwoHanded: true,
                damageDice: "1d6",
                type: "S",
                crit: "18-20/x2"
            }),
            new model.Weapon({
                name: "Morningstar +1",
                atkBonus: 1,
                damBonus: 1,
                isTwoHanded: false,
                damageDice: "1d8",
                type: "B/P",
                crit: "20/x2"
            }),
            new model.Weapon({
                name: "Morningstar +1 (2H)",
                atkBonus: 1,
                damBonus: 1,
                isTwoHanded: true,
                damageDice: "1d8",
                type: "B/P",
                crit: "20/x2"
            })
        ],
        trackedAbilities: [
            {
                name: "Raging Song",
                perDay: 15
            }
        ],
        effects: [
            new model.PassiveEffect("Peg Leg", "+1 Fort, +1 damage vs aquatic animals"),
            new model.PassiveEffect("Iron Liver", "+1 Fort vs poisons and drugs, +3 Fort vs alcohol"),
            new model.PassiveEffect("Fearless Raider", "+4 save vs fear, +4 Intimidate DC"),
            new model.PassiveEffect("Ferocity", "Keep fighting below 0 hp"),
            new model.PassiveEffect("Darkvision", "60 ft"),
            new model.PassiveEffect("Dayrunner", "-2 ranged atks"),
            new model.ActivatedEffect({
                name: "Raging Song: Inspired Rage",
                description: "+2 Str/Con, -1 AC, +2 Will",
                start: function(c){
                    c.stats.str.value(c.stats.str.value() + 2);
                    c.stats.con.value(c.stats.con.value() + 2);
                    c.class.saves.will.bonus(c.class.saves.will.bonus() + 2);
                    c.mods().ac(c.mods().ac() + Math.floor(c.level / 4));

                    c.attacks.push(new model.Weapon({
                        name: "Claw (lesser beast totem)",
                        atkBonus: 0,
                        damBonus: 0,
                        isTwoHanded: false,
                        damageDice: "1d6",
                        type: "B/S",
                        crit: "20/x2"
                    }));
                },
                end: function(c){
                    c.stats.str.value(c.stats.str.value() - 2);
                    c.stats.con.value(c.stats.con.value() - 2);
                    c.class.saves.will.bonus(c.class.saves.will.bonus() - 2);
                    c.mods().ac(c.mods().ac() - Math.floor(c.level / 4));

                    var i = c.attacks.map(function(w){return w.name;}).indexOf("Claw (lesser beast totem)");
                    c.attacks.splice(i, 1);
                }
            }),
            new model.PassiveEffect("Raging Song: Glorious Epic", "1 rnd of raging song, 10 minutes: gain +2 on Diplomacy or Intimidate"),
            new model.PassiveEffect("Raging Song: Song of Strength", "once per round, +3 on Strength or Strength-based skill check"),
            new model.ActivatedEffect({
              name: "Heroism",
              start: function(c){
                  c.mods().atk(c.mods().atk() + 2);
                  c.mods().skill(c.mods().skill() + 2);
              },
              end: function(c){
                  c.mods().atk(c.mods().atk() - 2);
                  c.mods().skill(c.mods().skill() - 2);
              }
            }),
            new model.ActivatedEffect({
                name: "Arcane Strike",
                description: "+2 damage",
                start: function(c){
                    c.mods().dam(c.mods().dam() + (1 + Math.floor(c.level / 5)));
                },
                end: function(c){
                    c.mods().dam(c.mods().dam() - (1 + Math.floor(c.level / 5)));
                }
            }),
            new model.ActivatedEffect({
                name: "Power Attack",
                description: "-2 atk, +4 dam (+6 for 2-H weapon)",
                start: function(c){
                    c.mods().atk(c.mods().atk() - 2);
                    c.attacks.forEach(function(w){
                        w.damBonus(w.damBonus() + (w.isTwoHanded() ? 6 : 4));
                    });
                },
                end: function(c){
                    c.mods().atk(c.mods().atk() + 2);
                    c.attacks.forEach(function(w){
                        w.damBonus(w.damBonus() - (w.isTwoHanded() ? 6 : 4));
                    });
                }
            }),
            new model.ActivatedEffect({
                name: "Alter Self (small)",
                start: function(c){
                    c.mods().ac(c.mods().ac() + 1);
                    c.stats.dex.value(c.stats.dex.value() + 2);
                },
                end: function(c){
                    c.mods().ac(c.mods().ac() - 1);
                    c.stats.dex.value(c.stats.dex.value() - 2);
                }
            }),
            new model.ActivatedEffect({
                name: "Alter Self (medium)",
                start: function(c){
                    c.stats.str.value(c.stats.str.value() + 2);
                },
                end: function(c){
                    c.stats.str.value(c.stats.str.value() - 2);
                }
            }),
            new model.PassiveEffect("Rage Power: Lesser Beast Totem", "Grow claws while raging"),
            new model.PassiveEffect("Rage Power: Beast Totem", "Natural armor bonus while raging"),
            new model.PassiveEffect("Improved Overrun"),
            new model.PassiveEffect("Uncanny Dodge")
        ],
        skills: [
            new model.Skill({
                name: "Acrobatics",
                stat: "dex",
                ranks: 1,
                conditional: function(){ return "+" + Math.floor(model.currentChar().level / 2)  +  " while aboard a boat"; }
            }, true, true),
            new model.Skill({
                name: "Climb",
                stat: "str",
                ranks: 1,
                conditional: function(){ return "+" + Math.floor(model.currentChar().level / 2)  +  " while aboard a boat"; }
            }, true, true),
            new model.Skill({
                name: "Knowledge (local)",
                stat: "int",
                ranks: 1
            }, true, false),
            new model.Skill({
                name: "Perform (Percussion)",
                stat: "cha",
                ranks: 6
            }, true, false),
            new model.Skill({
                name: m.trust("&nbsp;&nbsp;&nbsp;Intimidate"),
                stat: "cha",
                ranks: 6
            }, true, false),
            new model.Skill({
                name: m.trust("&nbsp;&nbsp;&nbsp;Handle Animal"),
                stat: "cha",
                ranks: 6
            }, true, false),
            new model.Skill({
                name: "Perform (Oratory)",
                stat: "cha",
                ranks: 6
            }, true, false),
            new model.Skill({
                name: "Profession (Sailor)",
                stat: "wis",
                ranks: 1,
                bonus: function(){ return Math.floor(model.currentChar().level / 2); }
            }, true, false),
            new model.Skill({
                name: "Survival",
                stat: "wis",
                ranks: 0,
                conditional: function(){ return "+" + Math.floor(model.currentChar().level / 2)  +  " at sea"; }
            }, false, false),
            new model.Skill({
                name: "Swim",
                stat: "str",
                ranks: 1,
                bonus: function(){ return Math.floor(model.currentChar().level / 2); }
            }, true, true),
            new model.Skill({
                name: "Spellcraft",
                stat: "int",
                ranks: 1
            }, true, false),
        ],
        spells: [
            {
                level: 0,
                perDay: "∞",
                known: [
                    "Detect Magic",
                    "Know Direction",
                    "Mage Hand",
                    "Mending",
                    "Read Magic",
                    "Spark"
                ]
            },
            {
                level: 1,
                perDay: 5,
                known: [
                    "Cure Light Wounds",
                    "Feather Step",
                    "Identify",
                    "Timely Inspiration"
                ]
            },
            {
                level: 2,
                perDay: 4,
                known: [
                    "Alter Self",
                    "Bladed Dash",
                    "Heroism",
                    "Mirror Image - 1d4 + 2 images"
                ]
            }
        ],
        cash: 1945
    }),
    fang: new model.Character({
        name: "Fang",
        race: "Human",
        alignment: "Neutral",
        stats: {
            str: new model.Stat(19),
            dex: new model.Stat(10),
            con: new model.Stat(14),
            int: new model.Stat(10),
            wis: new model.Stat(10),
            cha: new model.Stat(14)
        },
        level: 5,
        class: {
            name: "Bloodrager",
            hd: 10,
            babProgression: "high",
            saves: {
                fort: new model.FortSave("good"),
                ref: new model.RefSave("poor"),
                will: new model.WillSave("poor")
            }
        },
        armor: {
            name: "MW Breastplate",
            ac: 6,
            maxDex: 3,
            acp: -3
        },
        attacks: [
            new model.Weapon({
                name: "Longspear",
                atkBonus: 0,
                damBonus: 0,
                isTwoHanded: true,
                damageDice: "1d8",
                type: "P",
                crit: "20/x2"
            })
        ],
        trackedAbilities: [
            {
                name: "Bloodrage",
                perDay: 14
            }
        ],
        effects: [
            new model.ActivatedEffect({
                name: "Bloodrage",
                description: "+4 Str/Con, -2 AC, +2 Will",
                start: function(c){
                    c.stats.str.value(c.stats.str.value() + 4);
                    c.stats.con.value(c.stats.con.value() + 4);
                    c.class.saves.will.bonus(c.class.saves.will.bonus() + 2);
                    c.mods().ac(c.mods().ac() - 2);
                },
                end: function(c){
                    c.stats.str.value(c.stats.str.value() - 4);
                    c.stats.con.value(c.stats.con.value() - 4);
                    c.class.saves.will.bonus(c.class.saves.will.bonus() - 2);
                    c.mods().ac(c.mods().ac() + 2);
                }
            }),
            new model.PassiveEffect("Rage Power: Lesser Beast Totem"),
            new model.PassiveEffect("Uncanny Dodge"),
            new model.PassiveEffect("Improved Uncanny Dodge"),
            new model.PassiveEffect("Arcane Bloodrage", "Apply the effects of blur, protection from arrows, resist energy (choose one energy type), or spider climb while raging"),
            new model.ActivatedEffect({
                name: "Power Attack",
                description: "-2 atk, +4 dam (+6 for 2-H weapon)",
                start: function(c){
                    c.mods().atk(c.mods().atk() - 2);
                    c.attacks.forEach(function(w){
                        w.damBonus(w.damBonus() + (w.isTwoHanded() ? 6 : 4));
                    });
                },
                end: function(c){
                    c.mods().atk(c.mods().atk() + 2);
                    c.attacks.forEach(function(w){
                        w.damBonus(w.damBonus() - (w.isTwoHanded() ? 6 : 4));
                    });
                }
            }),
            new model.PassiveEffect("Fast Movement", "+10 ft movement"),
            new model.PassiveEffect("Blood Sanctuary", "+2 save vs spells cast by allies"),
        ],
        skills: [
            new model.Skill({
                name: "Climb",
                stat: "str",
                ranks: 5
            }, true, true),
            new model.Skill({
                name: "Intimidate",
                stat: "cha",
                ranks: 5
            }, true, true),
            new model.Skill({
                name: "Profession (sailor)",
                stat: "wis",
                ranks: 5
            }, true, true),
            new model.Skill({
                name: "Swim",
                stat: "str",
                ranks: 5
            }, true, true)
        ],
        spells: [
            {
                level: 1,
                perDay: 2,
                known: [
                    "Shield",
                    "Touch of the Sea",
                    "Enlarge Person"
                ]
            }
        ],
        cash: 0
    })
};

exports.init = function() {
    console.log('Initialising app');
    m.route(document.getElementById("layout"), "/", {
        "/:char": m.component(component.Layout, component.Sheet),
        "/": m.component(component.Layout, component.ChooseCharacter)
    });
};
