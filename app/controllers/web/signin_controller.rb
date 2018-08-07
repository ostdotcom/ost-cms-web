class Web::SigninController < Web::BaseController

  layout "signin"

  skip_before_action :basic_auth
  before_action :set_page_meta_info

  def sign_in
    @query_params = request.query_parameters
  end


end
