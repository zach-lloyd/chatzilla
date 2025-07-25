FactoryBot.define do
  factory :user do
    # Use sequence to ensure usernames and emails are always unique.
    sequence(:username) { |n| "#{Faker::Internet.username(specifier: 3..30, separators: %w(_))}#{n}" }
    sequence(:email) { |n| "person#{n}@example.com" }
    password { "password123" }
    password_confirmation { "password123" }
  end
end