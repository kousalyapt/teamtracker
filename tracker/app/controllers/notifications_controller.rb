class NotificationsController < ApplicationController
    before_action :authenticate_user!

    def create
        @notification = Notification.new(notification_params)
        if @notification.save
          render json: @notification, status: :created
        else
          render json: { errors: @notification.errors.full_messages }, status: :unprocessable_entity
        end
    end
    
    def index
      @notifications = current_user.notifications.order(created_at: :desc)
      render json: @notifications
    end
  
    def mark_as_read
      @notification = current_user.notifications.find(params[:id])
      @notification.update(read: true)
      head :ok
    end

    def destroy
      @notification = current_user.notifications.find(params[:id])
      @notification.destroy
      head :no_content
    end

    private

    def notification_params
        params.require(:notification).permit(:user_id, :message, :read, :link)
    end
end
  