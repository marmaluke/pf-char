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

var artuk = new Character({
    name: "Artuk",
    race: "Orc",
    alignment: "Chaotic Evil",
    stats: {
        str: new Stat(22),
        dex: new Stat(12),
        con: new Stat(14),
        int: new Stat(8),
        wis: new Stat(6),
        cha: new Stat(14)
    },
    level: 8,
    class: {
        name: "Skald",
        hd: 8,
        babProgression: "med",
        saves: {
            fort: new FortSave("good"),
            ref: new RefSave("poor"),
            will: new WillSave("good")
        }
    },
    armor: {
        name: "+1 Mithril Breastplate",
        ac: 7,
        maxDex: 5,
        acp: -1
    },
    attacks: [
        new Weapon.Melee({
            name: "Cutlass",
            atkBonus: 0,
            damBonus: 0,
            damageDice: "1d6",
            type: "S",
            crit: "18-20/x2"
        }),
        new Weapon.Melee2H({
            name: "Cutlass (2H)",
            atkBonus: 0,
            damBonus: 0,
            damageDice: "1d6",
            type: "S",
            crit: "18-20/x2"
        }),
        new Weapon.Melee({
            name: "Morningstar +1",
            atkBonus: 1,
            damBonus: 1,
            damageDice: "1d8",
            type: "B/P",
            crit: "x2"
        }),
        new Weapon.Melee2H({
            name: "Morningstar +1 (2H)",
            atkBonus: 1,
            damBonus: 1,
            damageDice: "1d8",
            type: "B/P",
            crit: "x2"
        }),
        new Weapon.Melee({
            name: "Trident of Zul +1, human bane",
            atkBonus: 1,
            damBonus: 1,
            damageDice: "1d8",
            type: "P",
            crit: "x2"
        }),
        new Weapon.Melee2H({
            name: "Trident of Zul +1, human bane (2H)",
            atkBonus: 1,
            damBonus: 1,
            damageDice: "1d8",
            type: "P",
            crit: "x2"
        })
    ],
    trackedAbilities: [
        {
            name: "Raging Song",
            perDay: 19
        },
	{
	    name: "Lore Master",
	    perDay: 1
	},
        {
            name: "Spell Kenning",
            perDay: 1
        }
    ],
    effects: [
        new PassiveEffect("Peg Leg", "+1 Fort, +1 damage vs aquatic animals"),
        new PassiveEffect("Iron Liver", "+1 Fort vs poisons and drugs, +3 Fort vs alcohol"),
        new PassiveEffect("Fearless Raider", "+4 save vs fear, +4 Intimidate DC"),
        new PassiveEffect("Ferocity", "Keep fighting below 0 hp"),
        new PassiveEffect("Darkvision", "60 ft"),
        new PassiveEffect("Dayrunner", "-2 ranged atks"),
        new ActivatedEffect({
            name: "Raging Song: Inspired Rage",
            description: "+4 Str/Con, -1 AC, +3 Will",
            start: function(c){
                c.stats.str.value(c.stats.str.value() + 4);
                c.stats.con.value(c.stats.con.value() + 4);
                c.class.saves.will.bonus(c.class.saves.will.bonus() + 3);
                c.mods().ac(c.mods().ac() + Math.floor(c.level / 4));

                c.attacks.push(new Weapon.Melee({
                    name: "Claw (lesser beast totem)",
                    atkBonus: 0,
                    damBonus: 0,
                    damageDice: "1d6",
                    type: "B/S",
                    crit: "20/x2"
                }));
            },
            end: function(c){
                c.stats.str.value(c.stats.str.value() - 4);
                c.stats.con.value(c.stats.con.value() - 4);
                c.class.saves.will.bonus(c.class.saves.will.bonus() - 3);
                c.mods().ac(c.mods().ac() - Math.floor(c.level / 4));

                var i = c.attacks.map(w => w.name).indexOf("Claw (lesser beast totem)");
                c.attacks.splice(i, 1);
            }
        }),
        new PassiveEffect("Raging Song: Glorious Epic", "1 rnd of raging song, 10 minutes: gain +2 on Diplomacy or Intimidate"),
        new PassiveEffect("Raging Song: Song of Strength", "once per round, +3 on Strength or Strength-based skill check"),
        new ActivatedEffect({
            name: "Heroism",
            start: function(c){
                c.mods().atk(c.mods().atk() + 2);
                c.mods().skill(c.mods().skill() + 2);
                Object.getOwnPropertyNames(c.class.saves).forEach(function(saveName) {
                    var save = c.class.saves[saveName];
                    save.bonus(save.bonus() + 2);
                });
            },
            end: function(c){
                c.mods().atk(c.mods().atk() - 2);
                c.mods().skill(c.mods().skill() - 2);
                Object.getOwnPropertyNames(c.class.saves).forEach(function(saveName) {
                    var save = c.class.saves[saveName];
                    save.bonus(save.bonus() - 2);
                });
            }
        }),
        new ActivatedEffect({
            name: "Haste",
            description: "Extra attack when full-attacking; +1 to hit, AC and reflex saves; +20 feet mavement",
            start: c => {
                c.mods().atk(c.mods().atk() + 1);
                c.mods().ac(c.mods().ac() + 1);
                c.class.saves.ref.bonus(c.class.saves.ref.bonus() + 1);
            },
            end: c => {
                c.mods().atk(c.mods().atk() - 1);
                c.mods().ac(c.mods().ac() - 1);
                c.class.saves.ref.bonus(c.class.saves.ref.bonus() - 1);
            }
        }),
        new ActivatedEffect({
            name: "Arcane Strike",
            description: "+2 damage",
            start: function(c){
                c.mods().dam(c.mods().dam() + (1 + Math.floor(c.level / 5)));
            },
            end: function(c){
                c.mods().dam(c.mods().dam() - (1 + Math.floor(c.level / 5)));
            }
        }),
        new ActivatedEffect({
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
        new ActivatedEffect({
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
        new ActivatedEffect({
            name: "Alter Self (medium)",
            start: function(c){
                c.stats.str.value(c.stats.str.value() + 2);
            },
            end: function(c){
                c.stats.str.value(c.stats.str.value() - 2);
            }
        }),
        new PassiveEffect("Rage Power: Lesser Beast Totem", "Grow claws while raging"),
        new PassiveEffect("Rage Power: Beast Totem", "Natural armor bonus while raging"),
        new PassiveEffect("Furious Focus", "No Power Attack penalty on first attack of the round"),
        new PassiveEffect("Uncanny Dodge", "Cannot be caught flat-footed, don't lose dex bonus to AC vs invisible foes"),
        new PassiveEffect("Improved Uncanny Dodge", "Cannot be flanked (sneak attack requires rogue level +4)"),
	new PassiveEffect("Lore Master", "Take 10 on trained Knowledge skills; 1/day,take 20 on a Knowledge check as a standard action"),
	new ActivatedEffect({
	    name: "Shield of Swings",
	    description: "Gain bonus to AC; reduce damage by half",
	    start: function(c) {
		c.mods().ac(c.mods().ac() + 4);
	    },
	    end: function(c) {
		c.mods().ac(c.mods().ac() - 4);
	    }
	}),
        new PassiveEffect("Svengli's Eye (magic item)", "+4 to navigate; 1 rnd per day, acts as True Seeing"),
        new ActivatedEffect({
            name: "Cloak of Resistance",
            description: "+1",
            start: c => {
                c.class.saves.fort.bonus(c.class.saves.fort.bonus() + 1);
                c.class.saves.ref.bonus(c.class.saves.ref.bonus() + 1);
                c.class.saves.will.bonus(c.class.saves.will.bonus() + 1);
            },
            end: c => {
                c.class.saves.fort.bonus(c.class.saves.fort.bonus() - 1);
                c.class.saves.ref.bonus(c.class.saves.ref.bonus() - 1);
                c.class.saves.will.bonus(c.class.saves.will.bonus() - 1);
            }
        })
    ],
    skills: [
        new Skill({
            name: "Acrobatics",
            stat: "dex",
            ranks: 1,
            conditional: () => "+" + Math.floor(artuk.level / 2)  +  " while aboard a boat"
        }, true, true),
        new Skill({
            name: "Climb",
            stat: "str",
            ranks: 1,
            conditional: () => "+" + Math.floor(artuk.level / 2)  +  " while aboard a boat"
        }, true, true),
        new Skill({
            name: "Knowledge (local)",
            stat: "int",
            ranks: 1
        }, true, false),
        new Skill({
            name: "Perform (Percussion)",
            stat: "cha",
            ranks: 8
        }, true, false),
        new Skill({
            name: m.trust("&nbsp;&nbsp;&nbsp;Intimidate"),
            stat: "cha",
            ranks: 8
        }, true, false),
        new Skill({
            name: m.trust("&nbsp;&nbsp;&nbsp;Handle Animal"),
            stat: "cha",
            ranks: 8
        }, true, false),
        new Skill({
            name: "Perform (Oratory)",
            stat: "cha",
            ranks: 8
        }, true, false),
	new Skill({
            name: m.trust("&nbsp;&nbsp;&nbsp;Diplomacy"),
            stat: "cha",
            ranks: 8
        }, true, false),
        new Skill({
            name: m.trust("&nbsp;&nbsp;&nbsp;Sense Motive"),
            stat: "cha",
            ranks: 8
        }, true, false),
	new Skill({
            name: "Perform (Sing)",
            stat: "cha",
            ranks: 2
        }, true, false),
	new Skill({
            name: "Profession (Sailor)",
            stat: "wis",
            ranks: 1,
            bonus: () => Math.floor(artuk.level / 2)
        }, true, false),
        new Skill({
            name: "Survival",
            stat: "wis",
            ranks: 0,
            conditional: () => "+" + Math.floor(artuk.level / 2)  +  " at sea"
        }, false, false),
        new Skill({
            name: "Swim",
            stat: "str",
            ranks: 1,
            bonus: () => Math.floor(artuk.level / 2)
        }, true, true),
        new Skill({
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
		"Feather Fall",
                "Feather Step",
                "Identify",
                "Timely Inspiration"
            ]
        },
        {
            level: 2,
            perDay: 5,
            known: [
                "Alter Self",
                "Bladed Dash",
                "Heroism",
                "Mirror Image - 1d4 + 2 images"
            ]
        },
        {
            level: 3,
            perDay: 2,
            known: [
                "Haste",
		"See Invisibility",
                "Cure Serious Wounds"
            ]
        }
    ],
    cash: 6992,
    gear: [
	"Svengli's eye: +4 to navigate; 1 rnd per day, acts as True Seeing",
        "Potion of resist energy",
        "Wand of CLW (charges: 50)",
        "Belt of Giant Strength +2",
        "Cloak of Resistance +1"
    ],
    feats: ["Arcane Strike", "Power Attack", "Shield of Swings", "Furious Focus", "*Dreadful Carnage (lvl 11)"]
})

module.exports = artuk;
