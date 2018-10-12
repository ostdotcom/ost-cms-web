module CmsApi

  module Request

    class EntityStatus < Base

      # Initialize
      #
      # @param [String] host (mandatory) - host url request
      # @param [Hash] cookies (optional) - cookies that need to be sent to API
      # @param [Hash] headers (optional) - headers that need to be sent to API
      #
      # @return [CmsApi::Request::User] returns an object of CmsApi::Request::User class
      #
      def initialize(host, cookies = {}, headers = {}, param = '')
        super
        @service_base_route = 'content/'
      end


      # Get status of each entity i.e. drafted or published
      def get_entity_status()
        get("entity-status")
      end
    end

  end

end
