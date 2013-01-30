Ext.define('PlanIterationsAndReleases.StoryTree', {
    extend: 'Ext.Container',
    
    initComponent: function(){
        this.callParent(arguments);
        this.add({
            xtype: 'component',
            autoEl: 'h1',
            html: 'Unscheduled Story Hierarchy'
        });
        this.add({
            xtype: 'component',
            cls: 'grayLabel',
            html: 'Drill down to see unscheduled leaf user stories. Drag and drop into an iteration on the right.'
        });
        this.buildTree();
    },
    
    buildTree: function(){

        Rally.data.util.PortfolioItemHelper.loadTypeOrDefault({
            success: function(typeRecord){

                var tree = Ext.widget('rallyportfoliotree', {
                    topLevelModel: typeRecord.get('TypePath'),
                    treeItemConfigForRecordFn: function(record){
                        var canDrag = record.get('_type') === 'hierarchicalrequirement' && record.get('Children').length === 0;
                        
                        var config = {
                            canDrag: canDrag
                        };
                        if(record.get('_type') === 'hierarchicalrequirement'){
                            config.xtype = 'rallystorytreeitem';
                        } else {
                            config.xtype = 'rallyportfolioitemtreeitem';
                        }
                        return config;
                    }
                });

                this.add(tree);

            },
            scope: this
        });

        
    }
});