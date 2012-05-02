Ext.define('PlanIterationsAndReleases.IterationsAndReleases', {
    extend: 'Ext.Container',
    
    initComponent: function(){
        this.callParent(arguments);
        this.buildReleaseComboBox();
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

    	this.add(this.releaseCombobox);
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

	    this.add(this.iterationTree);
    }
    
});