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
                getCapacity: function(recordData){
                    var resources = me.getRecord().get('Resources');
                    var planEstimateRollup = me.getRecord().get('PlanEstimateRollup');

                    if(resources == 0){
                        return '';
                    }
                    
                    return me.getCapacityTemplate().apply(recordData);
                }
            }
        );
    },
    
    getExpanderTpl: function(){
        return Ext.create('Ext.XTemplate', '');
    },
    
    getCapacityTemplate: function(){
        return Ext.create('Ext.XTemplate', 
            '<div class="percentDoneContainer">',
            '<div class="percentDoneBar" style="background-color: {[this.calculateColor(values)]}; width: {[this.calculateWidth(values)]}; "></div>',
            '<div class="percentDoneLabel">',
            '{[this.calculatePercent(values)]}',
            '</div>',
            '</div>',
            {
                calculateColor: function(recordData){
                    var percent = recordData.PlanEstimateRollup/recordData.Resources;
                    if(percent > 1){
                        return '#EDB5B1';
                    }
                    if(percent > .8){
                        return '#FBEDCA';
                    }
                    return '#3F84A4';
                },
                calculatePercent: function(recordData){
                    return Math.round(recordData.PlanEstimateRollup/recordData.Resources*100) + '%';
                },
                calculateWidth: function(recordData){
                    var width = Math.round(recordData.PlanEstimateRollup/recordData.Resources*100);
                    width = Math.min(width, 100);
                    return width + '%';
                }
        });
    }
});