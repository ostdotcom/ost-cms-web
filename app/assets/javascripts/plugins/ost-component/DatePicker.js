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

    init : function ( config, selector , events  ) {
      var selector =  selector || oThis.defaultSelector ,
          events   =  events || oThis.events,
          jEls     = $(selector),
          cnt , len = jEls.length
      ;
      oThis.setValidations(jEls, config);

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
    },

    setValidations : function (jEls, config) {
      var maxDate = config.max ? config.max : oThis.getToday(),
        minDate = config.min ? config.min : "2016-01-01";

      jEls.attr("max", maxDate);
      jEls.attr("min", minDate);
    },

    getToday : function(){
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();
      if(dd<10){
        dd='0'+dd
      }
      if(mm<10){
        mm='0'+mm
      }
      return  yyyy+'-'+mm+'-'+dd;
    }



  };

})(window );