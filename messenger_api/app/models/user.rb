class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  
  validates :username, presence: true

  validates :username, uniqueness: { case_sensitive: false }

  validates :username, length: { minimum: 3, maximum: 30 }
  validates :username, format: { with: /\A[a-zA-Z0-9_]+\z/, message: "can only contain letters, numbers, and underscores" }

  # --- Creator Association ---
  # Renamed from :rooms to avoid conflict with the membership association below
  # Use dependent: :nullify so deleting a user doesn't delete their rooms, just removes the creator link
  has_many :created_rooms, class_name: 'Room', foreign_key: 'user_id', dependent: :nullify

  # --- Membership Associations ---
  has_many :memberships, dependent: :destroy # User's memberships
  has_many :rooms, through: :memberships    # Rooms the user is a member of
  has_many :messages, dependent: :destroy
end
