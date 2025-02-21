class Chat < ApplicationRecord
    belongs_to :sender, class_name: "User"
  belongs_to :receiver, class_name: "User"
  has_many :messages, dependent: :destroy

  validates :sender_id, uniqueness: { scope: :receiver_id }

end
