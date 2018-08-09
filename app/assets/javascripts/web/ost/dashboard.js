;
(function (window) {

  var oSTNs = ns("cms"),
      oThis;

  oSTNs.dashboard = oThis = {

    ostFormBuilder: null,
    listData: null,
    jSortable:  $('#sortable'),

    init: function (config) {
      oThis.bindButtonActions();
      oThis.ostFormBuilder = new cms.OstFormBuilder();
      oThis.refresh();
    },

    bindButtonActions: function () {

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

      $('.j-create-button').on('click', function () {
        oThis.buildCreateForm();
      });

      $('body').on('submit', '#news_form' , function(e) {
          e.preventDefault();
          oThis.submitForm();
      });

      $('body').on('click', '.j-edit-button', function(e) {
        oThis.buildEditForm($(this).data('id'));
      });

      $('body').on('click', '.j-delete-button', function(e) {
        oThis.delete($(this).data('id'));
      });

    },

    bindSortableAction : function() {
      $('#accordion').sortable({
        revert: true
      });
    },

    buildCreateForm: function(){
      oThis.ostFormBuilder.renderTemplate(
          '#news_list',
          {
            news_list: meta_data.meta.news_list,
            action: '/api/create',
            method: 'POST',
            header: 'Create News Entity'
        },
          '#genericModal .modal-content'
      );
    },

    refresh: function(){
        $.ajax({
            url: '/api/active',
            method: 'GET',
            data: {
                entity_id: 1
            },
            success: function(response){
                oThis.listData = oThis.createMetaObject(response.data.list);
                var template = Handlebars.compile($('#list_view').text());
                var html = template({'list_data' : oThis.listData});
                $('#list').html(html);
                oThis.bindSortableAction();
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

    createMetaObject: function(list){
      var configList = Object.assign({},list);
      $.each( configList, function( key, list_item ) {
        var record = list_item.record;
        $.each( record , function( key, value ) {
          record[key] = {'display_label' : meta_data['meta']['news_list'][key]['meta_ui']['input_label'], 'display_value' : value};
        });
      });
      return configList;
    },

    buildEditForm: function(recordId) {
      $.ajax({
        url: '/api/record?id='+recordId,
        method: 'GET',
        success: function (response) {
          oThis.ostFormBuilder.renderTemplate(
            '#news_list',
            {
              news_list: meta_data.meta.news_list,
              action: '/api/edit',
              method: 'POST',
              header: 'Edit News Entity',
              data: response.data.record,
              id: recordId
            },
            '#genericModal .modal-content'
          );
        }
      });
    },

    delete: function(recordId) {
      $.ajax({
        url: '/api/delete',
        method: 'POST',
        data: {
          id: recordId
        },
        success: function (response) {
          oThis.refresh();
        }
      });
    }


  };

  $(document).ready(function () {
    oThis.init();
  });

})(window);