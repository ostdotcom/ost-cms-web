;
(function (window) {

  var nBNs = ns("cms"),
    oThis;

  nBNs.navbar = oThis = {
    init: function(){
      //console.log("main2")

      oThis.bindEvents();
    },
    bindEvents: function () {
      $( "#preview-page-btn" ).click(function() {
        var value = $("#preview-page-options").val();
        var previewed_entities = $("#preview-page-options").attr('previewed_entity');
        $.ajax({
          url: '/api/content/get-preview-url',
          method: 'GET',
          data:{'path': value, previewed_entities: previewed_entities},
          success: function (response) {
            console.log("** in success ** " + response);
            window.open(response.data.url,'_blank');
          }
      });
      });
    }
  }
  nBNs.navbar.init()
})(window);