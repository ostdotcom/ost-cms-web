;
(function (window) {

  var oSTNs           = ns("cms"),
      oThis;

  oSTNs.entity = oThis = {

    entityName           : null,
    entityType           : null,

    ostFormBuilder        : null,

    sortApi               : '/api/content/sort' ,
    refreshApi            : '/api/content/active',
    deleteApi             : '/api/content/delete',
    publishApi            : '/api/content/publish',
    publishedApi          : '/api/content/published',
    resetApi              : '/api/content/reset-to-publish',

    sDraftTemplate        : '#draft_entity_list',
    sDraftWrapper         : '#list',

    sPublishedTemplate    : '#published_list_view',
    sPublishedWrapper     : '#published_list' ,

    selectedItem          : ".treeview-item.selected",
    sSortableElements     : '.jSortable-elements',

    jSidebar              : $('.app-sidebar'),
    jDeleteModal          : $("#deleteModal"),
    jPublishModal         : $("#publishModal"),
    jResetModal           : $("#resetModal"),

    init: function (config) {
      oThis.initializeData( config );
      oThis.buildForm( );
      oThis.bindEvents();
      oThis.refresh();
      oThis.initPublishedListData( true );
      oThis.getEntityConfig();
      oThis.selectSidebarMenu();
      oThis.hideSideBarMenuItem();
    },

    initializeData: function ( config ) {
      if( config ){
        $.extend( oThis , config ) ;
      }
      oThis.entityName = oThis.entityConfig.meta.entity_name;
    },

    buildForm: function ( ) {
      oThis.ostFormBuilder = new cms.OstFormBuilder( { 'entityConfig' : oThis.entityConfig , 'selectedItem' : oThis.selectedItem } );
    },

    bindEvents: function () {

      var treeviewMenu = $('.app-menu');

      // Toggle Sidebar
      $("[data-toggle='sidebar']").click(function (event) {
        $('.app').toggleClass('sidenav-toggled');
      });

      // Activate sidebar treeview toggle
      $("[data-toggle='treeview']").click(function (event) {
        event.preventDefault();
        if (!$(this).parent().hasClass('is-expanded')) {
          treeviewMenu.find("[data-toggle='treeview']").parent().removeClass('is-expanded');
        }
        $(this).parent().toggleClass('is-expanded');
      });

      // Set initial active toggle
      $("[data-toggle='treeview.'].is-expanded").parent().toggleClass('is-expanded');

      //Activate bootstrip tooltips
      $("[data-toggle='tooltip']").tooltip();


      $('.dropdown').on('show.bs.dropdown', function (e) {
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
      });

      $('.dropdown').on('hide.bs.dropdown', function (e) {
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp(200);
      });

      $('.j-create-link').on('click', function () {
        oThis.ostFormBuilder.buildCreateForm( oThis.entityName, oThis.entityConfig );
      });

      $('body').on('submit', '#entity_data_form', function (e) {
        e.preventDefault();
        oThis.submitForm($(this));
      });

      $('body').on('click', '.j-edit-link', function (e) {
        oThis.ostFormBuilder.buildEditForm($(this).data('id'), oThis.entityName, oThis.entityConfig);
      });

      $('body').on('click', '.j-delete-link', function (e) {
        oThis.showDeleteModal( $(this).data('id') );
      });

      $('body').on('click', '.delete-btn', function () {
        var id = oThis.jDeleteModal.data('recordId');
        oThis.delete(id);
      });

      $('body').on('click', '.j-publish-changes-link', function (e) {
        oThis.showPublishModal();
      });

      $('body').on('click', '.publish-btn', function () {
        oThis.publish();
      });

      $('body').on('click', '.j-reset-publish-link', function (e) {
        oThis.showResetModal();
      });

      $('body').on('click', '.reset-btn', function () {
        oThis.resetPublish();
      });

    },

    showDeleteModal : function( id ){
      oThis.jDeleteModal.data('recordId', id);
      oThis.jDeleteModal.modal('show');
    },

    showResetModal : function(){
      oThis.jResetModal.modal('show');
    },

    showPublishModal : function(){
      oThis.jPublishModal.modal('show');
    },

    bindSortable: function () {
      var recId , prevElementId , nextElementId ;
      $( oThis.sSortableElements ).sortable({
        revert: true,
        update: function (e, ui) {
          $('#list .card').each(function (k) {
            $(this).find('.record-index').text(k + 1);
          });
          recId = ui.item.data('recordId');
          prevElementId = ui.item.prev().data('recordId');
          nextElementId = ui.item.next().data('recordId');
          oThis.sortRecords( recId, prevElementId, nextElementId );
        }
      });
    },

    onRefresh: function (response) {
      var listData  =  oThis.createMetaObject(response.data.list) ,
          sTemplate = oThis.getDraftTemplate(),
          markup    =  oSTNs.handlebarHelper.getMarkup(  sTemplate  ,  {'list_data':listData} )
      ;
      $(oThis.sDraftWrapper).html( markup );
      oThis.bindSortable();
    },

    getDraftTemplate : function () {
      var sTemplate   = '#draft_'+ oThis.entityName ,
          jTemplate   = $( sTemplate )
      ;
      if( jTemplate && jTemplate .length == 1 ){
        return sTemplate ;
      }
      return oThis.sDraftTemplate;
    },

    selectSidebarMenu: function () {
      var selectedItem    = oThis.jSidebar.find("[data-entity-id='" + oThis.entityName + "']"),
          selectedParent  = selectedItem.closest("li.treeview")
      ;
      selectedParent.addClass("is-expanded");
      selectedItem.addClass("selected");
    },

    sortRecords: function (recordId, previous, next) {
      $.ajax({
        url: oThis.sortApi,
        method: 'POST',
        data: {
          entity_name: oThis.entityName,
          id: recordId,
          prev: previous,
          next: next
        },
        beforeSend: function(){
          oSTNs.requestHelper.showLoadingModal( "Sorting in progress... " );
        },
        success: function ( res ) {
          if(res.success) {
            oThis.refresh();
            $('.modal').modal('hide');
          } else {
            oSTNs.requestHelper.showErrorModal( res );
          }
        },
        error: function ( error ) {
          oSTNs.requestHelper.showErrorModal( error );
        }
      })
    },

    refresh: function () {
      $.ajax({
        url: oThis.refreshApi,
        method: 'GET',
        data: {
          entity_name: oThis.entityName
        },
        success: function (response) {
          if(response.success) {
            oThis.onRefresh(response);
          } else {
            oSTNs.requestHelper.showErrorModal( response );
          }
        }
      })
    },

    submitForm: function () {
      var jForm = $('#entity_data_form');
      oThis.resetErrors();
      $.ajax({
        url: jForm.attr('action'),
        method: jForm.attr('method'),
        data: jForm.serialize(),
        beforeSend: function(){
          jForm.find('.btn-primary').text('Saving...');
        },
        success: function ( res ) {
          if( res.success ){
            oSTNs.requestHelper.showSuccessModal("Record saved successfully!");
            oThis.refresh();
          } else {
            oSTNs.requestHelper.showError( jForm , res);
          }
        },
        error: function (error) {
          oSTNs.requestHelper.showError( jForm , error);
        },
        complete: function () {
          jForm.find('.btn-primary').text('Save');
        }
      })
    },


    createMetaObject: function (list) {
      var configList = list.slice( 0 ),
          heading, attrConfig
      ;

      $.each(configList, function (key, list_item) {
        var record = list_item.record,
          label,
          inputKind;
        list_item.heading = oThis.getRecordHeading( record );
        $.each(record, function (key, value) {
          oThis.entityConfig['fields'].forEach(function (attr_object) {
            if (attr_object[key]) {
              attrConfig = attr_object[key];
              return;
            }
          });
          label = attrConfig['input_label'];
          inputKind = attrConfig['input_kind'];
          record[key] = new CMSRecordAttribute({'display_label': label, 'display_value': value, 'input_kind': inputKind});
        });
      });
      return configList;
    },

    delete: function (recordId) {
      $.ajax({
        url: oThis.deleteApi,
        method: 'POST',
        data: {
          entity_name: oThis.entityName,
          id: recordId
        },
        beforeSend: function(){
          oSTNs.requestHelper.showLoadingModal("Deleting ...");
        },
        success: function ( res ) {
          if( res.success ){
            oSTNs.requestHelper.showSuccessModal(  "Record deleted successfully!");
            oThis.refresh();
          } else {
            oSTNs.requestHelper.showErrorModal( res );
          }
        },
        error: function (error) {
          oSTNs.requestHelper.showErrorModal( error );
        }
      });
    },

    initPublishedListData: function ( showProcessingModal ) {
      $.ajax({
        url: oThis.publishedApi,
        method: 'GET',
        data: {
          entity_name: oThis.entityName
        },
        beforeSend: function(){
          if( showProcessingModal ){
            oSTNs.requestHelper.showLoadingModal("Getting data, please wait...");
          }
        },
        success: function (response) {
          if( response.success ) {
            if( showProcessingModal ){
              $('.modal').modal('hide');
            }
            oThis.onGetPublishDataSuccess( response );
          } else {
            oSTNs.requestHelper.showErrorModal( response );
          }
        },
        error: function ( error ) {
          oSTNs.requestHelper.showErrorModal( error );
        }
      })
    },

    onGetPublishDataSuccess : function ( response  ) {
      var publishedListData =  oThis.createMetaObject(response.data.list) ,
          markup            =  oSTNs.handlebarHelper.getMarkup( oThis.getPublishTemplate() ,  {'published_list_data': publishedListData})
      ;
      $(oThis.sPublishedWrapper).html(markup);
    },

    getPublishTemplate : function () {
      var sEntityPublishTemplate = "#published_" + oThis.entityName ,
          jEntityPublishTemplate = $( sEntityPublishTemplate )
      ;
      if( jEntityPublishTemplate && jEntityPublishTemplate.length == 1 ) {
        return sEntityPublishTemplate ;
      } else {
        return oThis.sPublishedTemplate ;
      }
    },

    publish: function () {
      $.ajax({
        url: oThis.publishApi,
        method: 'POST',
        data: {
          entity_name: oThis.entityName
        },
        beforeSend: function(){
          oSTNs.requestHelper.showLoadingModal("Publishing ...");
        },
        success: function ( res ) {
          if( res.success ) {
            oSTNs.requestHelper.showSuccessModal( "Data published successfully !!");
            oThis.initPublishedListData();
          } else {
            oSTNs.requestHelper.showErrorModal( res );
          }
        },
        error: function (  error ) {
          oSTNs.requestHelper.showErrorModal( error );
        }
      })
    },

    resetPublish: function () {
      $.ajax({
        url: oThis.resetApi,
        method: 'POST',
        data: {
          entity_name: oThis.entityName
        },
        beforeSend: function(){
          oSTNs.requestHelper.showLoadingModal("Going to the last publish version ...");
        },
        success: function ( res ) {
          if( res.success ) {
            oThis.initPublishedListData();
            oSTNs.requestHelper.showSuccessModal( "Reset successful!");
            oThis.refresh();
          } else {
            oSTNs.requestHelper.showErrorModal( res );
          }
        },
        error: function( error ){
          oSTNs.requestHelper.showErrorModal( error );
        }
      })
    },
    resetErrors: function () {
      $(".error").text("");
    },

    getEntityConfig: function () {
      return oThis.entityConfig;
    },

    getRecordTitleKey: function() {
      var config = oThis.getEntityConfig(),
        metaUI = config && config.meta_ui
      ;
      return metaUI && metaUI['title_key'] ;
    },

    getRecordTitle: function() {
      var config = oThis.getEntityConfig(),
        metaUI = config && config.meta_ui
      ;
      return metaUI && metaUI['title'] ;
    },

    getRecordHeading: function( record ) {
      var recordHeading;
      if( oThis.getRecordTitleKey() ) {
        recordHeading = record[oThis.getRecordTitleKey()];
      } else{
        recordHeading = oThis.getRecordTitle();
      }
      recordHeading = $('<span>'+recordHeading+'</span>').text(); // Strip html to text
      return recordHeading;
    },

    hideSideBarMenuItem: function () {
      var jEls = $('.treeview-menu');
      jEls.each(function (index, jEl) {
        if ($(jEl).find('.treeview-item').length == 0) {
          $(jEl).closest(".treeview").hide();
        }
      });
    }

  };

  var CMSRecordAttribute =  oSTNs.CMSRecordAttribute = function ( recordAttribute ) {
    var oThis = this;
    Object.assign(oThis, recordAttribute);
  };

  CMSRecordAttribute.prototype = {
    isImage: function () {
      var oThis = this;
      //TBD: This needs to change.
      return 'ost-input-file' ===  oThis.input_kind;
    },

    isColor: function () {
      var oThis = this;
      return "generic-color-picker" === oThis.input_kind;
    },

    isTimeStamp: function () {
      var oThis = this;
      return "generic-date-picker" === oThis.input_kind;
    },

    isGenericLink: function () {
      var oThis = this;
      return "generic-link" === oThis.input_kind;
    }


  };


})(window);