;
(function (window) {

  var oSTNs = ns("cms"),
    oThis;

  oSTNs.errorHelper = oThis = {
    generalErrorMsg : "Something went wrong!",

    showError : function ( jWrapper , error) {
      var responseJson  = error && error.responseJSON,
          err           = responseJson && responseJson.err,
          errorData     = err && err['error_data'],
          displayText   = err && err['display_text']
      ;
      if(errorData ){
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