class Web::OstController < Web::BaseController

  layout "ost"

  skip_before_action :basic_auth
  before_action :omniauth, except: [:sign_in]
  before_action :set_page_meta_info

  def index

  end

  def sign_in

  end

end
