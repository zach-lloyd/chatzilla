FactoryBot.define do
  factory :room do
    name { Faker::Team.name }

    association :creator, factory: :user
  end
end