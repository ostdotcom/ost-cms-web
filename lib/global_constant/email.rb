# frozen_string_literal: true
module GlobalConstant

  class Email

    class << self

      def default_from
        if Rails.env.production?
          'notifier@ost.com'
        else
          'staging.notifier@ost.com'
        end
      end

      def default_to
        ['backend@ost.com']
      end

      def subject_prefix
        "[OST-CMS-Web-#{Rails.env}] :: "
      end

    end

  end

end

