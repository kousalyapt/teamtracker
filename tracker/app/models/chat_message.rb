class ChatMessage < ApplicationRecord
  belongs_to :project
  belongs_to :user
  after_create :broadcast_chat

  private

  def broadcast_chat
    ActionCable.server.broadcast(
      "team_wall_#{project.id}",
      { chat: self.as_json(include: :user) } 
    )
  end
end
