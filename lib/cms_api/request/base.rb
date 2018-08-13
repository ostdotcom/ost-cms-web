module CmsApi
  module Request
    class Base

      include Util::ResultHelper

      require 'net/http'
      require 'cgi'

      # Initialize
      #
      # * Author: Aman
      # * Date: 12/10/2017
      # * Reviewed By: Sunil
      #
      # @param [String] host (mandatory) - host url request
      # @param [Hash] cookies (optional) - cookies that need to be sent to API
      # @param [Hash] headers (optional) - headers that need to be sent to API
      #
      # @return [CmsApi::Request::Base] returns an object of CmsApi::Request::Base class
      #
      def initialize(host, cookies, headers)
        @host = host
        @cookies = cookies
        @headers = headers
        @request_class = nil
        @service_base_route = nil
        @api_url = nil
      end

      private

      # Get request
      #
      # * Author: Aman
      # * Date: 12/10/2017
      # * Reviewed By: Sunil
      #
      # @param [String] api_route (mandatory) - API route
      # @param [Hash] url_params_hash (optional) - API params
      #
      # @return [Result::Base] returns an object of Result::Base class
      #
      def get(api_route, url_params_hash = {})
        @request_class = Net::HTTP::Get
        set_api_url(api_route, url_params_hash)
        send
      end

      protected

      # Generate service URL with data
      #
      # * Author: Aman
      # * Date: 12/10/2017
      # * Reviewed By: Sunil
      #
      # @return [String] returns API URL
      #
      def set_api_url(api_route, url_params_hash)
        @api_url = base_url + @service_base_route.to_s + api_route + generate_api_parameters(url_params_hash)
      end

      # Generate API parameters
      #
      # * Author: Aman
      # * Date: 18/04/2017
      # * Reviewed By: Sunil
      #
      # @return [String] returns API Parameters
      #
      def generate_api_parameters(url_params_hash)
        url_params_hash.present? ? ('?' + url_params_hash.to_query) : ''
      end

      # Base kyc API URL for Admin Apis
      #
      # * Author: Aman
      # * Date: 25/01/2018
      # * Reviewed By:
      #
      # @return [String] returns BASE API URL
      #
      def base_url
        Rails.env.development? ? "#{@host}/api/" : "#{@host}/api/"
      end

      # make API Request
      #
      # * Author: Aman
      # * Date: 12/10/2017
      # * Reviewed By: Sunil
      #
      # @return [Result::Base] returns an object of Result::Base class
      #
      def send
        uri = URI(@api_url)
        http = Net::HTTP.new(uri.host, uri.port)
       # unless Rails.env.development?
        http.use_ssl = true
        http.verify_mode = OpenSSL::SSL::VERIFY_NONE
        #end
        http.read_timeout = GlobalConstant::Base.cms_api['read_timeout']
        http.open_timeout = GlobalConstant::Base.cms_api['open_timeout']
        req_obj = get_request_obj(uri.request_uri)

        http_response, e = nil, nil
        begin
          http_response = http.request(req_obj)
          set_api_response_cookie(http_response)
          parse_api_response(http_response)
        rescue Net::ReadTimeout, Net::OpenTimeout => e
          # Timeouts
          exception_with_internal_code(e, 'sta_timeout', 'simple token api timeout', GlobalConstant::ErrorCode.internal_server_error, debug_data)
        rescue Exception => e
          # Exceptions
          exception_with_internal_code(e, 'sta_exception', 'simple token api exception', GlobalConstant::ErrorCode.internal_server_error, debug_data)
        end

      end

      # Get HTTP Request Object
      #
      # * Author: Aman
      # * Date: 12/10/2017
      # * Reviewed By: Sunil
      #
      # @param [String] request_uri (mandatory) - API route
      #
      # @return [Net::HTTP::Get or Net::HTTP::POST] return request object with headers and cookies
      #
      def get_request_obj(request_uri)
        req_obj = @request_class.new(request_uri)

        # Forward cookies
        req_obj['Cookie'] = @cookies.map { |k, v| "#{k}=#{CGI.escape v.to_s}" }.join('; ') if @cookies.present?


        # Forward headers
        @headers.each do |h, v|
          req_obj[h] = v
        end if @headers.present?

        req_obj
      end

      # Handle API set cookies
      #
      # * Author: Aman
      # * Date: 12/10/2017
      # * Reviewed By: Sunil
      #
      # @param [HTTP response object] http_response (mandatory) - API response object
      #
      # Sets @cookies
      #
      def set_api_response_cookie(http_response)
        all_set_cookies = http_response.get_fields('set-cookie')
        return if all_set_cookies.blank?

        new_api_cookies = {}
        all_set_cookies.each do |api_cookie|
          api_cookie_elements = api_cookie.split("; ")
          cookie_name = ''
          api_cookie_elements.each_with_index do |c_element, i|
            c_sub_element = c_element.split('=', 2)
            c_sub_element_key = CGI::unescape(c_sub_element[0])
            c_sub_element_value = CGI::unescape(c_sub_element[1]) if c_sub_element[1].present?
            # Zeroth element is cookie name and value
            if i == 0
              cookie_name = c_sub_element_key
              new_api_cookies[cookie_name] = {value: c_sub_element_value}
            elsif c_sub_element_key == "expires"
              new_api_cookies[cookie_name][c_sub_element_key.to_sym] = Time.zone.parse(c_sub_element_value)
            elsif c_sub_element_key == "domain"
              new_api_cookies[cookie_name][c_sub_element_key.to_sym] = c_sub_element_value #Rails.env.development? ? :all : c_sub_element_value
            elsif c_sub_element_key == "secure"
              new_api_cookies[cookie_name][c_sub_element_key.to_sym] = true
            elsif c_sub_element_key == "HttpOnly"
              new_api_cookies[cookie_name][:http_only] = true
            elsif c_sub_element_key == "SameSite"
              new_api_cookies[cookie_name][:same_site] = c_sub_element_value
            else
              new_api_cookies[cookie_name][c_sub_element_key.to_sym] = c_sub_element_value
            end

          end
        end

        @cookies[GlobalConstant::Cookie.new_api_cookie_key.to_sym] = new_api_cookies
      end

      # Parse API response
      #
      # * Author: Aman
      # * Date: 12/10/2017
      # * Reviewed By: Sunil
      #
      # @return [Result::Base] returns an object of Result::Base class
      #
      def parse_api_response(http_response)
        response_data = Oj.load(http_response.body, mode: :strict) rescue {}
        case http_response.class.name
          when 'Net::HTTPOK'
            if response_data['success']
              # Success
              success_with_data(response_data['data'])
            else
              # API Error
              Rails.logger.info("=*=Simple-Token-API-ERROR=*= #{response_data.inspect}")
              error_with_internal_code(response_data['err']['code'], 'simple token api error', GlobalConstant::ErrorCode.internal_server_error, {}, response_data['err']['error_data'], response_data['err']['display_text'])
            end
          when "Net::HTTPUnauthorized"
            # 401
            Rails.logger.info("=*=Simple-Token-API-ERROR=*= #{response_data.inspect}")
            error_with_internal_code('simple_token_api_redirect', 'simple token api redirect', GlobalConstant::ErrorCode.unauthorized_access, {}, {}, response_data['err']['display_text'])
          else
            # HTTP error status code (500, 504...)
            exception_with_internal_code(Exception.new("Simple Token API STATUS CODE #{http_response.code.to_i}"), 'simple_token_api_exception', 'simple_token api exception', GlobalConstant::ErrorCode.internal_server_error, debug_data)
        end
      end

      # Debug data for exception emails
      #
      # * Author: Aman
      # * Date: 12/10/2017
      # * Reviewed By: Sunil
      #
      # @return [Hash] returns an hash of critical information for debugging
      #
      def debug_data
        {
            headers: @headers,
            api_url: @api_url
        }
      end

    end
  end
end