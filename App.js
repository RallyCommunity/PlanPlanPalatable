Ext.define('Hier', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
       this.add({xtype: 'rallytree'});
    }
});
