class Web::OstController < Web::BaseController

  layout "ost"

  before_action :get_entity_ui_config
  before_action :get_configurations

  # Edit entity Dashboard
  #
  def dashboard
    @entity_id = params[:id] || 1
  end

  private

  # Get entity edit dashboard configurations
  #
  def get_entity_ui_config
    ui_yaml = YAML.load_file(Rails.root.to_s + '/config/ui_config.yml')
    @config_response = CmsApi::Request::EntityConfig.new(GlobalConstant::Base.root_url, request.cookies, {"User-Agent" => http_user_agent}).get_config

    ui_yaml["meta"].each do |key, value |
      ui_yaml["meta"][key][:fields].map! {
        |field_name|
          field_name.each do | key_1, value_1|
          field_name[key_1]["validations"] = @config_response.data["meta"][key.to_s][key_1.to_s]["validations"]

          end
      }
    end
    @config_response = ui_yaml

  end

  def get_configurations
    app_config = CmsApi::Request::EntityConfig.new(GlobalConstant::Base.root_url, request.cookies, {"User-Agent" => http_user_agent}).get_app_config
    @app_config = app_config.data["meta"]
  end

end
