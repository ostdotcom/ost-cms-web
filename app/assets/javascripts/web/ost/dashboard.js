;
(function (window) {

  var oSTNs = ns("cms"),
      oThis;

  oSTNs.dashboard = oThis = {

    ostFormBuilder: null,

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
         oThis.create();
      });

    },

    buildForm: function(){
        oThis.ostFormBuilder.renderTemplate(
            '#news_list',
            {
                news_list: meta_data.meta.news_list,
                action: '/api/create',
                method: 'POST'
            },
            '#createModal .modal-body'
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
                console.log(response);
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
    }



  };

  $(document).ready(function () {
    oThis.init({i18n: {}});
  });

})(window);