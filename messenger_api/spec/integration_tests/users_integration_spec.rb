require "rails_helper"

RSpec.describe "Users API", type: :request do
  describe "POST /users" do
    it "returns 422 Unprocessable Entity if username is not unique (case insensitive)" do
      create(:user, username: "TestUser")

      user_params = {
        user: {
          email: "test@gmail.com",
          username: "testuser",
          password: "password",
          password_confirmation: "password"
        }
      }

      expect {
        post "/users", params: user_params, as: :json
      }.to change(User, :count).by(0)

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns 201 Created if user is successfully created" do
      user_params = {
        user: {
          email: "test@gmail.com",
          username: "testuser",
          password: "password",
          password_confirmation: "password"
        }
      }

      expect {
        post "/users", params: user_params, as: :json
      }.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)
    end
  end
end
