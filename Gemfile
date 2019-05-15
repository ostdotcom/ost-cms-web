source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end


# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '5.2.2.1'
# Rake
gem 'rake', '12.3.1'
# Use SCSS for stylesheets
gem 'sass-rails', '5.0.7'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '4.1.9'
# YUI compressor
gem 'yui-compressor', '0.12.0'
# Json formatter
gem 'oj', '3.3.8'
# Sanitize params
gem 'sanitize', '4.5.0'
# Exception notifier
gem 'exception_notification', '4.2.1'
# hkdf for sha256
gem 'hkdf', '0.2.0'

gem 'listen', '3.1.5'



# For identifying browser & device type of devices sending requests
#gem 'browser', '~> 1.1'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  # # Adds support for Capybara system testing and selenium driver
  # gem 'capybara', '~> 2.13'
  # gem 'selenium-webdriver'
  gem 'puma', '~> 3.7'
  # gem 'pry'
  # gem 'web-console', '>= 3.3.0'
  gem 'letter_opener'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
