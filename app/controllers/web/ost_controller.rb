class Web::OstController < Web::BaseController

  layout "ost"

  skip_before_action :basic_auth

  before_action :set_page_meta_info

  def index

    service_response = CmsApi::Request::User.new('https://securedhost.com', request.cookies, {"User-Agent" => http_user_agent}).profile_detail
    puts service_response.to_json
  end

end
