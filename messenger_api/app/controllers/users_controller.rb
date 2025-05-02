class UsersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user, only: [:toggle_presence, :show]

  def index
    @users = User.all

    users_data = @users.map do |user|
      {
        username: user.username,
        presence: user.presence,
        id: user.id
      }
    end

    render json: users_data
  end

  def show
    # eager-load rooms to avoid N+1
    @user = User.includes(:rooms).find(params[:id])
    render json: @user.as_json(
      only:   [:id, :username, :presence],
      include: {
        rooms: { only: [:id, :name] }
      }
    )
  end

  def toggle_presence
    @user.toggle!(:presence)          # flips true⇄false and saves

    # Keep Redis set in sync:
    if @user.presence?
      $redis.sadd(PresenceChannel::ONLINE_SET_KEY, @user.id)
    else
      $redis.srem(PresenceChannel::ONLINE_SET_KEY, @user.id)
    end

    # Re-broadcast the updated list
    PresenceChannel.broadcast_online_users

    render json: { presence: @user.presence }
  end

  private

    def set_user
      @user = User.find(params[:id])
    end
end