class AddPresenceToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :presence, :boolean, default: true, null: false
  end
end
