var character = require('../viewmodels/Character'),
    Weapon = require('../viewmodels/Weapon'),
    model = require('../models/Model'),
    ActivatedEffect = require('../models/ActivatedEffect'),
    viewState = require('../viewmodels/Viewmodel'),
    utils = require('../viewmodels/Utils');

var Separator = require('./Separator');

module.exports = Sheet = {
    controller: function(){
        var character = m.route.param("char");
        model.currentChar(model.characters[character]);
        return {
            changeHp: function(hpChangeFn) {
                return function(e){
                    e.preventDefault();
                    if (typeof +viewState.hp.change() === 'number') hpChangeFn(+viewState.hp.change());
                    viewState.hp.change(null);
                };
            }
        };
    },
    view: function(ctrl) {
        return m(".pure-g", [
            m(".pure-u-11-24", [
                Separator,
                m(".pure-u-1-6", m("span", character.name())),
                m(".pure-u-1-6", m("span", character.race())),
                m(".pure-u-1-6", m("span", character.className())),
                m(".pure-u-1-6", m("span", character.level())),
                m(".pure-u-1-3", m("span", character.alignment())),
                Separator,
                m(".pure-u-1-3",
                  character.stats.map(function(s){
                      return [
                          m(".pure-u-1-3", m("label", s.label())),
                          m(".pure-u-1-3", m("span", s.value())),
                          m(".pure-u-1-3", m("span", s.bonus()))
                      ];
                  })),
                m(".pure-u-1-3", [
                    character.savingThrows.map(function(s){
                        return [
                            m(".pure-u-1-3", m("label", s.label())),
                            m(".pure-u-1-3", m("span", s.value())),
                            m(".pure-u-1-3")
                        ];
                    }),
                    m(".pure-u-1"),
                    m(".pure-u-1-3", m("label", "CMB")), m(".pure-u-1-3", m("span", character.cmb())), m(".pure-u-1-3"),
                    m(".pure-u-1-3", m("label", "CMD")), m(".pure-u-1-3", m("span", character.cmd())), m(".pure-u-1-3")
                ]),
                m(".pure-u-1-3", [
                    m(".pure-u-1-4", m("label", "AC")),
                    m(".pure-u-1-4", m("span", character.ac())),
                    m(".pure-u-1-4", m("label", "touch")),
                    m(".pure-u-1-4", m("span", character.touchAc())),
                    m(".pure-u-1-3", m("label", "HP [" + character.maxHP() + "]")),
                    m(".pure-u-1-3", m("span", character.currentHP() + (character.tempHP() ? " (" + character.tempHP() + ")" : ""))),
                    m(".pure-u-1-3"),
                    m(".pure-u-1-4", m("input[type=number][style='width:100%']", {onchange: m.withAttr("value", viewState.hp.change), value: viewState.hp.change()})),
                    m(".pure-u-1-4", m("button", {onclick: ctrl.changeHp(model.currentChar().doHeal.bind(model.currentChar()))}, "Heal")),
                    m(".pure-u-1-4", m("button", {onclick: ctrl.changeHp(model.currentChar().doDamage.bind(model.currentChar()))}, "Dam")),
                    m(".pure-u-1-4", m("button", {onclick: ctrl.changeHp(model.currentChar().hp.temp.bind(model.currentChar()))}, "Temp"))
                ]),
                Separator,
                model.currentChar().attacks.map(function(weapon){return new Weapon(weapon);})
                    .map(function(weapon){
                        return [
                            m(".pure-u-1-2", weapon.name()),
                            m(".pure-u-3-24[style='text-align:center']", weapon.attack()),
                            m(".pure-u-3-24[style='text-align:center']", weapon.damage()),
                            m(".pure-u-3-24[style='text-align:center']", weapon.type()),
                            m(".pure-u-3-24[style='text-align:center']", weapon.crit())
                        ];
                    }),
                Separator,
                m(".pure-u-1", model.currentChar().trackedAbilities.map(function(ability){
                    return m(".pure-g", [
                        m(".pure-u-1-4", ability.name),
                        m(".pure-u-3-4",
                          Array.apply(null, Array(ability.perDay)).map(function(){
                              return m("input[type=checkbox]");
                          }))
                    ]);
                })),
                Separator,
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
                                    effect.start(model.currentChar());
                                } else {
                                    effect.end(model.currentChar());
                                }
                            }}) : ""),
                            m(".pure-u-23-24", [
                                m("strong", effect.name()),
                                m.trust("&nbsp;"),
                                effect.description()
                            ])
                        ];
                    })]),
                Separator
            ]),
            m(".pure-u-1-12"),
            m(".pure-u-11-24", [
                Separator,
                model.currentChar().skills.map(function(skill){
                    return [
                        m(".pure-u-1-3", skill.name()),
                        m(".pure-u-1-3", utils.showBonus(skill.bonus(model.currentChar()))),
                        m(".pure-u-1-3", skill.conditional())
                    ];
                }),
                Separator,
                model.currentChar().spells.map(function(spellLevel){
                    return [
                        m(".pure-u-1-2", m.trust("Level " + spellLevel.level + " spells - " + spellLevel.perDay + " per day")),
                        m(".pure-u-1-2", typeof spellLevel.perDay !== "number" ? "" : Array.apply(null, Array(spellLevel.perDay)).map(function(){
                              return m("input[type=checkbox]");
                          })),
                        Separator,
                        spellLevel.known.map(function(knownSpell){
                            return m(".pure-u-1", knownSpell);
                        }),
                        spellLevel.memorised ? spellLevel.memorised.map(memSpell => m(".pure-u-1", [
                            Array.apply(null, Array(memSpell.number)).map(() => m("input[type=checkbox]")),
                            memSpell.name ])) : "",
                        Separator
                    ];
                })
            ])]);
    }
};
