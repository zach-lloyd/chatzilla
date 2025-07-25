FactoryBot.define do
  factory :membership do
    association :user
    association :room
  end
end