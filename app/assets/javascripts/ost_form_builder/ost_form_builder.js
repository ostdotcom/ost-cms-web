;

(function () {

  var parentNs = ns("cms"),
      ostNs = ns("ost"),
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
    sSelectedItem: "a.selected",

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

    renderTemplate: function( jSelectorTemplate, context, jSelectorOutput ){
        var template = Handlebars.compile($(jSelectorTemplate).text());
        var html = template(context);
        if(jSelectorOutput){
            $(jSelectorOutput).html(html);
        }
        ostNs.ostFileUploader.init('.file-uploader');
        var fileUploader = $('.file-uploader').ostFileUploader();
        fileUploader.setToSignedApi( "/api/content/get_signed_url");
        return html;
    },

    buildCreateForm: function(entityId){
      oThis.renderTemplate(
        '#generic_form',
        {
          entity: meta_data['meta'][entityId]['fields'],
          entityId: entityId,
          action: '/api/content/create',
          method: 'POST',
          header: 'Create '+ $(oThis.selectedItem).text() +' Record'
        },
        '#genericModal .modal-content'
      );

    },

    buildEditForm: function(recordId) {
      $.ajax({
        url: '/api/content/record?id='+recordId,
        method: 'GET',
        success: function (response) {
          oThis.renderTemplate(
            '#generic_form',
            {
              entity: meta_data['meta'][entity_id]['fields'],
              action: '/api/content/edit',
              method: 'POST',
              header: 'Edit ' + $(oThis.selectedItem).text() + ' Record',
              data: response.data.record,
              id: recordId,
              entityId: entity_id
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

      Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);

        return {
          "+": lvalue + rvalue,
          "-": lvalue - rvalue,
          "*": lvalue * rvalue,
          "/": lvalue / rvalue,
          "%": lvalue % rvalue
        }[operator];
      });

      Handlebars.registerHelper('ifTooltip', function(tooltip, options ) {
        if( !!tooltip ){
          return options.fn(this);
        }

        return options.inverse(this);
      });

      var idCount = 1 ;
      Handlebars.registerHelper('configurator_component_id', function( name, isSameId , options ) {
        if( isSameId !== true ) {  //This should be exactly checked.
          idCount++
        }
        if( name ){
          return name + "_" + idCount ;
        }else {
          return "no_name" + "_" + idCount ;
        }
      });

      Handlebars.registerHelper('getAccept', function( data, options ) {
        if( typeof data == "string" ){
          return data;
        }else if( data.constructor == Array ) {
          return data.join(' , ');
        }
        return "";
      });

      Handlebars.registerHelper('ifFilePath', function( data, options ) {
        if( typeof data == "string" ){
          return options.fn(this);
        }
        return options.inverse(this);
      });

      Handlebars.registerHelper('is_required', function(data, options ) {
        if( data == 1 ){
          return "required";
        }else {
          return "";
        }
      });
    }
  };


  parentNs.OstFormBuilder = OstFormBuilder;



})();