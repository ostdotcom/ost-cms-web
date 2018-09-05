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
        //console.log(value);
        $.ajax({
          url: '/preview',
          method: 'GET',
          data:{'path': value},
          success: function (response) {
            console.log("** in success ** " + response);
            window.open(response.url,'_blank');
          }
      });
      });


    }
  }
  nBNs.navbar.init()
})(window);