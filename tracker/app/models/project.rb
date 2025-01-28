class Project < ApplicationRecord
  belongs_to :user
  has_many :project_members, dependent: :destroy
  has_many :members, through: :project_members, source: :user
  has_many :tasks, dependent: :destroy
  accepts_nested_attributes_for :members, allow_destroy: true
  has_many :chat_messages, dependent: :destroy
  has_many :users

  
end
