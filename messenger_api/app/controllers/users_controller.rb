class UsersController < ApplicationController
  before_action :authenticate_user!

  def index
    @users = User.all

    users_data = @users.map do |user|
      {
        username: user.username
      }
    end

    render json: users_data
  end
end