module.exports = Checkbox = {
    controller: initialState => ({ selected: initialState ? initialState : m.prop(false) }),
    view: ctrl => m('input[type=checkbox]', { checked: ctrl.selected(), onchange: m.withAttr('checked', ctrl.selected) })
};
