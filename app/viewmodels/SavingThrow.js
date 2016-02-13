var utils = require('./Utils');

var SavingThrow = function(savingThrowModel, label){
    this.model = savingThrowModel;
    this.label = m.prop(label);


};

SavingThrow.prototype.value = function() {
    return utils.showBonus(this.model.value());
};

module.exports = SavingThrow;
