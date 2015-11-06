var SavingThrow = require('./SavingThrow');

var WillSave = function(progression){
    return new SavingThrow(progression, "wis");
};

module.exports = WillSave;
