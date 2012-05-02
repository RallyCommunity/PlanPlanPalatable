Ext.define('PlanIterationsAndReleases.IterationsAndReleases', {
    extend: 'Ext.Container',
    
    initComponent: function(){
        this.callParent(arguments);
        this.buildReleaseComboBox();
    },
    
    buildReleaseComboBox: function(){
        this.releaseCombobox = Ext.widget('rallyreleasecombobox', {
            storeConfig: {
                filters: [{
                    property: 'State',
                    value: 'Accepted',
                    operator: '!='
                }],
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
        
        var startDateFilter = Ext.create('Rally.data.QueryFilter', {
            property: 'StartDate',
            value: selectedRelease.raw.ReleaseStartDate,
            operator: '>='
        }).and({
            property: 'StartDate',
            value: selectedRelease.raw.ReleaseDate,
            operator: '<='
        });
        
        var endDateFilter = Ext.create('Rally.data.QueryFilter', {
            property: 'EndDate',
            value: selectedRelease.raw.ReleaseDate,
            operator: '<='
        }).and({
            property: 'EndDate',
            value: selectedRelease.raw.ReleaseStartDate,
            operator: '>='
        });
        
        var filter = startDateFilter.or(endDateFilter);

        this.iterationTree = Ext.widget('rallytree', {
            topLevelModel: 'Iteration',
            enableDragAndDrop: true,

            topLevelStoreConfig: {
                filters: filter,
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
            },
            
            treeItemConfigForRecordFn: function(record){
                if(record.get('_type') === 'iteration'){
                    return {
                        xtype: 'rallyiterationtreeitem',
                        canDrag: false,
                        canDropOnMe: true,
                        expanded: true
                    };
                } else {
                    return {
                        xtype: 'rallytreeitem',
                        canDrag: true
                    }
                }
                
            }
        
        });

        this.add(this.iterationTree);
    }
    
});