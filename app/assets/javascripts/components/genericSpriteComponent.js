;
(function (window) {

  var nBNs = ns("cms"),
    oThis;

  nBNs.spriteComponent = oThis = {
    init: function(){
      oThis.registerGetSprite();
    },

    registerGetSprite: function(){

      Handlebars.registerHelper('getSprite', function( entity_name, image_key, height_key, height,  options ) {
        $.ajax({
          url: '/api/content/active',
          method: 'GET',
          data: {
            entity_name: entity_name
          },
          success: function (response) {
            var jSpriteWrapper = $(".sprite-wrapper");
            jSpriteWrapper.append('<img src="'+response.data.list[0].record[image_key]+'"  />');
            oThis.partners_sprite_length = jSpriteWrapper.find('img')[0].height / parseInt(height);
            jSpriteWrapper.find('.sprite-display').css( "background-image", "url("+response.data.list[0].record[image_key]+")");
            oThis.changeSpriteCSS();
            oThis.bindEvent();
            jSpriteWrapper.find('img').remove();
          }
        });
      });
    },

    bindEvent: function(){
      $("#partners_sprite_index").on("keyup input", function(){
        oThis.changeSpriteCSS()
      });
    },


    changeSpriteCSS: function(){
      var backgroundPosition = ((100.00/(oThis.partners_sprite_length-1))* parseInt($("#partners_sprite_index").val())
      ).toFixed(2) + "%";
      $(".sprite-wrapper .sprite-display").css(
        "background-position-y", backgroundPosition
      );
    }

  }
})(window);