;

(function () {

  var parentNs = ns("cms"),
      ostNs = ns("ost"),
      oThis;

  var OstFormBuilder = function ( config ) {
    oThis = this;
    if( config && typeof config == 'object') {
      $.extend(oThis, config);
    }
    oThis.init();
  };


  OstFormBuilder.prototype = {
    sPartials : "[data-partial-id]" ,
    sForm     : "#generic_form" ,
    sModalWrapper  : "#genericModal .modal-content",

    formApi     : null,
    formMethod  : 'POST',
    formType    : null,

    init: function ( ) {
      oThis.registerPartials();
    },

    registerPartials : function(){
      // Register all partials.
      $("[data-partial-id]").each(function (index, el) {
        var jEl = $(el),
          templateHtml = el.innerHTML,
          templateId = jEl.data("partialId");
        Handlebars.registerPartial(templateId, templateHtml);
        jEl.removeAttr("data-partial-id");
      });
    },

    buildCreateForm: function ( entityId, entitiesConfig) {
      var buildConfig = oThis.getFormBuildConfig(entityId, entitiesConfig, true);
      oThis.renderTemplate( buildConfig );
      oThis.setFormType('Create');
    },

    buildEditForm: function ( recordId, entityId, entitiesConfig ) {
      $.ajax({
        url: '/api/content/record?id=' + recordId,
        method: 'GET',
        success: function (response) {
          var buildConfig = oThis.getFormBuildConfig( entityId, entitiesConfig, false, response, recordId );
          oThis.renderTemplate( buildConfig );
        }
      });
      oThis.setFormType('Edit');
    },

    getFormBuildConfig: function( entityId, entitiesConfig, isNew, response, recordId ) {
      var buildConfig = {
        'jFormSelector' : oThis.getFormSelector(),
        'context' : {
          entityFields: oThis.getEntityFields( entityId, entitiesConfig ),
          entityId: entityId,
          action: oThis.getFormAction( true ),
          method: oThis.getFormMethod(),
          header: oThis.getFormHeader( true )
        },
        'sModalWrapper' : oThis.getModalWrapper()
      };
      if( !isNew ) {
        buildConfig.context['data'] = response.data.record;
        buildConfig.context['id'] = recordId;
      }
      return buildConfig;
    },

    getFormSelector : function(){
      return oThis.sForm;
    },

    getEntityFields : function(entityId, entitiesConfig){
      return entitiesConfig && entitiesConfig['meta'] && entitiesConfig['meta'][entityId] && entitiesConfig['meta'][entityId]['fields'];
    },

    getFormAction: function( isNew ){
      isNew ? oThis.formApi = '/api/content/create' : oThis.formApi = '/api/content/edit';
      return oThis.formApi;
    },

    getFormMethod : function(){
      return oThis.formMethod;
    },

    getFormHeader : function( isNew ){
      var header = '';
      isNew ? header += 'Create ': header += 'Edit ';
      header += $(oThis.selectedItem).text() + ' Record';
      return header;
    },

    getModalWrapper : function() {
      return oThis.sModalWrapper;
    },

    renderTemplate: function ( config ) {
      var jFormSelector = config.jFormSelector,
        context       = config.context,
        sModalWrapper = config.sModalWrapper,
        html;
      if (sModalWrapper) {
        html = oThis.getMarkup(jFormSelector, context );
        $(sModalWrapper).html(html);
      }
      oThis.bindEvents();
    },

    getMarkup : function( jSelectorTemplate, context ) {
      var template = Handlebars.compile($(jSelectorTemplate).text()),
          html = template(context);
      return html;
    },

    bindEvents : function(){
      oThis.initFileUploader();
      oThis.bindColorPicker();
      oThis.initSelectPicker();
      oThis.initTagsInput();
    },

    setFormType : function( type ){
      if( type ){
        oThis.formType =  type ;
      }
    },

    getFormType : function( type ){
      return oThis.formType ;
    },

    bindColorPicker: function (config) {
      ostNs.colorPicker.initColorPicker('.color-picker', config);
    },

    initFileUploader: function (config) {
      ostNs.ostFileUploader.init('.file-uploader', config);
      var fileUploader = $('.file-uploader').ostFileUploader();
      fileUploader.setToSignedApi("/api/content/get_signed_url");
    },

    initSelectPicker: function() {
      $('.selectpicker').selectpicker();
    },

    initTagsInput: function( config ) {
      $('.tagsinput').tagsinput({
        confirmKeys: [32],
        trimValue: true
      });
    }
  };


  parentNs.OstFormBuilder = OstFormBuilder;


})();