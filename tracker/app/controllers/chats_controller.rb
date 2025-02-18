class ChatsController < ApplicationController
    before_action :authenticate_user!

    def index
      chats = Chat.where("(sender_id = ? OR receiver_id = ?) AND (deleted_for_user_id IS NULL OR deleted_for_user_id != ?)",
                         params[:user_id], params[:user_id], params[:user_id])
      render json: chats, include: [:sender, :receiver]
    end
  

    def create
        sender_id = params[:sender_id]
        receiver_id = params[:receiver_id]
        chat = Chat.find_by("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
                             sender_id, receiver_id, receiver_id, sender_id)
        chat ||= Chat.create(sender_id: sender_id, receiver_id: receiver_id)
      
        render json: chat
      end
      

    def chatted_people
      chat_partners = Chat.where("(sender_id = ? OR receiver_id = ?) AND (deleted_for_user_id IS NULL OR deleted_for_user_id != ?)", current_user.id, current_user.id, current_user.id)
                          .pluck(:sender_id, :receiver_id)
                          .flatten
                          .uniq
                          .reject { |id| id == current_user.id }
    
      people_with_unread_count = User.where(id: chat_partners).map do |user|
        unread_count = Message.where(chat_id: Chat.where("sender_id = ? AND receiver_id = ? OR sender_id = ? AND receiver_id = ?", 
                                                         current_user.id, user.id, user.id, current_user.id)
                                         .pluck(:id),
                                  read: false)
                                  .where.not(sender_id: current_user.id) 
                               .count
    
        {
          id: user.id,
          name: user.name,  # Assuming User model has `name`
          email: user.email,  # Add any other fields needed
          unread_messages: unread_count
        }
      end
    
      render json: people_with_unread_count
    end
    
    def mark_as_read
      chat = Chat.find(params[:chat_id])
  
      # Only mark messages as read that were sent to the current user
      messages = chat.messages.where.not(sender_id: current_user.id, read: false)
  
      if messages.update_all(read: true)
        render json: { success: true, message: "Messages marked as read" }
      else
        render json: { success: false, error: "Failed to mark messages as read" }, status: :unprocessable_entity
      end
    end

    def destroy
      chat = Chat.find(params[:id])
    
      if chat.deleted_for_user_id.nil?
        chat.update(deleted_for_user_id: current_user.id)
      elsif chat.deleted_for_user_id != current_user.id
        chat.destroy  # Permanently delete if both users delete
      end
    
      head :no_content
    end
    
    
  
    def show
      chat = Chat.find(params[:id])
      render json: chat, include: :messages
    end
  end
  