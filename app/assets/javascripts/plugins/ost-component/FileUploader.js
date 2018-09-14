;
(function (window , $) {

  var oSTNs             = ns("cms"),
      handlebarHelper   = ns("ost.handlebarHelper"),
      _URL  = window.URL || window.webkitURL
  ;

  function FileUploader( jEl , config ) {
    var oThis = this
    ;
    oThis.config          = config ;
    oThis.jEl             = jEl ;
    oThis.jElMocker       = jEl.parent().find(oThis.sElMocker);
    oThis.imageInstance   = new Image();
    oThis.initFileUploader( );
    oThis.bindButtonActions( );
  }

  FileUploader.prototype = {
    sElMocker       : '.file-upload-mocker',
    imageInstance   : null,
    jEl             : null,
    jElMocker       : null ,
    imageSrcPrefix  : null ,
    imageSrcPostFix : null ,
    getSignedURLApi : null,

    generalErrorMsg     : "Something went wrong!",

    dPreUploadMarkup    : "pre-upload-markup",

    sParent             : ".ost-file-uploader-wrap",
    errorWrapper        : ".file-input-error-wrapper",
    sFileLabel          : ".file-name",
    sLabelWrap          : '.input-label-wrapper',
    sProcessingIcon     : '#j-processing-icon',
    sUploadedImageWrap  : "#uploaded-image-wrap",

    fileTypeEnum        : {
      'image' : 'images',
      'pdf'   : "pdfs"
    },

    bindButtonActions: function ( config ) {
      var oThis     = this ,
        jElMocker = oThis.jElMocker
      ;
      if( !jElMocker ) return ;

      $(oThis.sFileLabel).on('keydown', function(event){
        event.preventDefault();
      });


      jElMocker.off('change').on('change' , function ( e ) {
        oThis.startUpload( );
      });
    },

    initFileUploader : function(){
      var oThis = this ,
        fileUploadConfig = {
          dataType : 'xml',
          method: 'POST',
          success : function ( el ,  res ) {
            oThis.s3FileUploadSuccess( res );
          },
          error : function ( el, err ) {
            oThis.showError( oThis.generalErrorMsg  );
          },
          fail : function ( el, reason ) {
            oThis.showError( oThis.generalErrorMsg );
          }
        } ;

      if( oThis.config ) {
        fileUploadConfig = $.extend( true ,  fileUploadConfig , oThis.config );
      }
      oThis.jElMocker.fileupload( fileUploadConfig );
    },

    startUpload: function (  ) {
      var oThis   = this,
        jElMocker = oThis.jElMocker,
        jWrapper  = jElMocker.closest( oThis.sParent ).find( oThis.sLabelWrap),
        preMarkup = jWrapper.html(),
        jMarkup   = $( oThis.sProcessingIcon ).html()
      ;
      oThis.resetError();
      oThis.jEl.val("");
      if(  oThis.isValid() ){
        jElMocker.data( oThis.dPreUploadMarkup , preMarkup );
        jWrapper.html( jMarkup );
        oThis.getSignedUrl();
      }
    },

    isValid : function () {
      var oThis     = this,
        jElMocker   = oThis.jElMocker,
        jTarget     = jElMocker[0] ,
        file        = jTarget.files[0] ,
        size        = file.size,
        name        = file.name,
        type        = file.type,
        minBytes    = jElMocker.data('min-bytes'),
        maxBytes    = jElMocker.data('max-bytes'),
        accept      = jElMocker.data('accept').split(","),
        aspectRatio = oThis.getAspectRatio(),
        validFile = true,
        maxMb ,
        errorMsg
      ;
      if( minBytes && size <= minBytes ){
        validFile =  false;
        errorMsg = name + ' file size too small';
        oThis.showError( errorMsg  ) ;
      }else if( maxBytes && size >= maxBytes ){
        validFile = false;
        maxMb = maxBytes / (1024*1024);
        errorMsg = name +' file size too large. Max allowed '+maxMb+' MB';
        oThis.showError( errorMsg  ) ;
      }else if (accept.indexOf(type) < 0){
        validFile = false;
        errorMsg = 'This file format is not supported';
        oThis.showError( errorMsg  ) ;
      }

      if( aspectRatio ){
        var height , width ,
            roundedWR , roundedHR
        ;
        oThis.imageInstance.onload = function () {
          var oImg = this;
          width  = oImg.width;
          height = oImg.height;
          roundedWR = Math.ceil(  width * aspectRatio['height'] );
          roundedHR = Math.ceil(  height * aspectRatio['width'] );
          if( roundedWR != roundedHR ){
            errorMsg = name +' invalid aspect ratio';
            oThis.showError( errorMsg  ) ;
            validFile = false;
          }
        };
        oThis.imageInstance.src = _URL.createObjectURL( file );
      }

      return validFile ;
    },

    getAspectRatio : function () {
      var oThis       = this,
        jElMocker     = oThis.jElMocker ,
        widthWeight   = jElMocker.data('width-weight'),
        heightWeight  = jElMocker.data('height-weight'),
        ratio = null
      ;
      if(  widthWeight && heightWeight ){
        ratio = {} ;
        ratio['width']  = widthWeight;
        ratio['height'] = heightWeight;
      }
      return ratio ;
    },

    getSignedUrl : function (  ) {
      var oThis   = this,
        jElMocker = oThis.jElMocker,
        action    = oThis.getToSignedApi()
      ;
      $.ajax({
        url     : action,
        data    : oThis.getParams(  ),
        method  : "GET",
        success : function ( res ) {
          oThis.onSignedSuccess( res  );
        },
        error: function ( jqXHR, exception ) {
          oThis.showServerError( exception  );
        }
      });
    },

    getToSignedApi : function ( ) {
      return this.config.getSignedURLApi;
    },

    setToSignedApi : function (  api ) {
       this.config.getSignedURLApi= api;
    },

    getParams : function ( ) {
      var oThis     = this,
        jElMocker = oThis.jElMocker,
        jEl       = oThis.jEl,
        fileType  = jElMocker[0].files[0].type ,
        fileName  = jElMocker[0].files[0].name ,
        params    = { },
        currType , pathPreFix
      ;

      for(var key in oThis.fileTypeEnum ){
        if( fileType.indexOf( key ) > -1  ){
          currType = oThis.fileTypeEnum[ key ];
          params['file_type'] = fileType ;
          params[ "file_name" ] = fileName.split(".").slice(0,-1).join(".")
          break;
        }
      }
      return params;
    },

    onSignedSuccess : function ( response  ) {
      var oThis     = this,
        jElMocker = oThis.jElMocker
      ;
      if( response.success ){
        oThis.uploadFile( response, jElMocker  )
      }else {
        oThis.showServerError( response , jElMocker ) ;
      }
    },

    uploadFile : function ( response ) {
      var oThis   = this,
        jElMocker = oThis.jElMocker ,
        jEl       = oThis.jEl,
        inputName = jEl.attr('name');
        var action    = response.data.url ,
        fields    = response.data.fields,
        theFormFile  = jElMocker[0].files[0] ,
        imageSrc  = fields.key
      ;


      oThis.imageSrcPrefix  = $('meta[name=cloudfront-url]').attr("content");
      oThis.imageSrcPostFix = imageSrc ;
      jElMocker.fileupload('send', {
        files: [ theFormFile ],
        paramName: ['file'],
        url: action ,
        formData: fields
      });
    },

    s3FileUploadSuccess : function ( data  ) {
      var oThis     = this,
        jElMocker = oThis.jElMocker ,
        imgSrc    = oThis.imageSrcPrefix + "/" + oThis.imageSrcPostFix,
        jWrapper  = jElMocker.closest( oThis.sParent ).find( oThis.sLabelWrap ),
        jLable = jElMocker.closest( oThis.sParent ).find( oThis.sFileLabel )
       // jMarkup   = handlebarHelper.getMarkup( oThis.sUploadedImageWrap ,  {'img_src' : imgSrc } )
      ;
      jWrapper.html("Browse");
      jLable.val( imgSrc );
      oThis.jEl.val( imgSrc ) ;
    },

    updateImageDisplay : function (   ) {
      var oThis     = this,
        jElMocker = oThis.jElMocker ,
        curFiles  = jElMocker[0].files[0],
        imgSrc    = window.URL.createObjectURL( curFiles ),
        jWrapper  = jElMocker.closest( oThis.sParent ).find( oThis.sLabelWrap),
        jMarkup   = handlebarHelper.getMarkup( oThis.sUploadedImageWrap ,  {'img_src' : imgSrc } )
      ;
      jWrapper.html( jMarkup );
    },

    resetError : function (  ) {
      var oThis     = this,
        jElMocker = oThis.jElMocker
      ;
      jElMocker.closest( oThis.errorWrapper ).find(".invalid-feedback")
        .html( "" )
        .removeClass( 'd-block' );
    },

    showServerError : function ( error  ) {
      var oThis       = this,
        jElMocker   = oThis.jElMocker ,
        err         = error['err'] ,
        errMessage  = err && err['display_text'] || oThis.generalErrorMsg
      ;
      oThis.showError( errMessage , jElMocker ) ;
    },

    showError : function ( errMessage  ) {
      var oThis     = this,
        jElMocker = oThis.jElMocker,
        jWrapper  = jElMocker.closest( oThis.sParent ).find( oThis.sLabelWrap),
        jMarkup   = jElMocker.data( oThis.dPreUploadMarkup )
      ;
      jElMocker.closest( oThis.errorWrapper ).find(".invalid-feedback")
        .html( errMessage )
        .addClass( 'd-block' )
      ;
      jWrapper.html( jMarkup );
    }

  };


  var oThis ,
      jqDataNameSpace  = "ostFileUploader"
  ;
  oSTNs.ostFileUploader = oThis = {

    init : function ( selector , config ) {
      var jqDataNameSpace = jqDataNameSpace ,
        jElements = $(selector),
        len = jElements.length,  cnt ,
        jEl , fileUploader

      ;
      for( cnt = 0 ;  cnt < len ; cnt++ ) {
        jEl = jElements.eq( cnt );
        fileUploader = jEl.data( jqDataNameSpace )  ;
        if ( !fileUploader || !(fileUploader instanceof FileUploader) ) {
          fileUploader = new FileUploader( jEl , config );
          jEl.data( jqDataNameSpace , fileUploader );
        }
      }
    }
  };


  $.fn.extend({
    ostFileUploader : function ( config ) {
      var jEl           = $( this )
          ,fileUploader = jEl.data( jqDataNameSpace );
      ;

      if ( !fileUploader || !fileUploader instanceof FileUploader ) {
        fileUploader = new FileUploader( jEl );
        jEl.data( jqDataNameSpace, fileUploader );
      }
      if ( config && typeof config === "object") {
        $.extend( fileUploader , config );
      }
      return fileUploader ;
    }
  })


})(window , jQuery);