class Membership < ApplicationRecord
  belongs_to :user
  belongs_to :room

  validates :user_id, 
            uniqueness: { 
              scope: :room_id, 
              message: "is already a member of this room" 
            }
end
