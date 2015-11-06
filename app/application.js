//var m = require('mithril');

var model = require('./models/Model'),
    ActivatedEffect = require('./models/ActivatedEffect');

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
                            m(".pure-u-1-24", effect instanceof ActivatedEffect ? m("input[type=checkbox]", {checked: effect.active(), onchange: function(e){
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
    artuk: require('./characters/Artuk'),
    fang: require('./characters/Fang')
};

exports.init = function() {
    console.log('Initialising app');
    m.route(document.getElementById("layout"), "/", {
        "/:char": m.component(component.Layout, component.Sheet),
        "/": m.component(component.Layout, component.ChooseCharacter)
    });
};
