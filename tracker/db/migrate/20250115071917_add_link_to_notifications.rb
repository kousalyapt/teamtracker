class AddLinkToNotifications < ActiveRecord::Migration[8.0]
  def change
    add_column :notifications, :link, :string
  end
end
