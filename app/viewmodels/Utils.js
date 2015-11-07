exports.toOption = function(obj){
    return m("option", obj);
};

exports.showBonus = function(bonus){
    return (bonus < 0 ? "" : "+") + bonus;
};
