class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  
  validates :username, presence: true

  validates :username, uniqueness: { case_sensitive: false }

  validates :username, length: { minimum: 3, maximum: 30 }
  validates :username, format: { 
    with: /\A[a-zA-Z0-9_]+\z/, 
    message: "can only contain letters, numbers, and underscores" 
  }

  # Use dependent: :nullify so deleting a user doesn't delete their rooms, 
  # just removes the creator link.
  has_many :created_rooms, 
           class_name: "Room", 
           foreign_key: "user_id", 
           dependent: :nullify

  has_many :memberships, dependent: :destroy 
  has_many :rooms, through: :memberships    
  has_many :messages, dependent: :destroy
end
