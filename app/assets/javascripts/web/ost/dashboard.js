;
(function (window) {

  var oSTNs = ns("cms"),
      oThis;

  oSTNs.dashboard = oThis = {

    ostFormBuilder: null,
    listData: null,
    jSortable:  $('#sortable'),

    init: function (config) {
      oThis.bindEvents();
      oThis.ostFormBuilder = new cms.OstFormBuilder();
      oThis.refresh();
      oThis.initPublishedListData(1);
    },

    bindEvents: function () {

      var treeviewMenu = $('.app-menu');

      // Toggle Sidebar
      $("[data-toggle='sidebar']").click(function(event) {
        //event.preventDefault();
        console.log("you clicked sidebar")
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
        oThis.ostFormBuilder.buildCreateForm();
      });

      $('body').on('submit', '#news_form' , function(e) {
          e.preventDefault();
          oThis.submitForm();
      });

      $('body').on('click', '.j-edit-link', function(e) {
        oThis.ostFormBuilder.buildEditForm($(this).data('id'));
      });

      $('body').on('click', '.j-delete-link', function(e) {
        oThis.delete($(this).data('id'));
      });

      $('body').on('click', '.j-publish-changes-link', function(e) {
        var entityId = 1;
        oThis.publish(entityId);
      });

      $('body').on('click', '.j-reset-publish-link', function(e) {
        var entityId = 1;
        oThis.resetPublish(entityId);
      });

    },

    onRefresh: function(response){
      var recordHeading = 'news_list_title';
      var recId, prevElementId, nextElementId ;
      oThis.listData = oThis.createMetaObject(response.data.list, recordHeading);
      var template = Handlebars.compile($('#list_view').text());
      var html = template({'list_data' : oThis.listData});
      $('#list').html(html);
      $('#accordion').sortable({
        revert: true,
        stop: function(e, ui) {
          $('#list .card').each(function(k){
            $(this).find('.record-index').text(k+1);
          });
          console.log(ui.item);
          recId = ui.item.data('recordId');
          prevElementId = ui.item.prev().data('recordId');
          nextElementId = ui.item.next().data('recordId');
          console.log('recId:'+recId, 'prevElementId:'+prevElementId, 'nextElementId:'+nextElementId);
          oThis.sortRecords(1, recId, prevElementId, nextElementId);
        }
      });
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
                entity_id: 1
            },
            success: function(response){
              oThis.onRefresh(response);
            }
        })
    },

    submitForm: function(){
        jNewsForm = $('#news_form');
        $.ajax({
            url: jNewsForm.attr('action'),
            method: jNewsForm.attr('method'),
            data: jNewsForm.serialize(),
            success: function(response){
                $('#genericModal').modal('hide');
                oThis.refresh();
            }
        })
    },

    createMetaObject: function(list, recordHeading){
      var configList = Object.assign({},list);
      var heading;
      $.each( configList, function( key, list_item ) {
        var record = list_item.record;
        $.each( record , function( key, value ) {
          if(recordHeading && key == recordHeading){
            heading = value;
          }
          var label = meta_data['meta']['news_list'][key]['meta_ui']['input_label'];
          record[key] = {'display_label' : label, 'display_value' : value};
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
        success: function (response) {
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
          var recordHeading = 'news_list_title';
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
        success: function(response){
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
        success: function(response){
          oThis.initPublishedListData(entityId);
          oThis.refresh();
        }
      })
    }

  };

  $(document).ready(function () {
    oThis.init();
  });

})(window);