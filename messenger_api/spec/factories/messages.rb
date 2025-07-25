FactoryBot.define do
  factory :message do
    body { Faker::Lorem.sentence(word_count: 5) }

    association :user
    association :room
  end
end