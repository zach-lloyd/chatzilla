class Room < ApplicationRecord  
  # --- Creator Association ---
  # Renamed from :user to :creator to be more explicit and avoid conflicts
  belongs_to :creator, class_name: 'User', foreign_key: 'user_id'

  # --- Membership Associations ---
  has_many :memberships, dependent: :destroy # Room's memberships
  has_many :users, through: :memberships    # Users who are members of the room
  has_many :messages, dependent: :destroy
  
  validates :name, presence: true
end
