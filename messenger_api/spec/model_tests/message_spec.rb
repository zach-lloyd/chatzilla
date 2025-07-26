require "rails_helper"

RSpec.describe Message, type: :model do
  subject(:message) { build(:message) }

  describe "validations" do
    it "is valid with valid attributes" do
      expect(message).to be_valid
    end

    context "when validating message" do
      it "is invalid without a body" do
        message.body = nil
        expect(message).not_to be_valid
        expect(message.errors[:body]).to include(
          "is too short (minimum is 1 character)"
        )
      end

      it "is invalid if body is longer than 300 characters" do
        message.body = "a" * 301
        expect(message).not_to be_valid
        expect(message.errors[:body]).to include(
          "is too long (maximum is 300 characters)"
        )
      end
    end
  end
end