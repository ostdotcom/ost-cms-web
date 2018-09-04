# frozen_string_literal: true
module GlobalConstant

  class OstWeb < GlobalConstant::Base

    class << self

      def url
        ost_web['url']
      end

      def sha256_salt
        ost_web['sha256_salt']
      end

      private

      def ost_web
        @ost_web ||= GlobalConstant::Base.ost_web
      end

    end

  end

end
