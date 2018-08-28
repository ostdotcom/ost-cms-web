;
(function (window) {

  var oSTNs = ns("cms"),
      oThis;

  oSTNs.dashboard = oThis = {
    ostFormBuilder: null,
    listData: null,
    jSortable:  $('#sortable'),
    jSidebar: $('.app-sidebar'),
    selectedItem: "a.selected",

    init: function (config) {
      oThis.bindEvents();
      oThis.ostFormBuilder = new cms.OstFormBuilder({selectedItem: oThis.selectedItem});
      oThis.refresh();
      oThis.initPublishedListData(entity_id);
      oThis.getEntityConfig();
      oThis.selectSidebarMenu();
      oThis.hideSideBarMenuItem();
    },

    bindEvents: function () {

      var treeviewMenu = $('.app-menu');

      // Toggle Sidebar
      $("[data-toggle='sidebar']").click(function(event) {
        $('.app').toggleClass('sidenav-toggled');
      });

      // Activate sidebar treeview toggle
      $("[data-toggle='treeview']").click(function(event) {
        event.preventDefault();
        if(!$(this).parent().hasClass('is-expanded')) {
          treeviewMenu.find("[data-toggle='treeview']").parent().removeClass('is-expanded');
        }
        $(this).parent().toggleClass('is-expanded');
      });

      // Set initial active toggle
      $("[data-toggle='treeview.'].is-expanded").parent().toggleClass('is-expanded');

      //Activate bootstrip tooltips
      $("[data-toggle='tooltip']").tooltip();


      $('.dropdown').on('show.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
      });

      $('.dropdown').on('hide.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp(200);
      });

      $('.j-create-link').on('click', function () {
        oThis.ostFormBuilder.buildCreateForm(entity_id);
      });

      $('body').on('submit', '#entity_data_form' , function(e) {
          e.preventDefault();
          oThis.submitForm($(this));
      });

      $('body').on('click', '.j-edit-link', function(e) {
        oThis.ostFormBuilder.buildEditForm($(this).data('id'));
      });

      $('body').on('click', '.j-delete-link', function(e) {
        oThis.delete($(this).data('id'));
      });

      $('body').on('click', '.j-publish-changes-link', function(e) {
        oThis.publish(entity_id);
      });

      $('body').on('click', '.j-reset-publish-link', function(e) {
        oThis.resetPublish(entity_id);
      });

    },

    bindSortable: function() {
      $('#accordion').sortable({
        revert: true,
        stop: function(e, ui) {
          $('#list .card').each(function(k){
            $(this).find('.record-index').text(k+1);
          });
          recId = ui.item.data('recordId');
          prevElementId = ui.item.prev().data('recordId');
          nextElementId = ui.item.next().data('recordId');
          oThis.sortRecords(entity_id, recId, prevElementId, nextElementId);
        }
      });
    },

    onRefresh: function(response){
      oThis.listData = oThis.createMetaObject(response.data.list);
      var template = Handlebars.compile($('#list_view').text());
      var html = template({'list_data' : oThis.listData});
      $('#list').html(html);
      oThis.bindSortable();
    },


    selectSidebarMenu: function(){
      var entityId = window.location.pathname,
        entityId = entityId[entityId.length - 1],
        selectedItem = oThis.jSidebar.find("[data-entity-id='" + entityId + "']"),
        selectedParent = selectedItem.closest("li.treeview");
        selectedParent.addClass("is-expanded");
        selectedItem.addClass("selected");

    },

    sortRecords: function(entityId, recordId, previous, next){
      $.ajax({
        url: '/api/content/sort',
        method: 'POST',
        data: {
          entity_id: entityId,
          id : recordId,
          prev: previous,
          next: next
        },
        success: function(){
          oThis.refresh();
        }
      })
    },

    refresh: function(){
        $.ajax({
            url: '/api/content/active',
            method: 'GET',
            data: {
                entity_id: entity_id
            },
            success: function(response){
              oThis.onRefresh(response);
            }
        })
    },


    submitForm: function(){
       var  jForm = $('#entity_data_form');
        oThis.resetErrors();
        $.ajax({
            url: jForm.attr('action'),
            method: jForm.attr('method'),
            data: jForm.serialize(),
            success: function(){
                $('#genericModal').modal('hide');
                oThis.refresh();
            },
            error: function(error){
              if (error.responseJSON.err   ){
              var  errorResponse = error.responseJSON.err.error_data
              } else{
                return;
              }
              for (var key in errorResponse){
                if (errorResponse[key].length > 0){
                  var errorElement = $("[data-field-name='" + key + "']")
                  var errorText =  oThis.getErrorText(errorResponse[key]);
                  errorElement.text(errorText);
                }
              }
            }
        })
    },


    getErrorText: function (errorResponse) {
      var errorText = '';
      errorResponse.forEach(function(error){
        for (var key in error){
          errorText += error[key];
        }
      });
      return errorText;
    },


    createMetaObject: function(list){
      var configList = Object.assign({},list),
          heading, attrConfig,
          recordHeading = oThis.getRecordHeading();

      $.each( configList, function( key, list_item ) {
        var record = list_item.record,
            label,
            inputKind;
        $.each( record , function( key, value ) {
          if(recordHeading && key == recordHeading){
            heading = value;
          }
          meta_data['meta'][entity_id]['fields'].forEach(function(attr_object){
            if(attr_object[key]){
              attrConfig = attr_object[key];
              return;
            }
          });
          label = attrConfig['meta_ui']['input_label'];
          inputKind = attrConfig['meta_ui']['input_kind'];
          record[key] = {'display_label' : label, 'display_value' : value, 'input_kind' : inputKind};
        });
        list_item.heading = heading;
      });
      return configList;
    },

    delete: function(recordId) {
      $.ajax({
        url: '/api/content/delete',
        method: 'POST',
        data: {
          id: recordId
        },
        success: function () {
          oThis.refresh();
        }
      });
    },

    initPublishedListData: function(entityId){
      $.ajax({
        url: '/api/published',
        method: 'GET',
        data: {
          entity_id: entityId
        },
        success: function(response){
          var recordHeading = oThis.getRecordHeading();
          oThis.publishedListData = oThis.createMetaObject(response.data.list, recordHeading);
          var template = Handlebars.compile($('#published_list_view').text());
          var html = template({'published_list_data' : oThis.publishedListData});
          $('#published_list').html(html);
        }
      })
    },

    publish: function(entityId){
      $.ajax({
        url: '/api/content/publish',
        method: 'POST',
        data: {
          entity_id: entityId
        },
        success: function(){
         oThis.initPublishedListData(entityId);
        }
      })
    },

    resetPublish: function(entityId){
      $.ajax({
        url: '/api/content/rollback',
        method: 'POST',
        data: {
          entity_id: entityId
        },
        success: function(){
          oThis.initPublishedListData(entityId);
          oThis.refresh();
        }
      })
    },


    resetErrors: function () {
      $(".is-error").text("");
    },

    getEntityConfig: function() {
     return meta_data && meta_data['meta'][entity_id];
    },

    getRecordHeading: function() {
      var config = oThis.getEntityConfig();
      return config && config['record_heading'];
    },

    hideSideBarMenuItem: function() {
      var jEls = $('.treeview-menu');
      jEls.each( function(index, jEl) {
        if($(jEl).find('.treeview-item').length == 0){
          $(jEl).closest(".treeview").hide();
        }
      });
    }

  };

  $(document).ready(function () {
    oThis.init();
  });

})(window);