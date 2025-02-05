class Comment < ApplicationRecord
  belongs_to :task
  belongs_to :user

  validates :content, presence: true
  after_create :broadcast_comment

  private

  def broadcast_comment
    ActionCable.server.broadcast(
      "comments_#{task.id}",
      { comment: self.as_json(include: :user) } 
    )
  end

  
end
