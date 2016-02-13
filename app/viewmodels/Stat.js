var model = require('../models/Model'),
    utils = require('./Utils');

var Stat = function(statModel, label){
    this.model = statModel;
    this.label = m.prop(label);
};

Stat.prototype.value = function() {
    return this.model.value();
};

Stat.prototype.bonus = function(){
    return utils.showBonus(this.model.bonus());
};

module.exports = Stat;
