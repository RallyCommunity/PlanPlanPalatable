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
            childItemsStoreConfigForParentRecordFn: function(record){
                
                if(record.get('UserStories') && record.get('UserStories').length > 0){
                    return {
                        filters: [
                            {
                                property: 'PortfolioItem',
                                value: record.get('_ref'),
                                operator: '='
                            },
                            {
                                property: 'Iteration',
                                value: 'null',
                                operator: '='
                            }
                        ]
                    };
                }
            },
            childModelTypeForRecordFn: function(record){
                if(record.get('_type') === 'portfolioitem'){
                    if(record.get('Children') && record.get('Children').length > 0){
                        return 'PortfolioItem';
                    } else if(record.get('UserStories') && record.get('UserStories').length > 0){
                        return 'UserStory';
                    }
                }
                if(record.get('_type') === 'hierarchicalrequirement'){
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
                return (record.get('Children') && record.get('Children').length > 0) || 
                (record.get('UserStories') && record.get('UserStories').length > 0);
            },
            dragThisGroupOnMeFn: function(record){
                return false;
            },
            treeItemConfigForRecordFn: function(record){
                var canDrag = record.get('_type') === 'hierarchicalrequirement' && record.get('Children').length === 0;
                
                return {
                    canDrag: canDrag
                };
            }

        });
        
        this.add(tree);
    }
});