class Web::OstController < Web::BaseController

  layout "ost"

  skip_before_action :basic_auth
  before_action :get_user_response
  before_action :omniauth, except: [:sign_in, :not_whitelisted]
  before_action :set_page_meta_info

  def index

  end

  def sign_in
    @query_params = request.query_parameters
    puts "Query params"
    puts @query_params

  end


end
