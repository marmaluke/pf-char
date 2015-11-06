module.exports = PassiveEffect = function(name, description){
    this.name = typeof name === "function" ? description : m.prop(name);
    this.description = typeof description === "function" ? description : m.prop(description);
};
