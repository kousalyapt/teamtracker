class Activity < ApplicationRecord
  belongs_to :user
  validates :action, :record_type, :record_id, presence: true
end
