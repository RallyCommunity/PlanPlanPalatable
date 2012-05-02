(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * A TreeItem represents a record in a Rally.ui.tree.Tree.
     * It can contain other TreeItems, so a Tree component can build a full hierarchy.
     */
    Ext.define('Rally.ui.tree.TreeItem', {
        extend: 'Ext.Container',
        requires: ['Ext.XTemplate'],
        alias: 'widget.rallytreeitem',

        cls: 'treeItem',

        items: {
            xtype: 'container',
            itemId: 'pill'
        },

        config: {
            /**
             * @cfg {Rally.domain.WsapiModel}
             * The record to draw the item for.
             */
            record: undefined,

            /**
             * @cfg {Rally.ui.tree.TreeItem}
             * The tree item that contains this tree item
             */
            parentTreeItem: undefined,

            /**
             * @cfg {Function}
             * A function that returns true if the given record can be expanded
             */
            canExpandFn: Ext.emptyFn,

            /**
             * @cfg {Object}
             * Scope that any passed in function (canExpandFn, etc) is called with.
             */
            scope: undefined,

            /**
             * @cfg {Boolean}
             * Whether this item can be dragged onto other tree items to rearrange a hierarchy.
             * Reparenting logic occurs at the Tree level, this determines whether to wire up dragging.
             */
            canDrag: false,
            
            /**
             * @cfg {Boolean}
             * Whether this item allows other tree items to be dropped on it to rearrange a hierarchy.
             * Reparenting logic occurs at the Tree level, this determines whether to wire up drop logic.
             */
            canDropOnMe: false,

            /**
             * @cfg {Boolean}
             * The item is expanded or not
             */
            expanded: false
        },

        constructor: function(config){
            this.initConfig(config);
            this.callParent(arguments);
        },

        initComponent: function(){
            this.callParent(arguments);

            this.addEvents(
                    /**
                     * @event
                     * @param record the record this item represents
                     * Tree Item expanded
                     */
                    'expand',
                    /**
                     * @event
                     * @param record the record this item represents
                     * Tree Item collapsed
                     */
                    'collapse',
                    /**
                     * @event
                     * @param treeItem this tree item
                     * Tree Item drawn (every time it's drawn)
                     */
                    'draw'
            );

            this.addCls(Rally.util.Test.toBrowserTestCssClass(this.getRecord().get('ObjectID')));

            this.on('afterrender', function(){
                this.draw();
                
                if(this.getExpanded()){
                    this.fireEvent('expand', this);
                }
            }, this);
            
        },

        /**
         * draws the content of the tree item.
         */
        draw: function(){
            this.down('#pill').update(this.applyRenderTpl());
            this.setupListeners();
            this.fireEvent('draw');
        },

        applyRenderTpl: function(){
            return this.getExpanderTpl().apply(this.getRenderData()) + this.getPillTpl().apply(this.getRenderData());
        },

        getExpanderTpl: function(){
            var me = this;
            return Ext.create('Ext.XTemplate',
                '<a href="#" <tpl if="!this.canExpand()">style="display: none" </tpl>class="expander {[this.expandOrCollapse()]}"></a>',
                {
                    canExpand: function(){
                        return me.canExpand();
                    },
                    expandOrCollapse: function(){
                        return me.getExpanded()? 'collapseTriangle': 'expandTriangle';
                    }
                }
            );
        },

        getPillTpl: function(){
            var me = this;

            return Ext.create('Ext.XTemplate',
                '<div class="pill">',
                    '<tpl if="this.canDrag()"><div class="icon drag"></div></tpl>',
                    '{[this.getActionsGear()]}',
                    '<div class="textContent ellipses">{[this.getFormattedId()]} {[this.getType(values)]}{[this.getSeparator()]}{Name}</div>',
                    '<div class="rightSide">',
                        '{[this.getPercentDone(values)]}',
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
                    getType: function(values){
                        return values.PortfolioItemType? '(' + values.PortfolioItemType._refObjectName + ')': '';
                    },
                    getPercentDone: function(){
                        return Ext.isDefined(me.getRecord().get('PercentDoneByStoryCount'))? me.getRecord().render('PercentDoneByStoryCount'): '';
                    },
                    getSeparator: function(){
                        return this.getFormattedId()? ' - ': '';
                    }
                }
            );
        },

        /**
         * Object passed to the Ext.XTemplate used to render the tree item.
         * Defaults to the record's data.
         */
        getRenderData: function(){
            return this.getRecord().data;
        },

        /**
         * Wires up listeners for elements in the tree item.
         */
        setupListeners: function(){

            var pill = this.down('#pill');

            var expander = pill.getEl().down('a.expander');
            if(expander){
                expander.on('click', this.expandOrCollapse, this, {stopEvent: true});
            }

            pill.getEl().down('.row-action').on('click', this._showActionMenu, this, {stopEvent: true});

        },

        _showActionMenu : function(){

            var rowActions = Rally.ui.grid.RowActionsFactory.get([
                Rally.ui.grid.RowActionsFactory.EDIT,
                Rally.ui.grid.RowActionsFactory.COPY
            ], this.getRecord());

            rowActions.push({
                text: 'Delete',
                handler: Ext.bind(this._deleteRecord, this)
            });


            var menu = Ext.create('Rally.ui.Menu', {
                items: rowActions
            });

            menu.showBy(this.getEl().down('.row-action'));
        },

        _deleteRecord: function(){
            this.getRecord().destroy({
                callback: function(){
                    this.up('rallytree').removeTreeItem(this);
                },
                scope: this
            });
        },

        /**
         * Expand if collapsed, collapse if expanded.
         * Relies on the tree to handle the logic of loading children, so this just sets
         * the expanded property and fires the collapse/expand event, which the tree listens to.
         */
        expandOrCollapse: function(){
            this.fireEvent(this.getExpanded()? 'collapse': 'expand', this);
            this.setExpanded(!this.getExpanded());
            this.draw();
        },

        /**
         * Add a Rally.ui.tree.TreeItem as a child under this TreeItem.
         * @param treeItem item to add as a child
         */
        addChildItem: function(treeItem){

            var childrenContainer = this.down('#childItemContainer');

            if(!childrenContainer){
                childrenContainer = this.add({
                    xtype: 'container',
                    itemId: 'childItemContainer',
                    cls: 'childItemContainer'
                });
            }

            treeItem.on('remove', this.draw, this);

            childrenContainer.add(treeItem);

        },

        /**
         * Removes all TreeItem children from under this item.
         */
        removeChildItems: function(){
            if(this.down('#childItemContainer')){
                this.down('#childItemContainer').destroy();
            }
        },

        /**
         * Whether this tree item can be expanded (has children).
         * Depends on the #canExpandFn config option.
         * @return {Boolean}
         */
        canExpand: function(){
            return this.getCanExpandFn().call(this.getScope(), this.getRecord());
        }

    });

})();