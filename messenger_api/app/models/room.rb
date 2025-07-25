class Room < ApplicationRecord  
  belongs_to :creator, class_name: "User", foreign_key: "user_id"

  validates :name, presence: true
  validates :name, uniqueness: { case_sensitive: false }
  validates :name, length: { minimum: 3, maximum: 30 }

  validates :description, length: { maximum: 140 }

  has_many :memberships, dependent: :destroy 
  has_many :users, through: :memberships    
  has_many :messages, dependent: :destroy
end
