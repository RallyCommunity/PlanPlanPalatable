Ext.define('Iterations', {
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
    	this.buildReleaseComboBox();
    },

    buildStoryTree: function(){
	var tree = Ext.widget('rallytree', {
	    topLevelModel: 'PortfolioItem',
	    enableDragAndDrop: true,

	    /*
	    TODO: Fix this defect, but it should work!
	    childItemsStoreConfig: {
		filters: [
		    {
		        property: 'Iteration',
		        value: 'null',
		        operator: '='
		   }
		],
		sorters: []
	    },
	    */

	    childModelTypeForRecordFn: function(record){
	    	if(record.get('Children') && record.get('Children').length > 0){
		    return 'PortfolioItem';
		} else if(record.get('UserStories') && record.get('UserStories').length > 0){
		   return 'UserStory';
		}
            	
       	    },
            parentAttributeForChildRecordFn: function(record){
                if(record.get('Children') && record.get('Children').length > 0){
		    return 'Parent';
		} else if(record.get('UserStories') && record.get('UserStories').length > 0){
		   return 'PortfolioItem';
		}
            },
            canExpandFn: function(record){
            	return (record.get('Children') && record.get('Children').length > 0) 
		|| (record.get('UserStories') && record.get('UserStories').length > 0);
            },
            dragThisGroupOnMeFn: function(record){
                return false;
	    }
	    
	});

	this.down('#leftSide').add(tree);

    },

    buildIterationTree: function(){

	if(this.iterationTree){
	    this.iterationTree.destroy();
	}

	var selectedRelease = this.releaseCombobox.getRecord();

	this.iterationTree = Ext.widget('rallytree', {
	    topLevelModel: 'Iteration',
	    enableDragAndDrop: true,

	    topLevelStoreConfig: {
		filters: [
		    {
		        property: 'StartDate',
		        value: selectedRelease.raw.ReleaseStartDate,
		        operator: '>='
		   },
		   {
		        property: 'EndDate',
		        value: selectedRelease.raw.ReleaseDate,
		        operator: '<='
		   }
		],
		sorters: []
	    },

	    childModelTypeForRecordFn: function(record){
	    	return 'UserStory';
            	
       	    },
            parentAttributeForChildRecordFn: function(record){
                return 'Iteration';
            },
            canExpandFn: function(record){
	    	if(record.get('_type') === 'iteration'){
		    return true;
		}
            	
            },
	    dragThisGroupOnMeFn: function(record){
                if(record.get('_type') === 'iteration'){
		    return 'hierarchicalrequirement';
		}
	    }
	    
	});

	this.down('#rightSide').add(this.iterationTree);
    },

    buildReleaseComboBox: function(){
	this.releaseCombobox = Ext.widget('rallyreleasecombobox', {

	   storeConfig: {
		sorters: [{
		  property: 'ReleaseStartDate',
		  direction: 'asc'
	         }]
	    },

	    listeners: {
		ready: this.buildIterationTree,
		select: this.buildIterationTree,
		scope: this
	    }
	});

	this.down('#rightSide').add(this.releaseCombobox);
    }

});
