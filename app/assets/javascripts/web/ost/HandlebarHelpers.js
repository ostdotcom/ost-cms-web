(function( window ) {
  Handlebars.registerHelper("when", function (operand_1, operator, operand_2, options) {
    var operators = {
      '==': function (l, r) {
        return l == r;
      },
      '!=': function (l, r) {
        return l != r;
      },
      '>': function (l, r) {
        return Number(l) > Number(r);
      },
      '<': function (l, r) {
        return Number(l) < Number(r);
      },
      '||': function (l, r) {
        return l || r;
      },
      '&&': function (l, r) {
        return l && r;
      },
      '%': function (l, r) {
        return (l % r) === 0;
      }
    }
      , result = operators[operator](operand_1, operand_2);

    if (result) return options.fn(this);
    else return options.inverse(this);
  });

  Handlebars.registerHelper("math", function (lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
      "+": lvalue + rvalue,
      "-": lvalue - rvalue,
      "*": lvalue * rvalue,
      "/": lvalue / rvalue,
      "%": lvalue % rvalue
    }[operator];
  });

  Handlebars.registerHelper('ifTooltip', function (tooltip, options) {
    if (!!tooltip) {
      return options.fn(this);
    }

    return options.inverse(this);
  });

  var idCount = Date.now();
  Handlebars.registerHelper('configurator_component_id', function (isSameId, options ) {
    if ( isSameId !== true ) {  //This should be exactly checked.
      idCount++
    }
    return "c_" + idCount + "_id";
  });

  Handlebars.registerHelper('getAccept', function (data, options) {
    if (typeof data == "string") {
      return data;
    } else if (data.constructor == Array) {
      return data.join(' , ');
    }
    return "";
  });

  var normaliser = 1000;
  Handlebars.registerHelper('getDate', function (val, options) {
    var normalisedVal = parseInt(val) * normaliser,
        dateObj       = new Date( normalisedVal ),
        date          = (dateObj.getUTCDate()),
        month         = (dateObj.getUTCMonth()+1),
        year          = dateObj.getUTCFullYear(),
        separator     = "-";
    if( isNaN(year) || isNaN(month) || isNaN(date) ) return "";
    return (year+ separator + month + separator + date);
  });

  Handlebars.registerHelper('ifFilePath', function (data, options) {
    if (typeof data == "string") {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('is_required', function (data, options) {
    if (data == 1) {
      return "required";
    } else {
      return "";
    }
  });

  Handlebars.registerHelper('isImageUrl', function (data, options) {
    if (data == "ost-input-file") {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('isColor', function (data, options) {
    if (data == "generic-color-picker") {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('isTimeStamp', function (data, options) {
    if (data == "generic-date-picker") {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('isText', function (data, options) {
    if (data != "ost-input-file" && data != "generic-color-picker" && data != "generic-date-picker") {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('isSelected', function (value , values , options) {
    if(values && values.indexOf(value) > -1  ){
      return 'selected' ;
    }else {
      return "";
    }
  });

  //FOR debugging purpose only
  Handlebars.registerHelper('toJSONString', function (value  , options) {
    return JSON.stringify( value );
  });
})( window )