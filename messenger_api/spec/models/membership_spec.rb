require "rails_helper"

RSpec.describe Membership, type: :model do
  subject(:membership) { build(:membership) }

  describe "validations" do
    it "is valid with valid attributes" do
      expect(membership).to be_valid
    end

    it "is invalid if user is already a member of the room" do
      new_user = build(:user, username: "testuser")
      new_room = build(:room, name: "testroom")
      create(:membership, user: new_user, room: new_room)
      new_membership = build(:membership, user: new_user, room: new_room)
      expect(new_membership).not_to be_valid
      expect(new_membership.errors[:user_id]).to include(
        "is already a member of this room"
      )
    end
  end
end
