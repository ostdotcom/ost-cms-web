class Web::SigninController < Web::BaseController

  layout "signin"

  skip_before_action :get_user_details

  # Login/Signup page
  #
  def sign_in
  end

  # Temporary page while doing google auth to
  # remove the google as referer to forward cookies
  #
  def goto_dashboard
    render html: '<html><head><script>window.location="/dashboard"</script></head></html>'.html_safe
  end

end
