Rails.application.routes.draw do

  scope '', controller: 'web/ost', :format => false do
    get '/dashboard/:name' => :entity
    get '/dashboard' => :dashboard
  end

  scope '', controller: 'web/signin', :format => false do
    get '/' => :sign_in, as: 'sign_in'
    get '/go-to-dashboard' => :goto_dashboard, as: 'goto_dashboard'
  end

  # Route not found handler. Should be the last entry here
  match '*permalink', to: 'application#not_found', via: :all

end