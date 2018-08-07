;

(function () {

  var parentNs = ns("cms");

  var OstFomrBuilder = function ( config ) {
    var oThis = this;
    $.extend( oThis, config);

    oThis.init();
  };

  OstFomrBuilder.prototype = {
    init: function () {
      // Register all partials.
      $("[data-partial-id]").each( function ( index, el ) {
        var jEl = $( el );
        var templateHtml =  el.innerHTML;
        var templateId = jEl.data("partialId");
        Handlebars.registerPartial( templateId, templateHtml );
        jEl.removeAttr( "data-partial-id" );
      });
    }


    , uiConfig: null
    , dataConfig: null
    , jFormContainer: null
    ,buildForm: function ( data, jFormContainer ) {
      var oThis = this;
      jFormContainer = jFormContainer || oThis.jFormContainer;
      var uiConfig = oThis.uiConfig;
      var dataConfig = oThis.dataConfig;

    }
  };


  parentNs.OstFomrBuilder = OstFomrBuilder;

})();