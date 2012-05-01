Ext.define('Hier', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
    	
    	var tree = Ext.widget('rallytree', {
	    topLevelModel: 'PortfolioItem',
	    enableDragAndDrop: true,

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
