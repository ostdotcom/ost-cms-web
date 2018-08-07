;

(function () {

  var parentNs = ns("cms");

  var OstFormBuilder = function ( config ) {
    var oThis = this;
    $.extend( oThis, config);

    oThis.init();
  };

  OstFormBuilder.prototype = {

    uiConfig: null,
    dataConfig: null,
    jFormContainer: null,

    init: function () {
      var oThis = this;
      // Register all partials.
      $("[data-partial-id]").each( function ( index, el ) {
        var jEl = $( el );
        var templateHtml =  el.innerHTML;
        var templateId = jEl.data("partialId");
        Handlebars.registerPartial( templateId, templateHtml );
        jEl.removeAttr( "data-partial-id" );
      });

        //oThis.renderTemplate('#news_list', {news_list: oThis.meta.news_list});
    },

    buildForm: function ( data, jFormContainer ) {
      var oThis = this;
      jFormContainer = jFormContainer || oThis.jFormContainer;
      var uiConfig = oThis.uiConfig;
      var dataConfig = oThis.dataConfig;
    },

    renderTemplate: function( jSelectorTemplate, context, jSelectorOutput ){
        var template = Handlebars.compile($(jSelectorTemplate).text());
        var html = template(context);
        if(jSelectorOutput){
            $(jSelectorOutput).html(html);
        }
        return html;
    }
  };


  parentNs.OstFormBuilder = OstFormBuilder;



})();