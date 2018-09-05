;
(function (window ) {

  var oSTNs           = ns("cms"),
    oThis
  ;

  var datePickerConfig =  {

  };

  oSTNs.datePicker = oThis = {
    defaultSelector : '.cms-date-picker',
    inputSelector   : '.form-control',
    events          : 'change.datepicker',

    getDatePickerConfig : function () {
      var configCopy = {} ;
      $.extend( true , configCopy ,  datePickerConfig ) ;
      return configCopy ;
    },

    init : function (selector , events ) {
      var selector =  selector || oThis.defaultSelector ,
          events   =  events || oThis.events,
          jEls     = $(selector),
          cnt , len = jEls.length
      ;

      for( cnt = 0 ;  cnt < len ; cnt++ ){
        oThis.setViewInputValue( jEls.eq( cnt ) );
      }

      jEls.off( events ).on( events , function () {
        oThis.setFormInputValue( $(this) );
      });
    },

    setViewInputValue : function ( jEl ) {
      var jInput  = jEl.parent().find(oThis.inputSelector),
          val     = jInput.val()
      ;
      console.log( val );
    },

    setFormInputValue : function ( jEl ) {
      var val       = jEl.val(),
          jInput    = jEl.parent().find(oThis.inputSelector),
          timeStamp = Date.parse( val )
      ;
      jInput.val( timeStamp );
    }
  };

})(window );