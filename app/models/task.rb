class Task < ApplicationRecord
  belongs_to :project
  belongs_to :assigned_to, class_name: "User", optional: true
  belongs_to :creator, class_name: "User", foreign_key: "created_by", optional: true
  belongs_to :label, optional: true
  validates :title, presence: true
  validates :estimated_time, presence: true
end
