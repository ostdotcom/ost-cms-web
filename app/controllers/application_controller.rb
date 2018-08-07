class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  before_action :set_request_from_bot_flag

  before_action :set_entities_meta_info

  # Sanitize params
  include Sanitizer
  before_action :sanitize_params

  include CookieConcern
  include ApplicationHelper

  # Page not found action
  #
  def not_found
    res = {
      error: 'ost_page_not_found',
      error_display_text: 'Page not found',
      http_code: GlobalConstant::ErrorCode.not_found
    }
    @response = Result::Base.error(res)
    render_error_response_for(@response)
  end

  private

  # Get user agent
  #
  def http_user_agent
    request.env['HTTP_USER_AGENT'].to_s
  end

  # set bot request flag in params
  #
  def set_request_from_bot_flag
    res = http_user_agent.match(/\b(Baidu|Baiduspider|Gigabot|Googlebot|thefind|webmeup-crawler.com|libwww-perl|lwp-trivial|msnbot|SiteUptime|Slurp|ZIBB|wget|ia_archiver|ZyBorg|bingbot|AdsBot-Google|AhrefsBot|FatBot|shopstyle|pinterest.com|facebookexternalhit|Twitterbot|crawler.sistrix.net|PolyBot|rogerbot|Pingdom|Mediapartners-Google|bitlybot|BlapBot|Python|www.socialayer.com|Sogou|Scrapy|ShopWiki|Panopta|websitepulse|NewRelicPinger|Sailthru|JoeDog|SocialWire|CCBot|yacybot|Halebot|SNBot|SEOENGWorldBot|SeznamBot|libfetch|QuerySeekerSpider|A6-Indexer|PAYONE|GrapeshotCrawler|curl|ShowyouBot|NING|kraken|MaxPointCrawler|efcrawler|YisouSpider|BingPreview|MJ12bot)\b/i)
    params[:is_bot] = res.present? ? 1 : 0
  end

  # Sanitize params
  #
  def sanitize_params
    sanitize_params_recursively(params)
  end

  # Set page meta info
  #
  def set_page_meta_info(custom_extended_data = {})
    service_response = GetPageMetaInfo.new(
      controller: params[:controller],
      action: params[:action],
      request_url: request.url,
      custom_extended_data: custom_extended_data
    ).perform

    unless service_response.success?
      raise 'Incomplete Page Meta.'
    end

    page_extended_data = service_response.data

    @page_meta_data = page_extended_data[:meta]
    @page_assets_data = page_extended_data[:assets]
  end

  # Set entities meta info
  #
  def set_entities_meta_info
    @entities_meta_data = GetEntitiesMeta.new.get_meta_config
    page = 'home_page'
    list = 'news_ol'
    @entity_meta = @entities_meta_data[page][list]
    puts @entity_meta.to_json

  end

  # Render error response for
  #
  # * Author: Kedar
  # * Date: 09/10/2017
  # * Reviewed By: Sunil Khedar
  #
  def render_error_response_for(service_response)

    http_code = service_response.http_code

    @page_assets_data = {specific_js_required: 0}

    # Clean critical data
    service_response.data = {}

    if request.xhr?
      (render plain: Oj.dump(service_response.to_json, mode: :compat), status: http_code) and return
    else
      if http_code == GlobalConstant::ErrorCode.unauthorized_access
        redirect_to :login and return
      elsif http_code == GlobalConstant::ErrorCode.temporary_redirect
        redirect_to '/' and return
      else
        response.headers['Content-Type'] = 'text/html'
        render file: "public/#{http_code}.html", layout: false, status: http_code and return
      end
    end

  end

  def get_user_response
    @service_response = CmsApi::Request::User.new('https://securedhost.com', request.cookies, {"User-Agent" => http_user_agent}).profile_detail
  end

  def get_config
    ui_yaml = YAML.load_file('config/ui_config.yml')
    @config_response = CmsApi::Request::Config.new('https://securedhost.com', request.cookies, {"User-Agent" => http_user_agent}).get_config
    @config_response.to_json[:data]["meta"].each do |key, value|
      ui_yaml["meta"][value["section"].to_sym][value["data_key_name"].to_sym]["validations"] = value["validations"]
      puts "testing-------#{ui_yaml["meta"][value["section"].to_sym]}"
    end
    @config_response = ui_yaml
    puts "@config_response---- #{@config_response.to_json}"

  end

end
