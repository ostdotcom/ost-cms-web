Rails.application.routes.draw do

  scope '', controller: 'web/ost' do
    get '/dashboard' => :index
    get '/' => :sign_in, as: 'sign_in'
  end

  # Route not found handler. Should be the last entry here
  match '*permalink', to: 'application#not_found', via: :all

end