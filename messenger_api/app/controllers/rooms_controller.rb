class RoomsController < ApplicationController
  before_action :authenticate_user!

  def index
    @rooms = Room.all 
    render json: @rooms
  end

  private

  def room_params
    params.require(:room).permit(:name, :description, :public)
  end
end
