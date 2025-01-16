class AddMessageToActivities < ActiveRecord::Migration[8.0]
  def change
    add_column :activities, :message, :string
  end
end
