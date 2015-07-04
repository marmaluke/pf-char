var model = {
    character: {
        level: function(){return model.currentChar() ? model.currentChar().level : 1;},
        name: function(){return model.currentChar() ? model.currentChar().name : "Character Name";},
        alignment: function(){return model.currentChar() ? model.currentChar().alignment : "Alignment";},
        className: function(){return model.currentChar() ? model.currentChar().class.name : "Class";}
    },
    currentChar: m.prop(),
    characters: {
        artuk: {
            name: "Artuk",
            alignment: "Chaotic Evil",
            stats: { str: 19, dex: 12, con: 14, int: 6, wis: 8, cha: 14 },
            level: 5,
            class: {
                name: "Skald",
                hd: 8,
                bab: "med",
                saves: { fort: "good", ref: "poor", will: "good" }
            }
        }
    }
};

model.Stat = function(name, label){
    this.name = m.prop(name);
    this.label = m.prop(label);
};
model.Stat.prototype.value = function() {
    return model.currentChar() ? model.currentChar().stats[this.name()] : 10;
};
model.Stat.prototype.bonus = function(){
    return Math.floor((this.value() - 10) / 2);
};
model.Stat.byName = function(name) {
    return model.character.stats.filter(function(s){
        return s.name() == name;
    })[0];
};
model.character.stats = [
    new model.Stat("str", "Strength"),
    new model.Stat("dex", "Dexterity"),
    new model.Stat("con", "Constitution"),
    new model.Stat("int", "Intelligence"),
    new model.Stat("wis", "Wisdom"),
    new model.Stat("cha", "Charisma")
];

model.SavingThrow = function(name, label, stat){
    this.name = m.prop(name);
    this.label = m.prop(label);
    this.stat = m.prop(stat);
};
model.SavingThrow.prototype.progression = function(){
    return model.currentChar() ? model.currentChar().class.saves[this.name()] : "poor";
};
model.SavingThrow.prototype.bonus = function(){
    var level = model.character.level(),
        levelBonus;

    if (this.progression() == "good") {
        levelBonus = 2 + Math.floor(level / 2);
    } else {
        levelBonus = Math.floor(level / 3);
    }

    return levelBonus + model.Stat.byName(this.stat()).bonus();
};
model.character.savingThrows = [
    new model.SavingThrow("fort", "Fortitude", "con"),
    new model.SavingThrow("ref", "Reflex", "dex"),
    new model.SavingThrow("will", "Will", "wis")
];


var viewmodel = {
    showBonus: function(bonus){
        return (bonus < 0 ? "" : "+") + bonus;
    },
    toOption: function(obj){
        return m("option", obj);
    }
};

var component = {};
component.Layout = {
    view: function(ctrl, subComponent){
        return m(".pure-g", [
            m(".pure-u-1-8"),
            m(".pure-u-3-4", subComponent),
            m(".pure-u-1-8")
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
        return {};
    },
    view: function(ctrl) {
        return m(".pure-g", [
            component.Separator,
            m(".pure-u-1-3", m("span", model.character.name())),
            m(".pure-u-1-6", m("span", model.character.className())),
            m(".pure-u-1-6", m("span", model.character.level())),
            m(".pure-u-1-3", m("span", model.character.alignment())),
            component.Separator,
            m(".pure-u-1-3", [
                m("pure-g",
                  model.character.stats.map(function(s){
                      return [
                          m(".pure-u-1-3", m("label", s.label())),
                          m(".pure-u-1-3", m("span", s.value())),
                          m(".pure-u-1-3", m("span", viewmodel.showBonus(s.bonus())))
                      ];
                  }))
            ]),
            m(".pure-u-1-3", [
                model.character.savingThrows.map(function(s){
                    return [
                        m(".pure-u-1-3", m("label", s.label())),
                        m(".pure-u-1-3", m("span", viewmodel.showBonus(s.bonus()))),
                        m(".pure-u-1-3")
                      ];
                })
            ]),
            m(".pure-u-1-3", [

            ]),
            component.Separator
        ]);
    }
};

component.ChooseCharacter = {
    view: function(){
        return m(".pure.g", [
            m("h2", "Choose a character"),
            Object.getOwnPropertyNames(model.characters).map(function(cname){
                return m("a", {href: "/" + cname, config: m.route}, model.characters[cname].name);
            })
        ]);
    }
};

m.route(document.getElementById("layout"), "/", {
    "/:char": m.component(component.Layout, component.Sheet),
    "/": m.component(component.Layout, component.ChooseCharacter)
});
