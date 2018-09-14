;
(function (window) {

  var Helper = function (options, originalOptions, jqXHR) {
    var oThis = this;

    var progressOption = options.ostProgress || originalOptions.ostProgress;
    oThis.init( options, originalOptions );
    oThis.buildProgress( progressOption );
    jqXHR.always(function() {
      oThis.jProgressAnimate.animate({"width":"100%"},function(){
          oThis.jProgressBar.remove();
        $(".loader-overlay").css('display','none');
          oThis.jProgressBar   = null;
          oThis.sProgressAnimate = null;
      });
    });
  };

  Helper.prototype = {
    jTemplate   : $('#progressbar-template-id'),

    sProgressBar : '#ostProgressBar',
    jProgressBar : null,

    sProgressAnimate : ".progress-bar",
    jProgressAnimate  : null,

    init: function ( options, originalOptions ) {
      $(".loader-overlay").css('display','block');
      $(".modal").modal('hide');
      var oThis = this;
      options.xhr = function() {
        var xhr = $.ajaxSettings.xhr.apply($.ajaxSettings, arguments);
        var org_onreadystatechange = xhr.onreadystatechange;
        var progress = 0;
        xhr.onreadystatechange = function () {
          org_onreadystatechange && org_onreadystatechange.apply(xhr, arguments);
          progress = (xhr.readyState * 25);
          oThis.updateProgressPercent(progress)
          //Do Nothing.
        };
        return xhr;
      };
    },

    updateProgressPercent: function(progress){
      var oThis = this;
      oThis.jProgressAnimate.css({"width": progress + "%"});
    },

    progressCallback: function () {

    },

    buildProgress: function ( jSelector ) {
      var oThis           = this ,
          pTemplate       = oThis.jTemplate.html(),
          templateScript  = Handlebars.compile(pTemplate),
          id              = oThis.sProgressBar.substring( 1 ),
          className       =  oThis.sProgressAnimate.substring( 1 ) ,
          context         = {"id" : id , "className" : className },
          html = templateScript(context)
       ;
      $( jSelector).html(html);
      oThis.jProgressBar      = $( oThis.sProgressBar );
      oThis.jProgressAnimate  = oThis.jProgressBar.find( oThis.sProgressAnimate );
    }

  };


  $(window.document).on("ostProgressNeeded", function (event, options, originalOptions, jqXHR) {
    var newinstance = new Helper(options, originalOptions, jqXHR);
    Object.assign(jqXHR, {
      getOstAjaxProgressHelper: function () {
        return newinstance;
      }
    });
  })





})(window);