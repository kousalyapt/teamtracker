class MessagesController < ApplicationController
  before_action :authenticate_user!
    def index
      @messages = Message.where(chat_id: params[:chat_id]).order(:id)
      render json: @messages
    end

    def unread_messages
      messages = Message.where(chat_id: params[:chat_id], read: false)
      render json: messages, status: :ok
    end    
  
    def create
      @message = Message.create(chat_id: params[:chat_id], sender_id: params[:sender_id], content: params[:content])
      @chat = Chat.find_by(id: params[:chat_id])
      ActionCable.server.broadcast(
      "chat_#{@chat.id}",
      {
        action: "create",
        chat_id: @chat.id,
        message: @message,
        sender_id: current_user.id,
        content: @message.content,
       
      }

    )
      
      
      render json: @message
    end

    def update
      @chat = Chat.find(params[:chat_id])
      @message = @chat.messages.find(params[:id])
      if @message.update(message_params)
        ActionCable.server.broadcast(
      "chat_#{@chat.id}",
      {
        action: "update",
        chat_id: @chat.id,
        message: @message,
        sender_id: current_user.id,
        content: @message.content,
       
      }
        )
        render json: @message, status: :ok
      else
        render json: { errors: @message.errors.full_messages }
      end
    end

    def destroy
      @chat = Chat.find(params[:chat_id])
      @message = @chat.messages.find(params[:id])
      @message_id = @message.id
      @message.destroy
      ActionCable.server.broadcast(
      "chat_#{@chat.id}",
      {
        action: "delete",
        chat_id: @chat.id,
        message_id: @message_id,
        sender_id: current_user.id
       
      }
      )

      head :no_content

    end

    def message_params
      params.require(:message).permit(:content)
    end
  end
  