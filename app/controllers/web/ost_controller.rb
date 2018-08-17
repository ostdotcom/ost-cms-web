class Web::OstController < Web::BaseController

  layout "ost"

  before_action :get_entity_ui_config

  # Edit entity Dashboard
  #
  def dashboard
  end

  private

  # Get entity edit dashboard configurations
  #
  def get_entity_ui_config
    ui_yaml = YAML.load_file(Rails.root.to_s + '/config/ui_config.yml')
    @config_response = CmsApi::Request::EntityConfig.new(GlobalConstant::Base.root_url, request.cookies, {"User-Agent" => http_user_agent}).get_config
    Rails.logger.debug(ui_yaml.inspect)
    @config_response[:data]["meta"].each do |key, value|
      Rails.logger.debug(key.inspect)
      Rails.logger.debug(value.inspect)
      ui_yaml["meta"][value["section"].to_sym][value["data_key_name"].to_sym]["validations"] = value["validations"]
    end
    Rails.logger.debug(ui_yaml.inspect)
    @config_response = ui_yaml

  end

end
