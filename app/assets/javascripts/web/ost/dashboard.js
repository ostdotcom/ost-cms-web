;
(function (window) {

  var oSTNs = ns("cms"),
      oThis;

  oSTNs.dashboard = oThis = {

    ostFormBuilder: null,
    listData: null,
    jNewsForm: $('#news_form'),
    jSortable:  $('#sortable'),

    init: function (config) {
      oThis.bindButtonActions();
      oThis.ostFormBuilder = new cms.OstFormBuilder();
      oThis.getAll();
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

      oThis.jSortable.sortable({
        revert: true
      });

      $( "#draggable" ).draggable({
        connectToSortable: "#sortable",
        helper: "clone",
        revert: "invalid"
      });
      $( "ul, li" ).disableSelection();

      $('.dropdown').on('show.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
      });

      $('.dropdown').on('hide.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp(200);
      });

      $('#createModal').on('show.bs.modal', function (e) {
        oThis.buildCreateForm();
      });

      $('body').on('submit', '#news_form' , function(e) {
          e.preventDefault();
          oThis.create();
      });

    },

    buildCreateForm: function(){
        console.log(meta_data.meta.news_list);
        oThis.ostFormBuilder.renderTemplate(
            '#news_list',
            {
                news_list: meta_data.meta.news_list,
                action: '/api/create',
                method: 'POST'
            },
            '#createModal .modal-content'
        );
    },

    getAll: function(){
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
                oThis.jSortable.html(html);
            }
        })
    },

    create: function(){
        $.ajax({
            url: oThis.jNewsForm.attr('action'),
            method: oThis.jNewsForm.attr('method'),
            data: oThis.jNewsForm.serialize(),
            success: function(response){
                $('#createModal').modal('hide');
                oThis.getAll();
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

    buildEditForm: function(){

    }

  };

  $(document).ready(function () {
    oThis.init();
  });

})(window);