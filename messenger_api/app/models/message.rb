class Message < ApplicationRecord
  validates :body, length: { minimum: 1, maximum: 300 }

  belongs_to :user
  belongs_to :room
end
