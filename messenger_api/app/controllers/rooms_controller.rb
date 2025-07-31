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
    name_is_profane = ProfanityChecker.new(room_params[:name]).profane?
    description_is_profane = ProfanityChecker.new(room_params[:description]).profane?

    if name_is_profane || description_is_profane
      render json: { 
        error: "Your room name or description contains inappropriate language " \
               "and was not created." 
      },
             status: :unprocessable_entity
      return
    end

    # Build the room and assign the creator (current_user).
    @room = current_user.created_rooms.build(room_params)

    if @room.save
      # Automatically add the creator as a member.
      @room.users << current_user unless @room.users.include?(current_user)

      render json: @room, 
             include: { users: { only: [:id, :username] } }, 
             status: :created
    else
      render json: @room.errors, status: :unprocessable_entity
    end
  end

  # GET /rooms/:id
  def show
    begin
      # Use includes to eager-load associated users (members) to avoid N + 1 
      # queries.
      @room = Room.includes(:users, messages: :user).find(params[:id])

      render json: @room, include: {
        users: {
          only: [:id, :username]
        },
        messages: { 
          include: {
            user: { 
              only: [:id, :username]
            }
          }
        }
      }

    rescue ActiveRecord::RecordNotFound
      render json: { error: "Room not found" }, status: :not_found
    end
  end

  private

  def room_params
    params.require(:room).permit(:name, :description, :public)
  end
end
