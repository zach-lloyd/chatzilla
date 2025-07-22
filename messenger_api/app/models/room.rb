class Room < ApplicationRecord  
  belongs_to :creator, class_name: "User", foreign_key: "user_id"

  has_many :memberships, dependent: :destroy 
  has_many :users, through: :memberships    
  has_many :messages, dependent: :destroy
  
  validates :name, presence: true
end
