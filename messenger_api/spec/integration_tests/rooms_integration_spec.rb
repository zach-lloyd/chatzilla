require "rails_helper"

RSpec.describe "Rooms API", type: :request do
  describe "GET /rooms" do
    it "returns 401 Unauthorized if the user is not signed in" do
      # as: :json is needed to avoid getting a 302 redirect request rather than
      # a 401 Unauthorized request.
      get "/rooms", as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 200 OK if the user is signed in" do
      user = create(:user)
      create_list(:room, 3) 

      sign_in user
      get "/rooms"

      expect(response).to have_http_status(:ok)
      
      json_response = JSON.parse(response.body)
      expect(json_response.length).to eq(3)
    end
  end

  describe "GET /rooms/:room_id" do
    it "returns 404 Not Found if room does not exist" do
      user = create(:user)

      sign_in user
      get "/rooms/99999"

      expect(response).to have_http_status(:not_found)
    end

    it "returns 200 OK if room exists" do
      user = create(:user)
      room = create(:room)

      sign_in user
      get "/rooms/#{room.id}"

      expect(response).to have_http_status(:ok)
    end
  end
end