module.exports = Layout = {
    view: function(ctrl, subComponent){
        return m(".pure-g", [
            m(".pure-u-1-24"),
            m(".pure-u-11-12", subComponent),
            m(".pure-u-1-24")
        ]);
    }
};
