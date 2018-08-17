class Web::BaseController < ApplicationController

  before_action :basic_auth
  before_action :get_user_details
  before_action :set_page_meta_info

  private

  # Render error response pages
  #
  def render_error_response(service_response)
    # Clean critical data
    service_response.data = {}
    render_error_response_for(service_response)
  end

  # basic auth
  #
  def basic_auth
    users = {
      GlobalConstant::BasicAuth.username => GlobalConstant::BasicAuth.password
    }
    authenticate_or_request_with_http_basic do |username, password|
      if users[username].present? && users[username] == password
        true
      else
        false
      end
    end
  end

  # Get logged in user details
  #
  def get_user_details
    r = CmsApi::Request::User.new(GlobalConstant::Base.root_url, request.cookies, {"User-Agent" => http_user_agent}).profile_detail
    redirect_to :sign_in unless r.success?
    @current_user = r.data
  end

end