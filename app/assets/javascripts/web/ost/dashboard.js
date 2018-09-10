;
(function (window) {

  var oSTNs = ns("cms"),
    oThis;

  oSTNs.dashboard = oThis = {
    ostFormBuilder: null,
    listData: null,
    jSortable: $('#sortable'),
    jSidebar: $('.app-sidebar'),
    selectedItem: ".treeview-item.selected",
    entityName: null,
    jDeleteModal: $("#deleteModal"),
    jPublishModal: $("#publishModal"),
    jResetModal: $("#resetModal"),

    init: function (config) {
      oThis.entityName = config.entity_name;
      oThis.entitiesConfig = JSON.parse(config.meta_data);
      oThis.ostFormBuilder = new cms.OstFormBuilder( { 'entitiesConfig' :config , 'selectedItem' : oThis.selectedItem } );
      oThis.bindEvents();
      oThis.refresh();
      oThis.initPublishedListData( true );
      oThis.getEntityConfig();
      oThis.selectSidebarMenu();
      oThis.hideSideBarMenuItem();
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
        oThis.ostFormBuilder.buildCreateForm( oThis.entityName, oThis.entitiesConfig );
      });

      $('body').on('submit', '#entity_data_form', function (e) {
        e.preventDefault();
        oThis.submitForm($(this));
      });

      $('body').on('click', '.j-edit-link', function (e) {
        oThis.ostFormBuilder.buildEditForm($(this).data('id'), oThis.entityName, oThis.entitiesConfig);
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
      $('#accordion').sortable({
        revert: true,
        update: function (e, ui) {
          $('#list .card').each(function (k) {
            $(this).find('.record-index').text(k + 1);
          });
          recId = ui.item.data('recordId');
          prevElementId = ui.item.prev().data('recordId');
          nextElementId = ui.item.next().data('recordId');
          oThis.sortRecords( recId, prevElementId, nextElementId);
        }
      });
    },

    onRefresh: function (response) {
      oThis.listData = oThis.createMetaObject(response.data.list);
      var template = Handlebars.compile($('#list_view').text());
      var html = template({'list_data': oThis.listData});
      $('#list').html(html);
      oThis.bindSortable();
    },


    selectSidebarMenu: function () {
      var entityName = window.location.pathname,
        entityName = entityName.split("/").pop(),
        selectedItem = oThis.jSidebar.find("[data-entity-id='" + entityName + "']"),
        selectedParent = selectedItem.closest("li.treeview");
      selectedParent.addClass("is-expanded");
      selectedItem.addClass("selected");
    },

    sortRecords: function (recordId, previous, next) {
      $.ajax({
        url: '/api/content/sort',
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
        url: '/api/content/active',
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
      var configList = Object.assign({}, list),
        heading, attrConfig,
        recordHeading = oThis.getRecordHeading();

      $.each(configList, function (key, list_item) {
        var record = list_item.record,
          label,
          inputKind;
        $.each(record, function (key, value) {
          if (recordHeading && key == recordHeading) {
            heading = value;
          }
          oThis.entitiesConfig['meta'][oThis.entityName]['fields'].forEach(function (attr_object) {
            if (attr_object[key]) {
              attrConfig = attr_object[key];
              return;
            }
          });
          label = attrConfig['meta_ui']['input_label'];
          inputKind = attrConfig['meta_ui']['input_kind'];
          console.log("record", record);
          record[key] = new CMSRecordAttribute({'display_label': label, 'display_value': value, 'input_kind': inputKind});
        });
        list_item.heading = heading;
      });
      return configList;
    },

    delete: function (recordId) {
      $.ajax({
        url: '/api/content/delete',
        method: 'POST',
        data: {
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
        url: '/api/content/published',
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
            oThis.publishedListData = oThis.createMetaObject(response.data.list);
            var template = Handlebars.compile($('#published_list_view').text());
            var html = template({'published_list_data': oThis.publishedListData});
            $('#published_list').html(html);
            if( showProcessingModal ){
              $('.modal').modal('hide');
            }
          } else {
            oSTNs.requestHelper.showErrorModal( response );
          }
        },
        error: function ( error ) {
          oSTNs.requestHelper.showErrorModal( error );
        }
      })
    },

    publish: function () {
      $.ajax({
        url: '/api/content/publish',
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
        url: '/api/content/reset_to_publish',
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
      return oThis.entitiesConfig && oThis.entitiesConfig['meta'] && oThis.entitiesConfig['meta'][oThis.entityName];
    },

    getRecordHeading: function () {
      var config = oThis.getEntityConfig();
      return config && config['record_heading'];
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