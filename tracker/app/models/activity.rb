class Activity < ApplicationRecord
  
  belongs_to :user
  belongs_to :task, optional: true
 
  validates :message, presence: true
end
