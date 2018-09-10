;
(function (window) {

  var oSTNs = ns("cms"),
    oThis;

  oSTNs.requestHelper = oThis = {

    generalErrorMsg       : "Something went wrong!",
    generalSuccessMsg     : "Successful",
    defaultModalSuccess   : $("#requestSuccessModal"),
    defaultModalError     : $("#requestErrorModal"),
    defaultModalLoading   : $("#requestProcessingModal"),


    showError : function ( jWrapper , error ) {
      if(!jWrapper) return ;
      var jWrapper      = jWrapper ,
          responseJson  = error && error.responseJSON,
          err           = responseJson && responseJson.err,
          errorData     = err && err['error_data'],
          displayText   = err && err['display_text']
      ;
      if( errorData && (Object.keys(errorData).length > 0)){
        for (var key in errorData ) {
          if ( errorData[key] ) {
            var errorElement = jWrapper.find("[data-field-name='" + key + "']");
            var errorText = oThis.getErrorText(errorData[key]);
            errorElement.text(errorText);
          }
        }
      } else {
        var errMsg  = displayText || oThis.generalErrorMsg ,
             jEl = jWrapper.find('.general_error')
        ;
        jEl.text(errMsg)
      }
    },

    showErrorModal : function( error , jModal ){
      var jModal = jModal || oThis.defaultModalError;
      $('.modal').modal('hide');
      oSTNs.requestHelper.showError( jModal , error );
      jModal.modal("show");
    },

    showSuccessModal : function( displayMsg, jModal ){
      var jModal      = jModal      ||  oThis.defaultModalSuccess,
          displayMsg  = displayMsg  || oThis.generalSuccessMsg,
          jEl         = jModal.find('.success_message')
      ;
      jEl.text(displayMsg) ;
      $('.modal').modal('hide');
      jModal.modal("show");
      setTimeout( function () {
        jModal.modal('hide');
      } , 1000);
    },

    showLoadingModal : function( message , jModal ){
      $('.modal').modal('hide');
      var jModal  = jModal  || oThis.defaultModalLoading
      ;
      if( message ){
        jModal.find('.processing-message').html( message );
      }
      jModal.modal("show");
    },

    getErrorText: function (errorResponse) {
      var errorText = '';
      errorResponse.forEach(function (error) {
        for (var key in error) {
          errorText += error[key];
        }
      });
      return errorText;
    },

  }
})(window);