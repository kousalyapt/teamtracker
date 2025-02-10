class AddProjectIdToActivities < ActiveRecord::Migration[8.0]
  def change
    add_column :activities, :project_id, :integer
    add_foreign_key :activities, :projects 
  end
end
