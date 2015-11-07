var ActivatedEffect = function(ae){
    this.name = m.prop(ae.name);
    this.active = m.prop(false);
    this.description = m.prop(ae.description);
    this.start = function(){
        if (this.active()) return;
        this.active(true);
        ae.start(this.character());
    };
    this.end = function(){
        if (!this.active()) return;
        this.active(false);
        ae.end(this.character());
    };
    this.character = m.prop();
};

module.exports = ActivatedEffect;
