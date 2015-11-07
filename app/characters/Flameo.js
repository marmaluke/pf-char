var Character = require('../models/Character'),
    Stat = require('../models/Stat'),
    SavingThrow = require('../models/SavingThrow'),
    FortSave = SavingThrow.FortSave,
    RefSave = SavingThrow.RefSave,
    WillSave = SavingThrow.WillSave,
    Weapon = require('../models/Weapon'),
    PassiveEffect = require('../models/PassiveEffect'),
    ActivatedEffect = require('../models/ActivatedEffect'),
    Skill = require('../models/Skill');

var flameo = new Character({
    name: "Flameo",
    race: "Human",
    alignment: "Chaotic Neutral",
    stats: {
        str: new Stat(15),
        dex: new Stat(18),
        con: new Stat(18),
        int: new Stat(14),
        wis: new Stat(14),
        cha: new Stat(13)
    },
    level: 5,
    class: {
        name: "Kineticist",
        hd: 8,
        babProgression: "med",
        saves: {
            fort: new FortSave("good"),
            ref: new RefSave("good"),
            will: new WillSave("poor")
        }
    },
    armor: {
        name: "+1 Mithril Chain Shirt",
        ac: 5,
        maxDex: 6,
        acp: 0
    },
    attacks: [
        new Weapon.Special({
            name: "Flame Blast",
            atkStat: "dex",
            damStat: "con",
            isTwoHanded: false,
            isRanged: true,
            type: "fire",
            crit: "x2",
            damageDice: "3d6"
        })
    ],
    trackedAbilities: [],
    effects: [
        new ActivatedEffect({
            name: "Point-Blank Shot",
            description: "Gain a bonus on atk/dam within 30'",
            start: function(c) {
                c.mods().atk(c.mods().atk() + 1);
                c.attacks.forEach(function(w){
                    if (w.isRanged()) {
                        w.damBonus(w.damBonus() + 1);
                    }
                });
            },
            end: function(c) {
                c.mods().atk(c.mods().atk() - 1);
                c.attacks.forEach(function(w){
                    if (w.isRanged()) {
                        w.damBonus(w.damBonus() - 1);
                    }
                });
            }
        }),
        new PassiveEffect("Precise Shot", "Don't take penalty when firing at a target in melee"),
        new PassiveEffect("Dodge", "+1 dodge bonus to AC")
    ],
    skills: [
        new Skill({
            name: "Acrobatics",
            stat: "dex",
            ranks: 5
        }, true, true),
        new Skill({
            name: "Escape Artist",
            stat: "dex",
            ranks: 5
        }, true, true),
        new Skill({
            name: "Perception",
            stat: "wis",
            ranks: 5
        }, true, true),
        new Skill({
            name: "Knowledge (nature)",
            stat: "int",
            ranks: 5
        }, true, true),
        new Skill({
            name: "Stealth",
            stat: "dex",
            ranks: 5
        }, true, true),
        new Skill({
            name: "Use Magic Device",
            stat: "cha",
            ranks: 5
        }, true, true)
    ],
    spells: [],
    cash: 0
});

flameo.mods().ac(1); // Dodge feat

module.exports = flameo;
