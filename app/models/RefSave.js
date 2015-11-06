var SavingThrow = require('./SavingThrow');

var RefSave = function(progression){
    return new SavingThrow(progression, "dex");
};

module.exports = RefSave;
