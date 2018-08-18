module CmsApi

  module Request

    class EntityConfig < Base

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
        @service_base_route = 'content/configs/'
      end

      # Get Entity config
      #
      # @return [Result::Base] returns an object of Result::Base class
      #
      def get_config()
        get("")
      end
    end

  end

end