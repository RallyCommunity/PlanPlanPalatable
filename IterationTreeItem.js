Ext.define('PlanIterationsAndReleases.IterationTreeItem', {
    extend: 'Rally.ui.tree.TreeItem',
    alias: 'widget.rallyiterationtreeitem',
    
    getPillTpl: function(){
        var me = this;

        return Ext.create('Ext.XTemplate',
            '<div class="pill">',
                '{[this.getActionsGear()]}',
                '<div class="textContent ellipses">{Name}</div>',
                '<div class="rightSide">',
                    '{[this.getCapacity(values)]}',
                '</div>',
            '</div>',
            {
                getActionsGear: function(){
                    return '<div class="row-action icon"></div>';
                },
                getCapacity: function(){
                    return '';
                    //TODO - we don't have rollup info about the stories in this iteration on the response.
                    var resources = me.getRecord().get('Resources');
                    if(resources == 0){
                        return '';
                    }
                    return resources;
                }
            }
        );
    },
    
    getExpanderTpl: function(){
        return Ext.create('Ext.XTemplate', '');
    }
});