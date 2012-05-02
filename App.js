Ext.define('PlanIterationsAndReleases.App', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    layout: 'hbox',

    items: [
    	{
	        xtype: 'container',
    	    cls: 'leftSide',
    	    itemId: 'leftSide',
    	    flex: 1
    	},
    	{
    	    xtype: 'container',
    	    cls: 'rightSide',
    	    itemId: 'rightSide',
    	    flex: 1
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
