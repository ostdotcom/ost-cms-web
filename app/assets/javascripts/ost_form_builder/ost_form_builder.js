;

(function () {

  var parentNs = ns("cms"),
      oThis;

  var OstFormBuilder = function ( config ) {
    oThis = this;
    if( config && typeof config == 'object') {
      $.extend(oThis, config);
    }
    oThis.init();
  };


  OstFormBuilder.prototype = {
    sPartials       : "[data-partial-id]" ,
    sForm           : "#generic_form" ,
    sModalWrapper   : "#genericModal .modal-content",

    defaultFileUploadConfig :{ getSignedURLApi :"/api/content/get_signed_url" },

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

    buildCreateForm: function ( entityName, entitiesConfig) {
      oThis.setFormType('create');
      var buildConfig = oThis.getFormBuildConfig(entityName, entitiesConfig);
      oThis.renderTemplate( buildConfig );
    },

    buildEditForm: function ( recordId, entityName, entitiesConfig ) {
      oThis.setFormType('edit');
      $.ajax({
        url: '/api/content/record?id=' + recordId,
        method: 'GET',
        beforeSend: function(){
          parentNs.requestHelper.showLoadingModal("Opening edit form...");
        },
        success: function ( response ) {
          if( response.success ) {
            $('.modal').modal('hide');
            oThis.onEditGetSuccess(response , recordId , entityName, entitiesConfig ) ;
          } else {
            oThis.onEditGetError.apply( oThis ,  arguments );
          }
        },
        error: function () {
          oThis.onEditGetError.apply( oThis ,  arguments );
        }
      });
    },

    onEditGetSuccess : function ( response, recordId , entityName, entitiesConfig) {
      var buildConfig = oThis.getFormBuildConfig( entityName, entitiesConfig, response, recordId );
      oThis.renderTemplate( buildConfig );
    },

    onEditGetError : function (jqXHR ,  error ) {
      var jModal = $("#displayMsgModal");
      $('.modal').modal('hide');
      parentNs.requestHelper.showError( jModal , error );
      jModal.modal("show");
    },

    getFormBuildConfig: function( entityName, entitiesConfig, response, recordId ) {
      var buildConfig = {
        'jFormSelector' : oThis.getFormSelector(),
        'context' : {
          entityFields: oThis.getEntityFields( entityName, entitiesConfig ),
          entityName: entityName,
          action: oThis.getFormAction(),
          method: oThis.getFormMethod(),
          header: oThis.getFormHeader()
        },
        'sModalWrapper' : oThis.getModalWrapper()
      } ,
      formType = oThis.getFormType()
      ;
      if( formType == 'edit' ) {
        buildConfig.context['data'] = response.data && response.data.record;
        buildConfig.context['id'] = recordId;
      }
      return buildConfig;
    },

    getFormSelector : function(){
      return oThis.sForm;
    },

    getEntityFields : function(entityName, entitiesConfig){
      return entitiesConfig && entitiesConfig['meta'] && entitiesConfig['meta'][entityName] && entitiesConfig['meta'][entityName]['fields'];
    },

    getFormAction: function( ){
      var formType = oThis.getFormType(),
          formApiRoot = '/api/content/',
          formApi = formApiRoot + formType
      ;
      return formApi;
    },

    getFormMethod : function(){
      return oThis.formMethod;
    },

    getFormHeader : function(  ){
      var header = oThis.getFormType().toUpperCase()
      ;
      header += " " + $(oThis.selectedItem).text() + ' Record';
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
      oThis.bindEvents( context );
    },

    getMarkup : function( jSelectorTemplate, context ) {
      var template = Handlebars.compile($(jSelectorTemplate).text()),
          html = template(context);
      return html;
    },

    bindEvents : function( config ){
      oThis.initFileUploader( config );
      oThis.intiColorPicker( config );
      oThis.initDatePicker( config );
      oThis.initSelectPicker(  );
      oThis.initTagsInput(  );
      oThis.initTooltips();
    },

    setFormType : function( type ){
      if( type ){
        oThis.formType =  type ;
      }
    },

    getFormType : function( ){
      return oThis.formType ;
    },

    intiColorPicker: function (config) {
      parentNs.colorPicker.initColorPicker('.color-picker', config);
    },

    initDatePicker : function () {
      parentNs.datePicker.init();
    },

    initFileUploader: function (config) {
      var fileUploaderConfig = config && config.getSignedURLApi || oThis.defaultFileUploadConfig;
      parentNs.ostFileUploader.init('.file-uploader', fileUploaderConfig);
    },

    initSelectPicker: function() {
      $('.selectpicker').selectpicker();
    },

    initTagsInput: function(  ) {
      $('.tagsinput').tagsinput({
        trimValue: true
      });
    },

    initTooltips: function(){
      $(function () {
        $('[data-toggle="tooltip"]').tooltip()
      })
    }
  };


  parentNs.OstFormBuilder = OstFormBuilder;


})();