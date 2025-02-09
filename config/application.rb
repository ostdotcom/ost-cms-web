require_relative 'boot'

require "rails"
# Pick the frameworks you want:
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
require 'active_support/concern'

ost_rails_root = File.expand_path('../..', __FILE__)
require "#{ost_rails_root}/lib/global_constant/base.rb"
Dir["#{ost_rails_root}/lib/global_constant/*.rb"].each {|file| require file }

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module OstCmsWeb
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.1

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Local machine timezone
    config.time_zone = YAML.load_file(open(Rails.root.to_s + '/config/time_zone.yml'))['rails_time_zones'][Rails.env.to_s]

    # Custom directories with classes and modules you want to be autoloadable.
    config.autoload_paths << "#{config.root}/lib/"
    config.eager_load_paths << "#{config.root}/lib/"
    config.assets.prefix = "/js-css/cms-web"
    # Custom log formatter
    require_relative('../lib/custom_log_formatter')
    config.log_level = :debug
    config.log_formatter = CustomLogFormatter.new

  end
end
