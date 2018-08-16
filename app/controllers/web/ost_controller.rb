class Web::OstController < Web::BaseController

  layout "ost"

  skip_before_action :basic_auth
  before_action :get_user_response
  before_action :omniauth, except: [:sign_in]
  before_action :set_page_meta_info
  before_action :get_config, except:[:sign_in]

  def dashboard

  end

  def sign_in
    @query_params = request.query_parameters
  end


end
