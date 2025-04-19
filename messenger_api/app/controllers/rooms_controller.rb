class RoomsController < ApplicationController
  before_action :authenticate_user!

  def index
    @rooms = Room.all 
    render json: @rooms
  end

  def new
    @room = Room.new
    render json: @room
  end

  def create
    # Build the room and assign the creator (current_user)
    @room = current_user.created_rooms.build(room_params)

    if @room.save
      # --- Automatically add the creator as a member ---
      @room.users << current_user unless @room.users.include?(current_user)

      render json: @room, status: :created
    else
      render json: @room.errors, status: :unprocessable_entity
    end
  end

  def show
    @room = Room.find(params[:id])
    #  # Add authorization check here - e.g., can current_user view this room?
      render json: @room
    end

  private

  def room_params
    params.require(:room).permit(:name, :description, :public)
  end
end
