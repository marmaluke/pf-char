var model = require('../models/Model'),
    utils = require('./Utils');

var Stat = require('./Stat');

var SavingThrow = require('./SavingThrow');

var Character = function(characterModel) {
    // var characterModel = model.currentChar();
    this.level = () => characterModel ? characterModel.level : "1";
    this.name = () => characterModel ? characterModel.name : "Character Name";
    this.race = () => characterModel ? characterModel.race : "Race";
    this.alignment = () => characterModel ? characterModel.alignment : "Alignment";
    this.className = () => characterModel ? characterModel.class.name : "Class";
    this.ac = () => characterModel ? characterModel.ac() : "10";
    this.touchAc = () => characterModel ? characterModel.touchAc() : "10";
    this.bab = () => characterModel ? characterModel.bab() : "0";
    this.cmb = () => characterModel ? utils.showBonus(characterModel.cmb()) : "0";
    this.cmd = () => characterModel ? characterModel.cmd() : "10";
    this.currentHP = () => characterModel ? characterModel.hp.max() - characterModel.hp.damage() : "0";
    this.maxHP = () => characterModel ? characterModel.hp.max() : "0";
    this.tempHP = () => characterModel ? characterModel.hp.temp() : "0";
    this.stats = [
        new Stat(characterModel.stats.str, "Str"),
        new Stat(characterModel.stats.dex, "Dex"),
        new Stat(characterModel.stats.con, "Con"),
        new Stat(characterModel.stats.int, "Int"),
        new Stat(characterModel.stats.wis, "Wis"),
        new Stat(characterModel.stats.cha, "Cha")
    ];

    this.savingThrows = [
        new SavingThrow(characterModel.class.saves.fort, "Fort"),
        new SavingThrow(characterModel.class.saves.ref, "Ref"),
        new SavingThrow(characterModel.class.saves.will, "Will")
    ];

    this.trackedAbilities = characterModel.trackedAbilities.map(ability => ({
        name: ability.name,
        uses: Array.apply(null, Array(ability.perDay)).map(() => m.prop(false))
    }));

    this.spells = characterModel.spells.map(spellLevel => ({
        level: spellLevel.level,
        perDay: spellLevel.perDay,
        uses: typeof spellLevel.perDay !== "number" ? [] : Array.apply(null, Array(spellLevel.perDay)).map(use => m.prop(false)),
        known: spellLevel.known,
        memorised: spellLevel.memorised ? spellLevel.memorised.map(spell => ({
            name: spell.name,
            uses: Array.apply(null, Array(spell.number)).map(use => m.prop(false))
        })) : []
    }));
};

module.exports = Character;
