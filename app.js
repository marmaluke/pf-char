var model = {
    level: m.prop(1),
    name: m.prop("Character Name"),
    alignments: [ "Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil" ],
    alignment: m.prop("Alignment"),
    className: m.prop("Class"),
    charClass: function(){
        return model.classes.filter(function(c){
            return c.name() == model.className();
        })[0];
    }
};
model.Stat = function(name, label){
    this.name = m.prop(name);
    this.label = m.prop(label);
    this.value = m.prop(10);
};
model.Stat.prototype.bonus = function(){
    return Math.floor((this.value() - 10) / 2);
};
model.Stat.byName = function(name) {
    return model.stats.filter(function(s){
        return s.name() == name;
    })[0];
};
model.stats = [
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
    this.progression = m.prop("slow");
};
model.SavingThrow.prototype.bonus = function(){
    var self = this,
        level = model.level(),
        charClass = model.charClass(),
        type = charClass ? charClass[self.name()]() : undefined,
        levelBonus;

    if (type == "good") {
        levelBonus = 2 + Math.floor(level / 2);
    } else {
        levelBonus = Math.floor(level / 3);
    }

    return levelBonus + model.stats.filter(function(s){return s.name() == self.stat();})[0].bonus();
};
model.savingThrows = [
    new model.SavingThrow("fort", "Fortitude", "con"),
    new model.SavingThrow("ref", "Reflex", "dex"),
    new model.SavingThrow("will", "Will", "wis")
];

model.CharClass = function(name, bab, fort, ref, will){
    this.name = m.prop(name);
    this.bab = m.prop(bab);
    this.fort = m.prop(fort);
    this.ref = m.prop(ref);
    this.will = m.prop(will);
};
model.classes = [
    new model.CharClass("Skald", "med", "good", "poor", "good"),
    new model.CharClass("Battlerager", "good", "good", "poor", "poor")
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
    view: function(){
        return [
            m(".pure-u-1-8"),
            m(".pure-u-3-4", component.Sheet),
            m(".pure-u-1-8")
        ];
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
    view: function() {
        return m(".pure-g", [
            component.Separator,
            m(".pure-u-1-4", m.component(component.Editable, {value: model.name})),
            m(".pure-u-1-4", m.component(component.ListEditable, {value: model.alignment, list: model.alignments})),
            m(".pure-u-1-4", m.component(component.ListEditable, {value: model.className, list: model.classes.map(function(c){return c.name();})})),
            m(".pure-u-1-4", m.component(component.Editable, {value: model.level})),
            component.Separator,
            m(".pure-u-1-3", [
                m("pure-g",
                  model.stats.map(function(s){
                      return [
                          m(".pure-u-1-3", m("label", {for: s.name()}, s.label())),
                          m(".pure-u-1-3", m.component(component.Editable, {id: s.name(), value: s.value})),
                          m(".pure-u-1-3", m("span", viewmodel.showBonus(s.bonus())))
                      ];
                  }))
            ]),
            m(".pure-u-1-3", [
                model.savingThrows.map(function(s){
                    return [
                        m(".pure-u-1-3", m("label", {for: s.name()}, s.label())),
                        m(".pure-u-1-3", m("span", viewmodel.showBonus(s.bonus()))),
                        m(".pure-u-1-3")
                      ];
                })
            ]),
            component.Separator
        ]);
    }
};

m.mount(document.getElementById("layout"), component.Layout);
