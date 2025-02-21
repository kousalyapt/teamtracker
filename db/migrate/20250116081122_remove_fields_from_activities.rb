class RemoveFieldsFromActivities < ActiveRecord::Migration[8.0]
  def change
    remove_column :activities, :action, :string
    remove_column :activities, :record_type, :string
    remove_column :activities, :record_id, :integer
  end
end
