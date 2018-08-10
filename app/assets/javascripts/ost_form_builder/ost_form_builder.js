;

(function () {

  var parentNs = ns("cms"),
      oThis;

  var OstFormBuilder = function ( config ) {
    oThis = this;
    $.extend( oThis, config);

    oThis.init();
  };

  OstFormBuilder.prototype = {

    uiConfig: null,
    dataConfig: null,
    jFormContainer: null,

    init: function () {

      // Register all partials.
      $("[data-partial-id]").each( function ( index, el ) {
        var jEl = $( el );
        var templateHtml =  el.innerHTML;
        var templateId = jEl.data("partialId");
        Handlebars.registerPartial( templateId, templateHtml );
        jEl.removeAttr( "data-partial-id" );
      });

      oThis.registerHelpers();
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
    },

    buildCreateForm: function(){
      oThis.renderTemplate(
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

    buildEditForm: function(recordId) {
      $.ajax({
        url: '/api/record?id='+recordId,
        method: 'GET',
        success: function (response) {
          oThis.renderTemplate(
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


    registerHelpers: function(){
        Handlebars.registerHelper( "when", function(operand_1, operator, operand_2, options) {
            var operators = {
                '==': function(l,r) { return l == r; },
                '!=': function(l,r) { return l != r; },
                '>': function(l,r) { return Number(l) > Number(r); },
                '<': function(l,r) { return Number(l) < Number(r); },
                '||': function(l,r) { return l || r; },
                '&&': function(l,r) { return l && r; },
                '%': function(l,r) { return (l % r) === 0; }
            }
                , result = operators[operator](operand_1,operand_2);

            if (result) return options.fn(this);
            else  return options.inverse(this);
        });
    }
  };


  parentNs.OstFormBuilder = OstFormBuilder;



})();