'use strict';

var Character = require('../viewmodels/Character'),
    Weapon = require('../viewmodels/Weapon'),
    model = require('../models/Model'),
    ActivatedEffect = require('../models/ActivatedEffect'),
    viewState = require('../viewmodels/Viewmodel'),
    utils = require('../viewmodels/Utils');

var Separator = require('./Separator'),
    Checkbox = require('./checkbox');

var Sheet = {
    controller: function(){
        let charName = m.route.param('char');
        model.currentChar(model.characters[charName]);
        let character = new Character(model.currentChar());
        return {
            character,
            changeHp: function(hpChangeFn) {
                return function(e){
                    e.preventDefault();
                    if (typeof +viewState.hp.change() === 'number') hpChangeFn(+viewState.hp.change());
                    viewState.hp.change(null);
                };
            },
            saveState: function () {
                let currentState = {
                    damage: model.currentChar().hp.damage(),
                    tempHP: model.currentChar().hp.temp(),
                    armorEquipped: model.currentChar().isArmorEquipped(),
                    trackedAbilities: character.trackedAbilities.map(ability => ability.uses.map(use => use())),
                    activeEffects: model.currentChar().effects
                        .filter(eff => eff instanceof ActivatedEffect)
                        .map(eff => eff.active()),
                    spells: character.spells.map(spellLevel => ({
                        uses: spellLevel.uses.map(use => use()),
                        memorised: spellLevel.memorised.map(spell => spell.uses.map(use => use()))
                    }))
                };
                localStorage.setItem(charName, JSON.stringify(currentState));
            },
            loadState: function() {
                let storedState = JSON.parse(localStorage.getItem(charName));
                console.log(storedState);
                model.currentChar().hp.damage(storedState.damage);
                model.currentChar().hp.temp(storedState.tempHP);
                model.currentChar().isArmorEquipped(storedState.armorEquipped);
                storedState.trackedAbilities.forEach((ability, i) => ability.forEach((use, j) => character.trackedAbilities[i].uses[j](use)));
                model.currentChar().effects
                    .filter(eff => eff instanceof ActivatedEffect)
                    .filter((eff, i) => storedState.activeEffects[i])
                    .forEach(eff => eff.start(model.currentChar()));
                storedState.spells.forEach((spellLevel, i) => {
                    spellLevel.uses.forEach((use, j) => character.spells[i].uses[j](use));
                    spellLevel.memorised.forEach((spell, j) => spell.forEach((use, k) => character.spells[i].memorised[j].uses[k](use)));
                });
                m.redraw();
            }
        };
    },
    view: function(ctrl) {
        return m(".pure-g", [
            m(".pure-u-11-24", [
                Separator,
                m(".pure-u-1-6", m("span", ctrl.character.name())),
                m(".pure-u-1-6", m("span", ctrl.character.race())),
                m(".pure-u-1-6", m("span", ctrl.character.className())),
                m(".pure-u-1-6", m("span", ctrl.character.level())),
                m(".pure-u-1-6", m("span", ctrl.character.alignment())),
                m(".pure-u-1-12", m('button', {onclick: ctrl.saveState}, 'Save')),
                m(".pure-u-1-12", m('button', {onclick: ctrl.loadState}, 'Load')),
                Separator,
                m(".pure-u-1-3",
                  ctrl.character.stats.map(s => [
                          m(".pure-u-1-3", m("label", s.label())),
                          m(".pure-u-1-3", m("span", s.value())),
                          m(".pure-u-1-3", m("span", s.bonus()))
                      ])),
                m(".pure-u-1-3", [
                    ctrl.character.savingThrows.map(s => [
                            m(".pure-u-1-3", m("label", s.label())),
                            m(".pure-u-1-3", m("span", s.value())),
                            m(".pure-u-1-3")
                        ]),
                    m(".pure-u-1"),
                    m(".pure-u-1-3", m("label", "CMB")), m(".pure-u-1-3", m("span", ctrl.character.cmb())), m(".pure-u-1-3"),
                    m(".pure-u-1-3", m("label", "CMD")), m(".pure-u-1-3", m("span", ctrl.character.cmd())), m(".pure-u-1-3")
                ]),
                m(".pure-u-1-3", [
                    m(".pure-u-1-4", m("label", "AC")),
                    m(".pure-u-1-4", m("span", ctrl.character.ac())),
                    m(".pure-u-1-4", m("label", "touch")),
                    m(".pure-u-1-4", m("span", ctrl.character.touchAc())),
                    m(".pure-u-1-3", m("label", "HP [" + ctrl.character.maxHP() + "]")),
                    m(".pure-u-1-3", m("span", ctrl.character.currentHP() + (ctrl.character.tempHP() ? " (" + ctrl.character.tempHP() + ")" : ""))),
                    m(".pure-u-1-3"),
                    m(".pure-u-1-4", m("input[type=number][style='width:100%']", {onchange: m.withAttr("value", viewState.hp.change), value: viewState.hp.change()})),
                    m(".pure-u-1-4", m("button", {onclick: ctrl.changeHp(model.currentChar().doHeal.bind(model.currentChar()))}, "Heal")),
                    m(".pure-u-1-4", m("button", {onclick: ctrl.changeHp(model.currentChar().doDamage.bind(model.currentChar()))}, "Dam")),
                    m(".pure-u-1-4", m("button", {onclick: ctrl.changeHp(model.currentChar().hp.temp.bind(model.currentChar()))}, "Temp"))
                ]),
                Separator,
                model.currentChar().attacks.map(weapon => new Weapon(weapon))
                    .map(weapon => [
                            m(".pure-u-1-2", weapon.name()),
                            m(".pure-u-3-24[style='text-align:center']", weapon.attack()),
                            m(".pure-u-3-24[style='text-align:center']", weapon.damage()),
                            m(".pure-u-3-24[style='text-align:center']", weapon.type()),
                            m(".pure-u-3-24[style='text-align:center']", weapon.crit())
                        ]),
                Separator,
                m(".pure-u-1", ctrl.character.trackedAbilities.map(ability => {
                    return m(".pure-g", [
                        m(".pure-u-1-4", ability.name),
                        m(".pure-u-3-4",
                          ability.uses.map(use => m.component(Checkbox, use)))
                    ]);
                })),
                Separator,
                m(".pure-u-1", [
                    m(".pure-u-1-24", m("input[type=checkbox]", {
                        checked: model.currentChar().isArmorEquipped(),
                        onchange: e => model.currentChar().isArmorEquipped(e.target.checked)
                    })),
                    m(".pure-u-23-24", m("label", "Armor equipped?")),
                    model.currentChar().effects.map(function(effect){
                        return [
                            m(".pure-u-1-24", effect instanceof ActivatedEffect ? m("input[type=checkbox]", {
                                checked: effect.active(),
                                onchange: function(e) {
                                    if (e.target.checked) {
                                        effect.start(model.currentChar());
                                    } else {
                                        effect.end(model.currentChar());
                                    }
                                }
                            }) : ""),
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
                ctrl.character.spells.map(spellLevel => [
                        m(".pure-u-1-2", `Level ${spellLevel.level} spells - ${spellLevel.perDay} per day`),
                    m(".pure-u-1-2", spellLevel.uses.map(use => m.component(Checkbox, use))),
                        Separator,
                        spellLevel.known.map(knownSpell => m(".pure-u-1", knownSpell)),
                        spellLevel.memorised ? spellLevel.memorised.map(memSpell => m(".pure-u-1", [
                            memSpell.uses.map(use => m.component(Checkbox, use)),
                            memSpell.name ])) : "",
                        Separator
                    ])
            ])]);
    }
};

module.exports = Sheet;
