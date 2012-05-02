Ext.define('PlanIterationsAndReleases.StoryTree', {
    extend: 'Ext.Container',
    
    initComponent: function(){
        this.callParent(arguments);
        this.buildTree();
    },
    
    buildTree: function(){
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
    	
    	this.add(tree);
    }
});