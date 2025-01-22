class AddTaskAndLinkToActivities < ActiveRecord::Migration[8.0]
  def change
    add_reference :activities, :task, foreign_key: true
    add_column :activities, :link, :string
  end
end
