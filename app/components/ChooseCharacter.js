var model = require('../models/Model');

module.exports = ChooseCharacter = {
    view: function(){
        return m(".pure.g", [
            m("h2", "Choose a character"),
            m("ul", Object.getOwnPropertyNames(model.characters).map(function(cname){
                return m("li", m("a", {href: "/" + cname, config: m.route}, model.characters[cname].name));
            }))
        ]);
    }
};
