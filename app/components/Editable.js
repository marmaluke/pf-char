module.exports = Editable = {
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
