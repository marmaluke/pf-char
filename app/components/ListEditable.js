module.exports = ListEditable = {
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
