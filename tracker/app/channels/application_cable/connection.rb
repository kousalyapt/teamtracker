module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      puts "Request params: #{request.params.inspect}"
      self.current_user = find_verified_user
      if current_user
       puts current_user.id
      else
        puts "Unauthorized connection attempt"
      end
      reject_unauthorized_connection unless current_user
    end

    private

    def find_verified_user
      token = request.params[:token]  # Get JWT token from URL
      token = token.split(" ").last if token && token.start_with?("Bearer")  # Remove 'Bearer ' if it exists
      logger.info "Received token: #{token}"
      begin
        decoded = JWT.decode(token, Rails.application.credentials.secret_key_base, true, algorithm: 'HS256')
        user = User.find_by(id: decoded[0]["sub"])
        logger.info "Verified User: #{user.inspect}"
        user
      rescue JWT::DecodeError => e
        logger.error "JWT Decode Error: #{e.message}"
        nil
      end
    end
  end
end
