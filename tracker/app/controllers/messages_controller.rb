class MessagesController < ApplicationController
    def index
      messages = Message.where(chat_id: params[:chat_id])
      render json: messages
    end
  
    def create
      message = Message.create(chat_id: params[:chat_id], sender_id: params[:sender_id], content: params[:content])
      
      
      render json: message
    end
  end
  