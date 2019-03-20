;
(function (window ) {

  var oSTNs           = ns("cms"),
    oThis
  ;

  var tinyMceBodyClass = "tiny-mce-editor-inline-body",
      tinyMceBodyStyle = ".tiny-mce-editor-inline-body { color: #597A84; font-size: 0.75rem; font-weight: 300; letter-spacing: 0.2px; font-family: 'Quasimoda', Source Sans Pro, sans-serif;}",
      pluginOptions    = ['link', 'paste'] ,
      toolbarOptions   = 'bold, italic, underline, link'
  ;

  var sWrapper  = '.form-group' ,
      sMocker   = '.len-mocker'
  ;

  var tinyMceConfig =  {
      body_class              : tinyMceBodyClass,
      content_style           : tinyMceBodyStyle,
      plugins                 : pluginOptions,
      toolbar                 : toolbarOptions,
      statusbar               : false,
      menubar                 : false,
      forced_root_block       : false,
      toolbar_item_size       : "small",
      toolbar_items_size      : "small",
      extended_valid_elements : "*[*]",
      entity_encoding         : 'raw',
      paste_as_text           : true,
      convert_urls            : false,

      setup: function (editor) {

        // Listen and update textarea for form submit
        editor.off('keyup change').on('keyup change', function ( e ) {
            var jTextArea     = getTextArea( tinymce.activeEditor ),
                content       = editor.getContent(),
                formGroup     = jTextArea.closest(sWrapper),
                lenMocker     = formGroup.find(sMocker),
                contentLength = getStripedContentLength( editor )
            ;
            lenMocker.html( contentLength );
            jTextArea && jTextArea
              .val( content )
              .trigger('keyup')
              .trigger('change')
            ;
        });

        // Restrict based on current content length
        editor.off('keydown').on( 'keydown', function( e ) {
         var allowedKeys = [8, 37, 38, 39, 40, 46];
         if (allowedKeys.indexOf(e.keyCode) != -1) return true;
         var  contentLen = getStripedContentLength( editor ) ,
              maxLength  = getMaxLength( editor ) ,
              diff       = maxLength - contentLen
         ;
         if( maxLength ){
           if( diff < 1 ){
             tinymce.dom.Event.cancel(e);
           }
         }
        });
      },

      // Prior to paste check if can be pasted if not trim content to maxlength paste
      paste_preprocess: function ( plugin, args ) {
        var editor            = tinymce.get(tinymce.activeEditor.id) ,
            contentLength     = getStripedContentLength( editor ),
            maxLength         = getMaxLength( editor ),
            contentToPaste    = args.content ,
            contentToPasteLen = contentToPaste.length ,
            toBeContentLen
        ;
        if( maxLength ) {
          toBeContentLen = maxLength - contentLength ;
          if( toBeContentLen < contentToPasteLen ){
            args.content = contentToPaste.substring( 0 ,  toBeContentLen );
          }
        }
      },

      init_instance_callback : function ( inst ) {
        var jTextArea     = getTextArea( inst ),
            initialVal    = jTextArea && jTextArea.val( ) || "" ,
            formGroup     = jTextArea.closest(sWrapper),
            lenMocker     = formGroup.find(sMocker),
            contentLength = getStripedContentLength( inst )
        ;
        lenMocker.html( contentLength );
        inst.setContent( initialVal );
      }
  };

  function getMaxLength( editor ){
      var settings          = editor.settings,
          validations       = settings && settings.validations,
          maxLength         = validations && validations.max_length
      ;
      return maxLength;
  }

  function getStripedContentLength ( editor ){
    var contentDocument   = editor.contentDocument ,
        body              = contentDocument.body ,
        innerContent      = body.textContent,
        contentLength     = innerContent.length
    ;
    return contentLength;
  }

  function getTextArea( inst ){
    var hParent   = inst.editorContainer,
      jParent   = $( hParent ),
      jTextArea = jParent.parent().find('.tinymce-editor')
    ;
    return jTextArea;
  }

  function getSanitizedContent( content ) {
    var replaceString   = "&nbsp;" ,
      replaceBy       = " " ,
      trimmedContent  = ""
    ;
    if( content ){
      trimmedContent = content.replace( new RegExp( replaceString , 'g'), replaceBy );
      trimmedContent = trimmedContent.replace(/\s\s+/g, replaceBy );
      trimmedContent = trimmedContent.trim();
    }
    return trimmedContent ;
  }

  oSTNs.richTextEditor = oThis = {

    getTinyMceConfig : function () {
      var configCopy = {} ;
      $.extend( true , configCopy , tinyMceConfig );
      return configCopy;
    } ,

    initTinyMc : function ( selector , config ) {
      if( !selector ) return ;
      var tinyMceInitConfig = oThis.getTinyMceConfig();
      if ( config && typeof config === "object") {
        $.extend( tinyMceInitConfig , config );
      }
      tinyMceInitConfig['selector'] = selector;
      tinymce.init(  tinyMceInitConfig );

      //This code is explicit to bootstrap modal handling.
      $('body').off('focusin.tinymce').on('focusin.tinymce', function(e) {
        if ($(e.target).closest(".mce-window").length) {
          e.stopImmediatePropagation();
        }
      });
    }
  };

})(window );