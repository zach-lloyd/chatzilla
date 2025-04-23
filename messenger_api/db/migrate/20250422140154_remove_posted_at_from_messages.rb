class RemovePostedAtFromMessages < ActiveRecord::Migration[8.0]
  def change
    remove_column :messages, :posted_at, :datetime
  end
end
