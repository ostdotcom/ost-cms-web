;
(function (window) {

  var nBNs = ns("cms"),
    oThis;

  nBNs.spriteComponent = oThis = {
    init: function(){
      oThis.registerGetSprite();
    },

    registerGetSprite: function(){

      Handlebars.registerHelper('getSprite', function( entity_name, image_key, sprite_count,  options ) {
        $.ajax({
          url: '/api/content/active',
          method: 'GET',
          data: {
            entity_name: entity_name
          },
          success: function (response) {
            var jSpriteWrapper = $(".sprite-wrapper");
            oThis.sprite_length = response.data.list[0].record[sprite_count];
            jSpriteWrapper.find('.sprite-display').css( "background-image", "url("+response.data.list[0].record[image_key]+")");
            oThis.changeSpriteCSS();
            oThis.bindEvent();
          }
        });
      });
    },

    bindEvent: function(){
      $(".sprite-index").on("keyup input", function(){
        oThis.changeSpriteCSS()
      });
    },


    changeSpriteCSS: function(){
      var backgroundPosition = ((100.00/(oThis.sprite_length-1))* parseInt($(".sprite-index").val())
      ).toFixed(2) + "%";
      $(".sprite-wrapper .sprite-display").css(
        "background-position-y", backgroundPosition
      );
    }

  }
})(window);