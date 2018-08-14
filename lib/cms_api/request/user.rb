module CmsApi
  module Request
    class User < Base

      # Initialize
      #
      # * Author: Aman
      # * Date: 12/10/2017
      # * Reviewed By: Sunil
      #
      # @param [String] host (mandatory) - host url request
      # @param [Hash] cookies (optional) - cookies that need to be sent to API
      # @param [Hash] headers (optional) - headers that need to be sent to API
      #
      # @return [CmsApi::Request::User] returns an object of CmsApi::Request::User class
      #
      def initialize(host, cookies = {}, headers = {})
        super
        @service_base_route = 'user/'
      end


      def base_url
        Rails.env.development? ? "#{@host}/auth/" : "#{@host}/auth/"
      end

      # Get User info
      #
      # * Author: Aman
      # * Date: 12/10/2017
      # * Reviewed By:
      #
      #
      # @return [Result::Base] returns an object of Result::Base class
      #
      def client_detail(template_type)
        extra_params = {template_type: template_type}
        get("client-detail", extra_params)
      end

      # Get User info
      #
      # * Author: Aman
      # * Date: 12/10/2017
      # * Reviewed By:
      #
      #
      # @return [Result::Base] returns an object of Result::Base class
      #
      def basic_detail(template_type=nil, token=nil)
        extra_params = {}
        extra_params.merge!(template_type: template_type) if template_type.present?
        extra_params.merge!(token: token) if token.present?
        get("basic-detail", extra_params)
      end



      # Get User profile page info
      #
      # * Author: Aman
      # * Date: 13/10/2017
      # * Reviewed By:
      #
      #
      # @return [Result::Base] returns an object of Result::Base class
      #
      def profile_detail()
        get("")
      end

      def test_detail()
        'test_detail'
      end

    end
  end
end
