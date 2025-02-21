class AddDeletedForUserIdToChats < ActiveRecord::Migration[8.0]
  def change
    add_column :chats, :deleted_for_user_id, :integer
  end
end
