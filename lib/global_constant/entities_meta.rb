# frozen_string_literal: true
module GlobalConstant

  class EntitiesMeta

    class << self

      def get()
        get_config
      end

      private

      def get_config
        @config ||= fetch_config.with_indifferent_access
      end

      def fetch_config
        YAML.load_file("#{Rails.root}/config/entities-meta.yml")
      end

    end

  end

end
