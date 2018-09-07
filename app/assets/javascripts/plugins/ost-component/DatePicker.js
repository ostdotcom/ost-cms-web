;
(function (window ) {

  var oSTNs           = ns("cms"),
      normaliser      = 1000,
      oThis
  ;

  var datePickerConfig =  {

  };

  oSTNs.datePicker = oThis = {
    defaultSelector : '.cms-date-picker',
    inputSelector   : '.jdate-picker-input',
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
      var jInput        = jEl.parent().find(oThis.inputSelector),
          val           = jInput.val(),
          normalisedVal = parseInt(val) * normaliser,
          dateObj       = new Date( normalisedVal ),
          date          = oThis.getNormalizedVal(dateObj.getUTCDate()),
          month         = oThis.getNormalizedVal(dateObj.getUTCMonth()+1),
          year          = dateObj.getUTCFullYear(),
          separator     = "-",
          displayVal    = year+ separator + month + separator + date
      ;
      if( isNaN(year) || isNaN(month) || isNaN(date) ) return ;
      jEl.val( displayVal );
    },

    getNormalizedVal : function( val ){
      var stringVal = val && val.toString();
      if( stringVal.length == 1 ){
        return "0"+stringVal;
      }
      return stringVal;
    },

    setFormInputValue : function ( jEl ) {
      var val           = jEl.val(),
          jInput        = jEl.parent().find(oThis.inputSelector),
          timeStamp     = Date.parse( val + " UTC" ),
          normalisedVal = timeStamp / normaliser
      ;
      jInput.val( normalisedVal );
    }
  };

})(window );