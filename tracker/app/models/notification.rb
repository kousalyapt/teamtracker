class Notification < ApplicationRecord
  belongs_to :user
  validates :message, presence: true
  belongs_to :task, optional: true 

  after_create :broadcast_notification
  private

  def broadcast_notification
    puts "hello all"
    ActionCable.server.broadcast(
      "notifications_#{user.id}",
      { notification: self.as_json(include: :task) }  # Send the full notification object
    )
  end
  
end
