Ext.define('PlanIterationsAndReleases.StoryTreeItem', {
    extend: 'Rally.ui.tree.TreeItem',
    alias: 'widget.rallystorytreeitem',
    
    getPillTpl: function(){
        var me = this;

        return Ext.create('Ext.XTemplate',
            '<div class="pill">',
                '<tpl if="this.canDrag()"><div class="icon drag"></div></tpl>',
                '{[this.getActionsGear()]}',
                '<div class="textContent ellipses">{[this.getFormattedId()]} - {Name}</div>',
                '<div class="rightSide">',
                    '{[this.getPlanEstimate(values)]}',
                '</div>',
            '</div>',
            {
                canDrag: function(){
                    return me.getCanDrag();
                },
                getActionsGear: function(){
                    return '<div class="row-action icon"></div>';
                },
                getFormattedId: function(){
                    return me.getRecord().getField('FormattedID')? me.getRecord().render('FormattedID'): '';
                },
                getPlanEstimate: function(){
                    if(me.getRecord().get('PlanEstimate') > 0){
                        return '<div class="planEstimate">' + me.getRecord().get('PlanEstimate') + '</div>';
                    } else {
                        return '';
                    }
                }
            }
        );
    }
});