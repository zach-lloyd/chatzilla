class AddPublicToRooms < ActiveRecord::Migration[8.0]
  def change
    add_column :rooms, :public, :boolean
  end
end
