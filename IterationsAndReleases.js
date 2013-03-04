Ext.define('PlanIterationsAndReleases.IterationsAndReleases', {
    extend: 'Ext.Container',
    
    initComponent: function(){
        this.callParent(arguments);
        this.add({
            xtype: 'component',
            autoEl: 'h1',
            html: 'Releases and Iterations'
        });
        
        this.enhanceIterationModel();
    },
    
    enhanceIterationModel: function(){
        Rally.data.ModelFactory.getModel({
            type: 'Iteration',
            success: function(model){
                this.enhancedIterationModel = Ext.define('EnhancedIterationModel', {
                    extend: model,
                    fields: [
                        {name: 'PlanEstimateRollup', type: 'int', defaultValue: 0}
                    ]
                });
                
                this.buildReleaseComboBox();
            },
            scope: this
        });
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
                ready: this.releaseSelected,
                select: this.releaseSelected,
                scope: this
            }
        });

        this.add(this.releaseCombobox);
        this.add({
            xtype: 'component',
            itemId: 'releaseLabel',
            cls: 'grayLabel'
        });
    },
    
    releaseSelected: function(){
        this.updateLabel();
        this.buildIterationTree();
    },
    
    updateLabel: function(){
        var release = this.releaseCombobox.getRecord();
        var startDate = Ext.Date.format(release.get('ReleaseStartDate'), 'F jS Y');
        var endDate = Ext.Date.format(release.get('ReleaseDate'), 'F jS Y');
        var tpl = Ext.create('Ext.XTemplate', 'Showing iterations that begin or end within this release ({StartDate} - {EndDate})')
        this.down('#releaseLabel').update(tpl.apply({
            Name: release.get('Name'),
            StartDate: startDate,
            EndDate: endDate
        }));
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
            topLevelModel: this.enhancedIterationModel,
            enableDragAndDrop: true,

            topLevelStoreConfig: {
                filters: filter,
                sorters: [
                    {
                        property: 'StartDate',
                        direction: 'asc'
                    }
                ]
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
                }
                
                if(record.get('_type') === 'hierarchicalrequirement'){
                    return {
                        xtype: 'rallystorytreeitem',
                        canDrag: true
                    };
                }
                
            },
            
            childItemsStoreConfigForParentRecordFn: function(record){
                var releaseFilter = Ext.create('Rally.data.QueryFilter', {
                    property: 'Release',
                    value: selectedRelease.get('_ref')
                });

                var iterationFilter = Ext.create('Rally.data.QueryFilter', {
                    property: 'Iteration',
                    value: record.get('_ref')
                });

                var filter = releaseFilter.and(iterationFilter);

                return {
                    listeners: {
                        load: function(store, records){
                            this.updateRollupOnIterations(records);
                        },
                        scope: this
                    },
                    filters: filter
                };
            },
            scope: this
        
        });

        this.add(this.iterationTree);
    },
    
    updateRollupOnIterations: function(records){
        if(records.length === 0){
            return;
        }
        
        //find the iteration tree item for the records
        var iterationTreeItem;
        Ext.each(this.query('rallyiterationtreeitem'), function(treeItem){
            if(treeItem.getRecord().get('Name') === records[0].get('Iteration')._refObjectName){
                iterationTreeItem = treeItem;
            }
        });

        //rollup plan estimate
        var planEstimateRollup = 0;
        Ext.each(records, function(record){
            planEstimateRollup += record.get('PlanEstimate');
        });
        
        //update iteration
        iterationTreeItem.getRecord().set('PlanEstimateRollup', planEstimateRollup);
        
        //redraw iteration
        iterationTreeItem.draw();
        
    }
    
});