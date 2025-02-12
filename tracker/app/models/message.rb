class Message < ApplicationRecord
  belongs_to :chat
  belongs_to :sender, class_name: "User"

  validates :content, presence: true
  after_create :broadcast_chat

  private

  def broadcast_chat
    ActionCable.server.broadcast(
      "chat_#{chat.id}",
      { chat: self.as_json() } 
    )
  end
end
