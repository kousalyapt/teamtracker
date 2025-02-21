class AddProjectIdToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :project_id, :integer
  end
end
