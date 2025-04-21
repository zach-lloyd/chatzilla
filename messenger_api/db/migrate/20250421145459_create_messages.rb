class CreateMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :messages do |t|
      t.string :body
      t.datetime :posted_at

      t.timestamps
    end
  end
end
