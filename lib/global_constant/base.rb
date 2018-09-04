# frozen_string_literal: true
module GlobalConstant

  class Base

    class << self

      def root_url
        @root_url ||= fetch_config.fetch('root_url', '')
      end

      def cloudfront_config
        @cloudfront ||= fetch_config.fetch('cloudfront', {}).with_indifferent_access
      end

      def basic_auth_config
        @basic_auth_config ||= fetch_config.fetch('basic_auth', {}).with_indifferent_access
      end

      def cms_api
        @cms_api ||= fetch_config.fetch('cms_api', {}).with_indifferent_access
      end

      def ost_web
        @ost_web ||= fetch_config.fetch('ost_web', {}).with_indifferent_access
      end


      private

      def fetch_config
        @fetch_config ||= begin
          template = ERB.new File.new("#{Rails.root}/config/constants.yml").read
          YAML.load(template.result(binding)).fetch('constants', {}) || {}
        end
      end

    end

  end

end
