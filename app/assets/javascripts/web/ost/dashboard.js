;
(function (window) {

  var oSTNs = ns("cms"),
      oThis;

  oSTNs.dashboard = oThis = {

    ostFormBuilder: null,
    listData: null,

    init: function (config) {
      oThis.bindButtonActions();
      oThis.ostFormBuilder = new cms.OstFormBuilder();
      oThis.populateList();
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

      $( "#sortable" ).sortable({
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
        oThis.buildForm();
      });

      $('#createModal .btn-primary').on('click', function(e) {
         e.preventDefault();
         oThis.create();
      });

    },

    buildForm: function(){
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
                oThis.listData = oThis.createMetaObject(response.data);
                var template = Handlebars.compile(jList.text());
                var html = template({'list_data' : oThis.listData});
                $('#list').html(html);
            }
        })
    },

    create: function(){
        jForm = $('#news_form');
        $.ajax({
            url: jForm.attr('action'),
            method: jForm.attr('method'),
            data: jForm.serialize(),
            success: function(response){
                console.log(response);
                $('#createModal').modal('hide');
            }
        })
    },

    populateList: function(){
      jList = $('#list_view');
      oThis.getAll();
    },

    createMetaObject: function(list){
      var configList = Object.assign({},list);
      $.each( configList, function( key, list_item ) {
        var record = list_item.record;
        $.each( record , function( key, value ) {
          record[key] = {'display_label' : meta_data['meta']['news_list'][key]['meta_ui']['input_label'], 'display_value' : value};
          console.log(record[key])
        });
      });
      return configList;
    }

  };

  $(document).ready(function () {
    oThis.init({i18n: {}});
  });

})(window);