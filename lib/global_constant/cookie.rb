# frozen_string_literal: true
module GlobalConstant

  class Cookie

    class << self

      def utm_cookie_expiry
        30.days
      end

      def new_api_cookie_key
        # Used to forward can set the cookies from API call
        'new_api_cookies'
      end

    end

  end

end
