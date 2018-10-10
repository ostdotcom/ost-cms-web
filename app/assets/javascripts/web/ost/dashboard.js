;
(function (window) {

  var oSTNs           = ns("cms"),
    oThis;

  oSTNs.dashboard = oThis = {

    publishApi            : '/api/content/publish',
    resetApi              : '/api/content/reset-to-publish',
    jPublishModal         : $("#publishModal"),
    jResetModal           : $("#resetModal"),

    init: function (config) {
      oThis.bindActions();
      oThis.hideEntityButtos();

    },


    bindActions: function(){
      $(".reset").on("click", oThis.resetAction);
      $(".publish").on("click", oThis.publishAction);
      $(".reset-btn").on("click", oThis.resetEntity);
      $(".publish-btn").on("click", oThis.publishEntity);
    },

    resetAction: function(e){
      oThis.entityName = $(e.currentTarget).data('entity-name');
      oThis.jResetModal.modal('show');
    },

    publishAction: function (e) {
      oThis.entityName = $(e.currentTarget).data('entity-name');
      oThis.jPublishModal.modal('show');
    },

    hideEntityButtos: function(){
      $(".entity-navbar").hide();
    },


    resetEntity: function(e){

      $.ajax({
        url: oThis.resetApi,
        method: 'POST',
        data: {
          entity_name: oThis.entityName
        },
        beforeSend: function(){
          oSTNs.requestHelper.showLoadingModal("Going to the last publish version ...");
        },
        success: function ( res ) {
          if( res.success ) {

            oSTNs.requestHelper.showSuccessModal( "Reset successful!");
            location.reload();
          } else {
            oSTNs.requestHelper.showErrorModal( res );
          }
        },
        error: function( error ){
          oSTNs.requestHelper.showErrorModal( error );
        }
      })
    },

    publishEntity: function(e){
      $.ajax({
        url: oThis.publishApi,
        method: 'POST',
        data: {
          entity_name: oThis.entityName
        },
        beforeSend: function(){
          oSTNs.requestHelper.showLoadingModal("Publishing ...");
        },
        success: function ( res ) {
          if( res.success ) {
            oSTNs.requestHelper.showSuccessModal( "Data published successfully !!");
            location.reload();
          } else {
            oSTNs.requestHelper.showErrorModal( res );
          }
        },
        error: function (  error ) {
          oSTNs.requestHelper.showErrorModal( error );
        }
      })


    }




  };


})(window);