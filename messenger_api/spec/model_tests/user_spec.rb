require "rails_helper"

RSpec.describe User, type: :model do
  subject(:user) { build(:user) }

  describe "validations" do
    it "is valid with valid attributes" do
      expect(user).to be_valid
    end

    context "when validating username" do
      it "is invalid without a username" do
        user.username = nil
        expect(user).not_to be_valid
        expect(user.errors[:username]).to include("can't be blank")
      end

      it "is invalid if username is shorter than 3 characters" do
        user.username = "ab"
        expect(user).not_to be_valid
        expect(user.errors[:username]).to include(
          "is too short (minimum is 3 characters)"
        )
      end

      it "is invalid if username is longer than 30 characters" do
        user.username = "a" * 31
        expect(user).not_to be_valid
        expect(user.errors[:username]).to include(
          "is too long (maximum is 30 characters)"
        )
      end

      it "is invalid if username contains special characters" do
        user.username = "user-name!"
        expect(user).not_to be_valid
        expect(user.errors[:username]).to include(
          "can only contain letters, numbers, and underscores"
        )
      end

      it "is invalid if username is not unique (case-insensitive)" do
        create(:user, username: "testuser")
        new_user = build(:user, username: "TestUser")
        
        expect(new_user).not_to be_valid
        expect(new_user.errors[:username]).to include("has already been taken")
      end
    end
  end

  describe "associations" do
    let!(:user) { create(:user) }

    it "destroys associated memberships when destroyed" do
      create(:membership, user: user)
      expect { user.destroy }.to change(Membership, :count).by(-1)
    end

    it "destroys associated messages when destroyed" do
      create(:message, user: user)
      expect { user.destroy }.to change(Message, :count).by(-1)
    end

    it "nullifies user_id on created rooms when destroyed" do
      room = create(:room, creator: user)
      expect { user.destroy }.not_to change(Room, :count)
      expect(room.reload.user_id).to be_nil
    end
  end
end