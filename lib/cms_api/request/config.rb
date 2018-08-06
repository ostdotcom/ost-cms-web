module CmsApi

  module Request

    class Config < Base

      def initialize(host, cookies = {}, headers = {})
        super
        @service_base_route = 'configs/'
      end

      def get_config()
        get("")
      end
    end

  end

end
