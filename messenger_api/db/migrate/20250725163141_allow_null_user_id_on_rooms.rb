class AllowNullUserIdOnRooms < ActiveRecord::Migration[8.0]
  def change
    change_column_null :rooms, :user_id, true
  end
end
