var SavingThrow = require('./SavingThrow');

var FortSave = function(progression){
    return new SavingThrow(progression, "con");
};

module.exports = FortSave;
