class Message < ApplicationRecord
  belongs_to :chat
  belongs_to :sender, class_name: "User"

  validates :content, presence: true
  # after_create :broadcast_message

  # private

  # def broadcast_message
  #   ActionCable.server.broadcast(
  #     "chat_#{chat.id}",
  #     {
  #       chat_id: chat.id,
  #       sender_id: .id,
  #       content: message.content,
       
  #     }

  #   )
  # end
end
