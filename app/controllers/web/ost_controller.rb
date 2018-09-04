class Web::OstController < Web::BaseController

  layout "ost"

  before_action :get_entity_ui_config, except: [:preview]
  before_action :get_configurations, except: [:preview]

  # Edit entity Dashboard
  #
  def dashboard
    @entity_id = params[:id] || 1
  end

  def preview
    @path =  params[:path]
    success_with_data({signed_url: create_preview_url})
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
          field_name[key_1]["data_key_name"] =  @config_response.data["meta"][key.to_s][key_1.to_s]["data_key_name"]

          end
      }
    end
    @config_response = ui_yaml

  end

  def get_configurations
    app_config = CmsApi::Request::EntityConfig.new(GlobalConstant::Base.root_url, request.cookies, {"User-Agent" => http_user_agent}).get_app_config
    @app_config = app_config.data["meta"]
  end


  def get_ost_web_url
    @ost_web_url ||= GlobalConstant::OstWeb.url
  end

  def get_ost_web_salt
    @ost_web_salt ||= GlobalConstant::OstWeb.sha256_salt
  end

  def preview_token
    @preview_token = Sha256.new({string: @raw_url, salt: GlobalConstant::OstWeb.sha256_salt}).perform
  end


  #
  # create url with original signature
  # * Author: Mayur
  # * Date: 3/8/2018
  # * Reviewed by:
  #

  def create_raw_preview_url
    @raw_url = get_ost_web_url + @path + '?ts=' + Time.now.to_i.to_s + '&ps=' + get_ost_web_salt.to_s
  end


  #
  # Create preview url
  # * Author: Mayur
  # * Date: 3/8/2018
  # * Reviewed by:
  #
  def create_preview_url
    uri = URI create_raw_preview_url
    puts ("raw url is ready #{@raw_url}")
    preview_token

    params = Rack::Utils.parse_query uri.query
    params.delete 'ps'
    uri.query = params.to_param.blank? ? nil : params.to_param
    uri.to_s + '&ps=' + @preview_token
  end



  def get_preview_url_path
    {'1' => '/', '2' => '/team', '3' => '/team', '4' => '/partners', '5' => '/careers', '6' => '/careers' }
  end

end
