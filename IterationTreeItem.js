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
                    //return Ext.isDefined(me.getRecord().get('UserIterationCapacities'))? me.getRecord().render('UserIterationCapacities'): '';
                }
            }
        );
    },
    
    getExpanderTpl: function(){
        return Ext.create('Ext.XTemplate', '');
    }
});