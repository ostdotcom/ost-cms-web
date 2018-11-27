class Web::OstController < Web::BaseController

  layout "ost"

  before_action :get_entity_ui_config, except: [:preview, :dashboard]
  before_action :get_configurations, except: [:preview]

  # Edit entity Dashboard
  #
  def entity
    @entity_name = params[:name] || GlobalConstant::Base.cms_web['default_entity']
  end


  def dashboard
    @entitites_status = get_entitites_status
  end


  private

  # Get entity edit dashboard configurations
  #
  def get_entity_ui_config
    ui_yaml = YAML.load_file(Rails.root.to_s + '/config/ui_config.yml')["meta"][params[:name].to_sym]
    @config_response = CmsApi::Request::EntityConfig.new(GlobalConstant::Base.root_url, request.cookies, {"User-Agent" => http_user_agent}, params[:name]).get_config
    ui_yaml[:meta] = @config_response.data["meta"]
      ui_yaml[:fields].map! {
        |field_name|
          field_name.each do | key_1, value_1|
          field_name[key_1]["validations"] = field_name[key_1]["validations"].present?  ?  field_name[key_1]["validations"].merge(@config_response.data["fields"][key_1.to_s]["validations"])  :  @config_response.data["fields"][key_1.to_s]["validations"]
          end
      }
    @config_response = ui_yaml

  end

  def get_configurations
    app_config = CmsApi::Request::EntityConfig.new(GlobalConstant::Base.root_url, request.cookies, {"User-Agent" => http_user_agent}).get_app_config
    @app_config = app_config.data["meta"]
  end

  def get_entitites_status
    CmsApi::Request::EntityStatus.new(GlobalConstant::Base.root_url, request.cookies, {"User-Agent" => http_user_agent}).get_entity_status
  end

end