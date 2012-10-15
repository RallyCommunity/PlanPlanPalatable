Ext.define('PlanPlanPalatable', {
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
        this.buildStoryTree();
        this.buildIterationsAndReleases();
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
