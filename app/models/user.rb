class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self
  has_many :projects, dependent: :nullify
  has_many :project_members, dependent: :destroy
  has_many :member_projects, through: :project_members, source: :project
  has_many :tasks, foreign_key: :assigned_to_id, dependent: :nullify 
  has_many :activities, dependent: :destroy
  has_many :notifications, dependent: :destroy
  belongs_to :project, optional: true 
  has_many :chat_messages, dependent: :destroy
  has_many :sent_chats, class_name: "Chat", foreign_key: "sender_id"
  has_many :received_chats, class_name: "Chat", foreign_key: "receiver_id"
  has_many :messages, foreign_key: "sender_id"


  def project_ids
    member_projects.pluck(:id)
  end
end
