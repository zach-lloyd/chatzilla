require "rails_helper"

RSpec.describe Room, type: :model do
  subject(:room) { build(:room) }

  describe "validations" do
    it "is valid with valid attributes" do
      expect(room).to be_valid
    end

    context "when validating room" do
      it "is invalid without a name" do
        room.name = nil
        expect(room).not_to be_valid
        expect(room.errors[:name]).to include("can't be blank")
      end

      it "is invalid if name is shorter than 3 characters" do
        room.name = "ab"
        expect(room).not_to be_valid
        expect(room.errors[:name]).to include(
          "is too short (minimum is 3 characters)"
        )
      end

      it "is invalid if name is longer than 30 characters" do
        room.name = "a" * 31
        expect(room).not_to be_valid
        expect(room.errors[:name]).to include(
          "is too long (maximum is 30 characters)"
        )
      end

      it "is invalid if name is not unique (case-insensitive)" do
        create(:room, name: "testroom")
        new_room = build(:room, name: "TestRoom")
        
        expect(new_room).not_to be_valid
        expect(new_room.errors[:name]).to include("has already been taken")
      end

      it "is invalid if description is longer than 140 characters" do
        room.description = "a" * 141
        expect(room).not_to be_valid
        expect(room.errors[:description]).to include(
          "is too long (maximum is 140 characters)"
        )
      end
    end
  end
end