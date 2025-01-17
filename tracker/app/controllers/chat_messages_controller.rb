class ChatMessagesController < ApplicationController
    before_action :authenticate_user!
    before_action :set_project
  
    def index
      @chat_messages = @project.chat_messages.includes(:user).order(created_at: :asc)
      render json: @chat_messages, include: { user: { only: [:name] } }
    end
  
    def create
      @chat_message = @project.chat_messages.new(chat_message_params.merge(user: current_user))
      if @chat_message.save
        render json: @chat_message, include: { user: { only: [:name] } }, status: :created
      else
        render json: @chat_message.errors, status: :unprocessable_entity
      end
    end
  
    private
  
    def set_project
      @project = Project.find(params[:project_id])
    end
  
    def chat_message_params
      params.require(:chat_message).permit(:content)
    end
end
  
