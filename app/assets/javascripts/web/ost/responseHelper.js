;
(function (window) {

  var oSTNs = ns("cms"),
    oThis;

  oSTNs.responseHelper = oThis = {

    generalErrorMsg     : "Something went wrong!",
    generalSuccessMsg   : "Successful",
    defaultModalSuccess : $("#displaySuccessModal"),
    defaultModalError   : $("#displayErrorModal"),

    showError : function ( jWrapper , error ) {
      var jWrapper      = jWrapper ||  defaultModalError ,
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

    showSuccessModal : function( displayMsg, jModal ){
      var jModal      = jModal      ||  oThis.defaultModalSuccess,
          displayMsg  = displayMsg  || oThis.generalSuccessMsg,
          jEl         = jModal.find('.success_message')
      ;
      jEl.text(displayMsg) ;
      $('.modal').modal('hide');
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