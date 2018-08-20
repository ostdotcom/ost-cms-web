;
(function (window , $) {

  var oSTNs = ns("ost"),
      configuratorModalConfig = ns("ost.configuratorModalConfig"),
      handlebarHelper = ns("ost.handlebarHelper"),

      oThis;

  oSTNs.fileUploader = oThis = {
    generalErrorMsg     : "Something went wrong!",

    selector            : ".file-upload-input",
    dSignedUrl          : "get-signed-url",
    dPreUploadMarkup    : "pre-upload-markup",

    sParent             : ".ost-file-uploader-wrap",

    sLabelWrap          : '.input-label-wrapper',
    sProcessingIcon     : '#j-processing-icon',
    sUploadedImageWrap  : "#uploaded-image-wrap",

    fileTypeEnum        : {
      'image' : 'images',
      'pdf'   : "pdfs"
    },

    bindButtonActions: function ( selector ) {
      var jEL = selector ? $(selector) : $(oThis.selector);
      jEL.off('change').on('change' , function ( e ) {
        oThis.startUpload( $(this) );
      });
    },

    startUpload: function ( jEl ) {
      var jWrapper  = jEl.closest( oThis.sParent ).find( oThis.sLabelWrap),
          preMarkup = jWrapper.html(),
          jMarkup   = $( oThis.sProcessingIcon ).html()
      ;
      oThis.resetError( jEl );
      if( oThis.isValid( jEl ) ){
        jEl.data( oThis.dPreUploadMarkup , preMarkup );
        jWrapper.html( jMarkup );
        oThis.getSignedUrl( jEl );
      }
    },

    isValid : function ( jEl ) {
      var jTarget   = jEl[0] ,
          file      = jTarget.files[0] ,
          size      = file.size,
          name      = file.name,
          minBytes  = jEl.data('min-bytes'),
          maxBytes  = jEl.data('max-bytes'),
          isError   = true,
          maxMb ,
          errorMsg
      ;
      if( minBytes && minBytes > size ){
        isError =  false;
        errorMsg = name + ' file size too small';
        oThis.showError( errorMsg , jEl ) ;
      }else if( maxBytes && maxBytes < size  ){
        isError = false;
        maxMb = maxBytes / (1024*1024);
        errorMsg = jEl.title+' file size too large. Max allowed '+maxMb+' MB';
        oThis.showError( errorMsg , jEl ) ;
      }
      return isError ;
    },

    getSignedUrl : function ( jEl ) {
      var action = oThis.getToSignedApi( jEl )
      ;
      $.ajax({
        url     : action,
        data    : oThis.getParams( jEl ),
        method  : "POST",
        success : function ( res ) {
          oThis.onSignedSuccess( res , jEl );
        },
        error: function ( jqXHR, exception ) {
          oThis.showServerError( exception , jEl );
        }
      });
    },

    getToSignedApi : function ( jEl ) {
      var toSignedApi = jEl.data( oThis.dSignedUrl ),
          jForm
      ;
      if( !toSignedApi ){
        jForm       = jEl.parent('form');
        toSignedApi = jForm.data( oThis.dSignedUrl );
      }
      return toSignedApi;
    },

    getParams : function ( jEl ) {
      var fileType  = jEl[0].files[0].type ,
          inputName = jEl.attr('name'),
          params = { },

          currType , pathPreFix
      ;

      for(var key in oThis.fileTypeEnum ){
        if( fileType.indexOf( key ) > -1  ){
          currType = oThis.fileTypeEnum[ key ];
          params[ currType ] = {};
          params[ currType ][inputName] = fileType ;
          break;
        }
      }
      return params;
    },

    onSignedSuccess : function ( responses , jEl ) {
      if( responses.success ){
        oThis.uploadFile( responses, jEl  )
      }else {
        oThis.showServerError( responses , jEl ) ;
      }
    },

    uploadFile : function ( responses, jEl ) {
      var action = responses.url ,
          fields = responses.fields,
          theFormFile  = jEl[0].files[0]
      ;

      $.ajax({
          type: 'PUT',
          // Content type must much with the parameter you signed your URL with
          url: action,
          // this flag is important, if not set, it will try to send data as a form
          contentType: 'binary/octet-stream',
          //response type
          dataType: 'xml',
          // the actual file is sent raw
          processData: false,
          // file data
          data: theFormFile,
          success: function ( res ) {
            console.log("success data " , res);
            oThis.onFileUploadSuccess( res , jEl );
          },
          error: function ( jqXHR, exception ) {
            console.log("success data " , exception);
            oThis.showServerError( exception , jEl );
          }
        })
    },

    onFileUploadSuccess : function ( data , jEl ) {
      var imgSrc   = data.src ,  //TODO
          jWrapper = jEl.closest( oThis.sParent ).find( oThis.sLabelWrap),
          jMarkup  = handlebarHelper.getMarkup( oThis.sUploadedImageWrap ,  {'img_src' : imgSrc } )
      ;
      jWrapper.html( jMarkup );
      jEl.val( imgSrc ) ;
    },

    updateImageDisplay : function ( jEl  ) {
      var curFiles = jEl[0].files[0],
          imgSrc   = window.URL.createObjectURL( curFiles ),
          jWrapper = jEl.closest( oThis.sParent ).find( oThis.sLabelWrap),
          jMarkup  = handlebarHelper.getMarkup( oThis.sUploadedImageWrap ,  {'img_src' : imgSrc } )
      ;
      jWrapper.html( jMarkup );
    },

    resetError : function ( jEl ) {
      jEl.closest( oThis.sParent ).find(".invalid-feedback")
        .html( "" )
        .removeClass( 'is-invalid' );
    },

    showServerError : function ( error , jEl ) {
      var err       = error['err'] ,
        errMessage  = err && err['display_text'] || oThis.generalErrorMsg
      ;
      oThis.showError( error , jEl ) ;
    },

    showError : function ( errMessage, jEl ) {
      var jWrapper = jEl.closest( oThis.sParent ).find( oThis.sLabelWrap),
          jMarkup  = jEl.data( oThis.dPreUploadMarkup )
      ;
      jEl.closest( oThis.sParent ).find(".invalid-feedback")
          .html( errMessage )
          .addClass( 'is-invalid' )
      ;
      jWrapper.html( jMarkup );
    },

    setToSignedApi : function ( selector ,  api ) {
      if(!selector || !api) return ;
      $(selector).data(oThis.dSignedUrl, api );
    }


};


})(window , jQuery);