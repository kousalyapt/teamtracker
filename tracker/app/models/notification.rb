class Notification < ApplicationRecord
  belongs_to :user
  validates :message, presence: true
  belongs_to :task, optional: true 
end
