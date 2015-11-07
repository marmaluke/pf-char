//var m = require('mithril');

var model = require('./models/Model'),
    ActivatedEffect = require('./models/ActivatedEffect');

var Layout = require('./components/Layout'),
    ChooseCharacter = require('./components/ChooseCharacter'),
    CharacterSheet = require('./components/Sheet');

exports.init = function() {
    console.log('Initialising app');
    m.route(document.getElementById("layout"), "/", {
        "/:char": m.component(Layout, Sheet),
        "/": m.component(Layout, ChooseCharacter)
    });
};
