module CmsApi
  module Request
    class User < Base

      # Initialize
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

      # Get User profile details
      #
      # @return [Result::Base] returns an object of Result::Base class
      #
      def profile_detail()
        get("")
      end

      private

      # Override base url
      #
      def base_url
        "#{@host}/auth/"
      end

    end
  end
end
