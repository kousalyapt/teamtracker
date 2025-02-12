class MessagesController < ApplicationController
    def index
      @messages = Message.where(chat_id: params[:chat_id])
      render json: @messages
    end
  
    def create
      @message = Message.create(chat_id: params[:chat_id], sender_id: params[:sender_id], content: params[:content])
      
      
      render json: @message
    end

    def update
      @chat = Chat.find(params[:chat_id])
      @message = @chat.messages.find(params[:id])
      if @message.update(message_params)
        render json: @message, status: :ok
      else
        render json: { errors: @message.errors.full_messages }
      end
    end

    def destroy
      @chat = Chat.find(params[:chat_id])
      @message = @chat.messages.find(params[:id])
      @message.destroy
      head :no_content

    end

    def message_params
      params.require(:message).permit(:content)
    end
  end
  