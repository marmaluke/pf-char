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

//var model = require('../models/Model');

var jerred = module.exports = new Character({
    name: "Jerred",
    race: "Undine",
    alignment: "Neutral",
    stats: {
        str: new Stat(8),
        dex: new Stat(12),
        con: new Stat(10),
        int: new Stat(10),
        wis: new Stat(18),
        cha: new Stat(16)
    },
    level: 1,
    class: {
        name: "Shaman",
        hd: 8,
        babProgression: "med",
        saves: {
            fort: new FortSave("poor"),
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
        new Weapon.Melee2H({
            name: "Longspear",
            atkBonus: 0,
            damBonus: 0,
            damageDice: "1d8",
            type: "P",
            crit: "20/x2"
        })
    ],
    trackedAbilities: [
        {
            name: "Stardust",
            perDay: 6
        }
    ],
    effects: [
        new PassiveEffect("Swim speed", "30 ft"),
        new PassiveEffect("Languages", "Common, Aquan"),
        new PassiveEffect("Cold Resistance", "5"),
        new PassiveEffect("Amphibious"),
        new PassiveEffect("Hydrated Vitality", "fast healing 2 for 1 round when submerged in water, max of 2 hp/day"),
        new PassiveEffect("Darkvision", "60 ft"),
        new ActivatedEffect({
            name: "Spirit Animal",
            description: "Snapping turtle (as familiar)",
            start: c => c.class.saves.fort.bonus(c.class.saves.fort.bonus() + 2),
            end: c => c.class.saves.fort.bonus(c.class.saves.fort.bonus() - 2)
        }),
        new PassiveEffect("Stardust (Sp)", "As a standard action, the shaman causes stardust to materialize around one creature within 30 feet. This stardust causes the target to shed light as a candle, and it cannot benefit from concealment or any invisibility effects. The creature takes a -1 penalty on attack rolls and sight-based Perception checks. This penalty to attack rolls and Perception checks increases by 1 at 4th level and every 4 levels thereafter, to a maximum of -6 at 20th level. This effect lasts for a number of rounds equal to half the shaman's level (minimum 1). Sightless creatures cannot be affected by this ability. The shaman can use this ability a number of times per day equal to 3 + her Charisma modifier."),
        new PassiveEffect("Spell Focus (conjuration)", "+1 to save DCs for conjuration spells")
    ],
    skills: [
        new Skill({
            name: "Climb",
            stat: "str",
            ranks: 0
        }, false, true),
        new Skill({
            name: "Fly",
            stat: "dex",
            ranks: 1
        }, true, true),
        new Skill({
            name: "Handle Animal",
            stat: "cha",
            ranks: 1
        }, true, false),
        new Skill({
            name: "Profession (sailor)",
            stat: "wis",
            ranks: 1
        }, true, false),
        new Skill({
            name: "Spellcraft",
            stat: "int",
            ranks: 1
        }, true, false),
        new Skill({
            name: "Survival",
            stat: "wis",
            ranks: 0
        }, true, false),
        new Skill({
            name: "Swim",
            stat: "str",
            ranks: 0
        }, true, true)
    ],
    spells: [
        {
            level: 0,
            perDay: "∞",
            known: [
                "Detect Magic",
                "Guaidance",
                "Light"
            ]
        },
        {
            level: 1,
            perDay: 1,
            known: [
                "Color Spray"
            ],
            memorised: [
                { name: "Cure Light Wounds", number: 1 },
                { name: "Bless", number: 1 }
            ]
        }
    ],
    gear: [],
    feats: [ "Spell Focus (conjuration)" ],
    cash: 0
});
