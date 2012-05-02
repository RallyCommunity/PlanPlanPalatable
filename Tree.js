(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Displays items in a hierarchy.
     *
     * To create a tree of User Stories and their children, simply create a new tree:
     *      @example
     *      Ext.create('Ext.Container', {
     *         items: [{
     *             xtype: 'rallytree'
     *         }],
     *         renderTo: Ext.getBody().dom
     *      });
     *
     *
     * To create a tree of User Stories and their defects, implement a few more config options:
     *      @example
     *      Ext.create('Ext.Container', {
     *         items: [{
     *             xtype: 'rallytree',
     *             childModelTypeForRecordFn: function(){
     *                 return 'Defect';
     *             },
     *             parentAttributeForChildRecordFn: function(){
     *                 return 'Requirement';
     *             },
     *             canExpandFn: function(record){
     *                 return record.get('Defects') && record.get('Defects').length;
     *             }
     *         }],
     *         renderTo: Ext.getBody().dom
     *      });
     *
     * To create a tree of user stories that expands into child user stories if it's an epic story and then shows tasks:
     *      @example
     *      Ext.create('Ext.Container', {
     *          items: [{
     *              xtype: 'rallytree',
     *              childModelTypeForRecordFn: function(record){
     *                  if(record.get('Children') && record.get('Children').length > 0){
     *                      return 'User Story';
     *                  } else {
     *                      return 'Task';
     *                  }
     *              },
     *              parentAttributeForChildRecordFn: function(record){
     *                  if(record.get('Children') && record.get('Children').length > 0){
     *                      return 'Parent';
     *                  } else {
     *                      return 'WorkProduct';
     *                  }
     *              },
     *              canExpandFn: function(record){
     *                  return (record.get('Children') && record.get('Children').length > 0) || (record.get('Tasks') && record.get('Tasks').length > 0);
     *              }
     *          }],
     *          renderTo: Ext.getBody().dom
     *      });
     *
     *
     * To create a project tree:
     *      @example
     *      Ext.create('Ext.Container', {
     *          items: [{
     *              xtype: 'rallytree',
     *              topLevelModel: 'Project',
     *              childModelTypeForRecordFn: function(){
     *                  return 'Project';
     *              }
     *          }],
     *          renderTo: Ext.getBody().dom
     *      });
     *
     * ## Drag and Drop
     *
     * To support drag and drop reparenting, a few config options need to be set:
     * #enableDragAndDrop
     * #dragThisGroupOnMeFn
     *
     * The #dragDropGroupFn can also be implemented, but the default is usually enough (defaults to giving the type name, like 'defect', to each row).
     *
     * By default, the functions are defined to work for a user story hierarchy, so we can just enable drag and drop and it should work:
     *      @example
     *      Ext.create('Ext.Container', {
     *          items: [{
     *              xtype: 'rallytree',
     *              enableDragAndDrop: true
     *          }],
     *          renderTo: Ext.getBody().dom
     *      });
     *
     * To support DnD with other types, you need to implement the DnD functions.
     * This example allows DnD of Defects under User Stories.
     *      @example
     *      Ext.create('Ext.Container', {
     *          items: [{
     *              xtype: 'rallytree',
     *              childModelTypeForRecordFn: function(){
     *                  return 'Defect';
     *              },
     *              parentAttributeForChildRecordFn: function(){
     *                  return 'Requirement';
     *              },
     *              canExpandFn: function(record){
     *                  return record.get('Defects') && record.get('Defects').length;
     *              },
     *              enableDragAndDrop: true,
     *              dragThisGroupOnMeFn: function(record){
     *                  if(record.get('_type') === 'hierarchicalrequirement'){
     *                      return 'defect';
     *                  }
     *              }
     *          }],
     *          renderTo: Ext.getBody().dom
     *      });
     *
     *
     *
     * This example shows Test Cases under Test Folders, and lets you DnD to reorganize.
     *      @example
     *      Ext.create('Ext.Container', {
     *          items: [{
     *              xtype: 'rallytree',
     *              topLevelModel: 'TestFolder',
     *              childModelTypeForRecordFn: function(record){
     *                  if(record.get('Children') && record.get('Children').length > 0){
     *                      return 'TestFolder';
     *                  } else {
     *                      return 'TestCase';
     *                  }
     *              },
     *              parentAttributeForChildRecordFn: function(record){
     *                  if(record.get('Children') && record.get('Children').length > 0){
     *                      return 'Parent';
     *                  } else {
     *                      return 'TestFolder';
     *                  }
     *              },
     *              canExpandFn: function(record){
     *                  return record.get('Children') && record.get('Children').length > 0
     *                  || record.get('TestCases') && record.get('TestCases').length > 0;
     *              },
     *              enableDragAndDrop: true,
     *              dragThisGroupOnMeFn: function(record){
     *                  if(record.get('_type') === 'testfolder'){
     *                      if(record.get('Children') && record.get('Children').length > 0){
     *                          return 'testfolder';
     *                      }
     *                      if(record.get('TestCases') && record.get('TestCases').length > 0){
     *                          return 'testcase';
     *                      }
     *                      return ['testfolder', 'testcase'];
     *                  }
     *              },
     *              topLevelStoreConfig: {
     *                  sorters: []
     *              },
     *              childItemsStoreConfig: {
     *                  sorters: []
     *              }
     *          }],
     *          renderTo: Ext.getBody().dom
     *      });
     *
     * The first set of options configure the Tree to show Test Folders and Test Cases.
     * To enable DnD, #enableDragAndDrop was set to true, and #dragThisGroupOnMeFn was implemented to
     * return 'testfolder' or 'testcase', depending on conditions where test folders and/or test cases can be dropped on
     * the test folder.
     * The store config options were also configured to not sort, since Test Folders and Test Cases are not rankable.
     *
     */
    Ext.define('Rally.ui.tree.Tree', {
        extend: 'Ext.Container',
        requires: ['Ext.XTemplate', 'Rally.ui.tree.TreeItem', 'Rally.ui.tree.TreeItemDropTarget'],

        alias: 'widget.rallytree',

        mixins: {
            recordable: 'Rally.clientmetrics.ClientMetricsRecordable',
            messageable: 'Rally.Messageable'
        },

        cls: 'rallytree',

        config: {
            /**
             * @cfg {String}
             * The type of model to load as the top level.
             * For example, you could have a tree of user stories and their tasks. The top level model type
             * would be 'userstory'.
             */
            topLevelModel: 'User Story',

            /**
             * @cfg {String}
             * The attribute used to determine if a record is at the top level.
             * For example, to show user stories that do not have parent, use 'Parent'.
             */
            topLevelParentAttribute: 'Parent',

            /**
             * @cfg {Function}
             * Given a record, return the model type (String) of the child records.
             * For example, if given a user story record, you could return 'userstory' to create a US hierarchy, or
             * 'defect', if you want a tree of User Stories and their defects. Or even return 'userstory' for a user story
             * that has sub user stories, but 'defect' if it only has defects.
             */
            childModelTypeForRecordFn: function(record){
                return 'User Story';
            },

            /**
             * @cfg {Function}
             * Given a record, return the name of the attribute that connects this record's children to itself.
             * For example, if you're building a hierarchy of user stories, this would be 'Parent'. If you're building a
             * tree of user stories and their defects, then it would be 'Requirement', since the Requirement attribute on a defect
             * describes which user story it belongs to.
             */
            parentAttributeForChildRecordFn: function(record){
                return 'Parent';
            },

            /**
             * @cfg {Function}
             * A function that returns true if the given record can be expanded
             */
            canExpandFn: function(record){
                return record.get('Children') && record.get('Children').length > 0;
            },

            /**
             * @cfg {Boolean}
             * Whether or not this tree supports drag and drop reparenting.
             * If true, must also provide a #dragThisGroupOnMe config function.
             */
            enableDragAndDrop: false,

            /**
             * @cfg {Function}
             * Required to support drag and drop.
             * A function that returns the group name that this record is a member of.
             *
             * By default, returns the type name of the record, like 'hierarchicalrequirement' for userstories, and 'defect' for defects.
             * You will want to change this if type is not specific. For example, you may wish to distinguish accepted user stories from in progress stories.
             * Use in conjunction with the #dragThisGroupOnMeFn config to define DnD rules.
             */
            dragDropGroupFn: function(record){
                return record.get('_type');
            },

            /**
             * @cfg {Function}
             * Required to support drag and drop.
             * A function that returns the group name of records that are able to be dropped on the passed in record.
             *
             * For example, a tree of user stories would simply return 'hierarchicalrequirement', since
             * user stories can always be parented to other user stories. A tree of user stories and defects would need to have 'hierarchicalrequirement'
             * for the TreeItems representing user stories, but return undefined for defects so they can't be dropped on.
             * @param record the record you need to determine the group for.
             * @return a string representing the drag drop group that can be dragged onto the Rally.ui.tree.TreeItem represented by the passed in record.
             */
            dragThisGroupOnMeFn: function(record){
                return record.get('_type');
            },

            /**
             * @cfg {Object}
             * Scope that any passed in function (canExpandFn, etc) is called with.
             */
            scope: undefined,

            /**
             * @cfg {Object}
             * Config for the store used to fetch the top level items in the hierarchy
             */
            topLevelStoreConfig: {},

            /**
             * @cfg {Object}
             * Config for the store used to fetch the lower level items in the hierarchy
             */
            childItemsStoreConfig: {},
            
            
            /**
             * @cfg {Function}
             * Given a record, returns the configuration for a tree item to draw for the record.
             * Can be used to change how a tree item is rendered at any level.
             */
            treeItemConfigForRecordFn: function(){
                return {
                    xtype: 'rallytreeitem'
                };
            }
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
                     * Fired before a record is saved after a drag and drop event.
                     * @param record the record about to be updated
                     * @param newParentRecord the record about to be set as the new 'owner' of the record, based on the
                     * attribute returned by #parentAttributeForChildRecordFn
                     */
                    'beforerecordsaved'
            );

            var storeConfig = Ext.applyIf(Ext.clone(this.getTopLevelStoreConfig()), {
                model: this.getTopLevelModel(),
                filters: [
                    {
                        property: this.getTopLevelParentAttribute(),
                        value: 'null',
                        operator: '='
                    }
                ],
                sorters: [
                    {
                        property: 'Rank',
                        direction: 'ASC'
                    }
                ]
            });

            var store = Ext.create('Rally.data.WsapiDataStore', storeConfig);

            store.on('load', function(store, records){
                if(records.length > 0){
                    this.drawItems(records);
                } else {
                    this.drawEmptyMsg();
                }

                this.publish(Rally.Message.treeLoaded);

            }, this);

            store.load();

        },

        drawEmptyMsg: function(){
            var emptyTextMessage = '<p>No top level items found.</p>';
            this.add({
                xtype: 'component',
                html: Rally.ui.grid.EmptyTextFactory.getEmptyTextFor(emptyTextMessage)
            });
        },

        /**
         * Adds an item in the tree for each record
         * @param records the records to create Rally.ui.tree.TreeItems for
         * @param parentTreeItem (Optional) add the items as a child to a different Rally.ui.tree.TreeItem
         */
        drawItems: function(records, parentTreeItem){
            var tree = this;

            Ext.each(records, function(record){
                
                var treeItemConfig = tree.getTreeItemConfigForRecordFn().call(tree.getScope(), record);
                treeItemConfig = Ext.applyIf(treeItemConfig, {
                    record: record,
                    canExpandFn: this.getCanExpandFn(),
                    scope: this.getScope(),
                    canDragAndDrop: this.getEnableDragAndDrop(),
                    listeners: {
                        expand: this.expandItem,
                        collapse: this.collapseItem,
                        scope: this
                    }
                });
                
                var treeItem = Ext.ComponentManager.create(treeItemConfig);
                
                if(this.getEnableDragAndDrop()){
                    treeItem.on('draw', function(){
                        this.makeTreeItemDraggable(treeItem);
                    }, this);
                }

                if(parentTreeItem){
                    treeItem.setParentTreeItem(parentTreeItem);
                    Ext.defer(function(){
                        parentTreeItem.addChildItem(treeItem);
                    }, 1);
                } else {
                    Ext.defer(function(){
                        tree.add(treeItem);
                    }, 1);

                }

            }, this);

        },

        /**
         * Given a Rally.ui.tree.TreeItem, load its child items.
         * Assumes this TreeItem has children.
         * @param parentTreeItem tree item to load children for.
         */
        drawChildItems: function(parentTreeItem){

            var childModelType = this.getChildModelTypeForRecordFn().call(this.getScope(), parentTreeItem.getRecord());
            var parentAttribute = this.getParentAttributeForChildRecordFn().call(this.getScope(), parentTreeItem.getRecord());

            var storeConfig = Ext.applyIf(Ext.clone(this.getChildItemsStoreConfig()), {
                model: childModelType,
                filters: [
                    {
                        property: parentAttribute,
                        value: parentTreeItem.getRecord().get('_ref'),
                        operator: '='
                    }
                ],
                sorters: [
                    {
                        property: 'Rank',
                        direction: 'ASC'
                    }
                ],
                context: {
                    project: undefined
                }
            });

            var childStore = Ext.create('Rally.data.WsapiDataStore', storeConfig);

            childStore.on('load', function(store, records){
                this.drawItems(records, parentTreeItem);
            }, this);

            childStore.load();

        },

        makeTreeItemDraggable: function(treeItem){
            var tree = this;

            var dragSource = Ext.create('Ext.dd.DragSource', treeItem.getEl(), {
                treeItem: treeItem,
                ddGroup: this.getDragDropGroupFn().call(this.getScope(), treeItem.getRecord()),
                isTarget: false,
                proxy: Ext.create('Ext.dd.StatusProxy', {
                    animRepair: true,
                    shadow: false,
                    dropNotAllowed: 'rallytree-proxy'
                })
            });

            dragSource.setHandleElId(treeItem.getEl().down('.drag').id);

            var dropTarget = Ext.create('Rally.ui.tree.TreeItemDropTarget', treeItem.down('#pill').getEl().down('div'), {
                tree: tree,
                treeItem: treeItem
            });

            var dropTargetGroups = this.getDragThisGroupOnMeFn().call(this.getScope(), treeItem.getRecord());
            if(!Ext.isArray(dropTargetGroups)){
                dropTargetGroups = [dropTargetGroups];
            }
            Ext.each(dropTargetGroups, function(dropTargetGroup){
                dropTarget.addToGroup(dropTargetGroup);
            });

        },

        removeTreeItem: function(treeItem){
            treeItem.destroy();
            if(this.query('rallytreeitem').length === 0){
                this.drawEmptyMsg();
            }
        },

        expandItem: function(treeItem){
            treeItem.removeChildItems();
            this.drawChildItems(treeItem);
        },

        collapseItem: function(treeItem){
            treeItem.removeChildItems();
        }


    });

})();