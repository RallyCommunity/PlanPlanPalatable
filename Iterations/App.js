Ext.define('Iterations', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
    	this.buildReleaseComboBox();
    },

    buildTree: function(){

	if(this.tree){
	    this.tree.destroy();
	}

	var selectedRelease = this.combobox.getRecord();

	this.tree = Ext.widget('rallytree', {
	    topLevelModel: 'Iteration',

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
            	
            }
	    
	});

	this.add(this.tree);
    },

    buildReleaseComboBox: function(){
	this.combobox = Ext.widget('rallyreleasecombobox', {
	    listeners: {
		ready: this.buildTree,
		select: this.buildTree,
		scope: this
	    }
	});

	this.add(this.combobox);
    }

});
