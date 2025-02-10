class ChatsController < ApplicationController
    before_action :authenticate_user!

    def index
      chats = Chat.where("sender_id = ? OR receiver_id = ?", params[:user_id], params[:user_id])
      render json: chats, include: [:sender, :receiver]
    end
  
    # def create
    #   chat = Chat.find_or_create_by(sender_id: params[:sender_id], receiver_id: params[:receiver_id])
    #   render json: chat
    # end

    def create
        sender_id = params[:sender_id]
        receiver_id = params[:receiver_id]
        chat = Chat.find_by("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
                             sender_id, receiver_id, receiver_id, sender_id)
        chat ||= Chat.create(sender_id: sender_id, receiver_id: receiver_id)
      
        render json: chat
      end
      

    def chatted_people
       
        people = User.where(id: Chat.where("sender_id = ? OR receiver_id = ?", current_user.id, current_user.id)
                               .pluck(:sender_id, :receiver_id)
                               .flatten
                               .uniq
                               .reject { |id| id == current_user.id })
    
        render json: people
      end
    
  
    def show
      chat = Chat.find(params[:id])
      render json: chat, include: :messages
    end
  end
  