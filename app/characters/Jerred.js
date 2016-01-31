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
        wis: new Stat(19),
        cha: new Stat(16)
    },
    level: 7,
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
        name: "+1 Mithril Breastplate",
        ac: 7,
        maxDex: 5,
        acp: -1
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
        { name: "Stardust", perDay: 6 },
        { name: "Channel (3d6)", perDay: 4 }
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
        new PassiveEffect("Spell Focus (conjuration)", "+1 to save DCs for conjuration spells"),
        new PassiveEffect("Evil Eye (Su, hex)", "The shaman causes doubt to creep into the mind of a foe within 30 feet that she can see. The target takes a –2 penalty on one of the following (shaman's choice): ability checks, AC, attack rolls, saving throws, or skill checks. This hex lasts a number of rounds equal to 3 + the shaman's Wisdom modifier. A successful Will saving throw reduces this to just 1 round. At 8th level, the penalty increases to –4. This is a mind-affecting effect."),
        new ActivatedEffect({
            name: "Bless",
            start: c => c.mods().atk(c.mods().atk() + 1),
            end: c => c.mods().atk(c.mods().atk() - 1)
        }),
        new ActivatedEffect({
            name: "Barkskin",
            start: c => c.mods().ac(c.mods().ac() + 2 + Math.floor((c.level - 3) / 3)),
            end: c => c.mods().ac(c.mods().ac() - 2 - Math.floor((c.level - 3) / 3))
        }),
        new PassiveEffect("Wandering Spirit", "Life"),
        new PassiveEffect("Lure of the Heavens (Su, hex)", "don't leave tracks; can hover 6 inches above ground or liquid surfaces"),
        new PassiveEffect("Channel", "Heal 3d6"),
        new PassiveEffect("Heaven's Leap (Su, hex)", "as jester's jaunt")
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
            ranks: 7
        }, true, true),
        new Skill({
            name: "Handle Animal",
            stat: "cha",
            ranks: 7
        }, true, false),
        new Skill({
            name: "Profession (sailor)",
            stat: "wis",
            ranks: 1
        }, true, false),
        new Skill({
            name: "Spellcraft",
            stat: "int",
            ranks: 7
        }, true, false),
        new Skill({
            name: "Survival",
            stat: "wis",
            ranks: 5
        }, true, false),
        new Skill({
            name: "Swim",
            stat: "str",
            ranks: 1
        }, true, true)
    ],
    spells: [
        {
            level: 0,
            perDay: "∞",
            known: [
                "Detect Magic",
                "Guaidance",
                "Light",
                "Mending"
            ]
        },
        {
            level: 1,
            perDay: 1,
            known: [ "Color Spray", "Detect Undead" ],
            memorised: [
                { name: "Cure Light Wounds", number: 4 },
                { name: "Bless", number: 1 }
            ]
        },
        {
            level: 2,
            perDay: 1,
            known: [ "Hypnotic Pattern", "Lesser Restoration" ],
            memorised: [
                { name: "Barkskin", number: 1 },
                { name: "Spiritual Weapon", number: 3 }
            ]
        },
        {
            level: 3,
            perDay: 1,
            known: [ "Daylight", "Neutralize Poison" ],
            memorised: [
                { name: "Stinking Cloud", number: 1 },
                { name: "Summon Nature's Ally III", number: 2 }
            ]
        },
        {
            level: 4,
            perDay: 1,
            known: [ "Rainbow Pattern", "Restoration" ],
            memorised: [
                { name: "Summon Nature's Ally IV", number: 1 },
                { name: "Fear", number: 1 }
            ]
        }
    ],
    gear: [],
    feats: [ "Spell Focus (conjuration)", "Augment Summoning", "Superior Summoning", "Moonlight Summons" ],
    cash: 0
});
