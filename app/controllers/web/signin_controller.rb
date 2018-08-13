class Web::SigninController < Web::BaseController

  layout "signin"

  skip_before_action :basic_auth
  before_action :set_page_meta_info, except: [:goto_dashboard]

  def sign_in
    @query_params = request.query_parameters
  end

  def goto_dashboard
    render html: '<html><head><script>window.location="/dashboard"</script></head></html>'.html_safe
  end


end
