Ext.define('PlanIterationsAndReleases.App', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    items: [
        {
            xtype: 'container',
            cls: 'leftSide',
            itemId: 'leftSide'
        },
        {
            xtype: 'container',
            cls: 'rightSide',
            itemId: 'rightSide'
        }
    ],

    launch: function() {
        Rally.loadScripts([
            'https://raw.github.com/timrwood/moment/1.6.1/min/moment.min.js'
        ], Ext.bind(function(){
            this.buildStoryTree();
            this.buildIterationsAndReleases();
        }, this));
        
        
    },

    buildStoryTree: function(){
        var storyTree = Ext.create('PlanIterationsAndReleases.StoryTree');
        this.down('#leftSide').add(storyTree);
    },
    
    buildIterationsAndReleases: function(){
        var iterationsAndReleases = Ext.create('PlanIterationsAndReleases.IterationsAndReleases');
        this.down('#rightSide').add(iterationsAndReleases);
    }

});
