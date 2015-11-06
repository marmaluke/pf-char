var Character = require('../models/Character'),
    Stat = require('../models/Stat'),
    FortSave = require('../models/FortSave'),
    RefSave = require('../models/RefSave'),
    WillSave = require('../models/WillSave');

var fang = module.exports = new Character({
    name: "Fang",
    race: "Human",
    alignment: "Neutral",
    stats: {
        str: new Stat(19),
        dex: new Stat(10),
        con: new Stat(14),
        int: new Stat(10),
        wis: new Stat(10),
        cha: new Stat(14)
    },
    level: 5,
    class: {
        name: "Bloodrager",
        hd: 10,
        babProgression: "high",
        saves: {
            fort: new FortSave("good"),
            ref: new RefSave("poor"),
            will: new WillSave("poor")
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
});
