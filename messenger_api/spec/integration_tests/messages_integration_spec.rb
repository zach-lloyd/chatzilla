require "rails_helper"

RSpec.describe "Messages API", type: :request do
  describe "POST /rooms/:room_id/messages" do
    it "creates a new message if message doesn't trip content filter" do
      user = create(:user)
      room = create(:room)

      # Make the user a member of the room first.
      create(:membership, user: user, room: room) 

      sign_in(user, scope: :user)

      message_params = {
        message: {
          body: "Hello from the test suite!"
        }
      }

      # Check that the Message count increases by 1 after the request.
      expect {
        post "/rooms/#{room.id}/messages", params: message_params, as: :json
      }.to change(Message, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)["body"]).to eq(
        "Hello from the test suite!"
      )
    end

    it "does not create a message when it contains profanity" do
      user = create(:user)
      room = create(:room)
      create(:membership, user: user, room: room)

      sign_in(user, scope: :user)

      # Use RSpec's mocking to force ProfanityChecker to return true to isolate
      # the controller test from the checker's actual logic.
      allow_any_instance_of(ProfanityChecker).to receive(:profane?).and_return(true)

      # Because the above code forces ProfanityChecker to return true, the actual
      # content of the message doesn't matter.
      message_params = {
        message: {
          body: "a supposedly profane message" 
        }
      }

      expect {
        post "/rooms/#{room.id}/messages", params: message_params, as: :json
      }.not_to change(Message, :count)

      expect(response).to have_http_status(:unprocessable_entity)

      json_response = JSON.parse(response.body)
      expect(json_response["error"]).to eq(
        "Your message contains inappropriate language and was not sent."
      )
    end
  end
end