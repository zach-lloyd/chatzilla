require "rails_helper"

RSpec.describe "Memberships API", type: :request do
  describe "POST /rooms/:room_id/membership" do
    it "creates a new membership when the user joins a room" do
      user = create(:user)
      room = create(:room)

      sign_in(user, scope: :user)

      membership_params = {
        membership: {
          user_id: user.id,
          room_id: room.id
        }
      }

      expect {
        post "/rooms/#{room.id}/membership", params: membership_params, as: :json
      }.to change(Membership, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it "deletes membership when the user leaves a room" do
      user = create(:user)
      room = create(:room)

      create(:membership, user: user, room: room) 

      sign_in(user, scope: :user)

      expect {
        delete "/rooms/#{room.id}/membership", as: :json
      }.to change(Membership, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
