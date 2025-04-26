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

      render json: @room, include: { users: { only: [:id, :username] } }, status: :created
    else
      render json: @room.errors, status: :unprocessable_entity
    end
  end

  # GET /rooms/:id
  def show
    begin
      # Use includes to eager-load associated users (members) to avoid N+1 queries
      @room = Room.includes(:users, messages: :user).find(params[:id])

      # --- Authorization Check ---
      # Allow if room is public OR if user is a member
      #unless @room.public? || @room.users.include?(current_user)
       # render json: { error: 'You do not have permission to view this room.' }, status: :forbidden
        #return # Stop execution
      #end
      # ---

      render json: @room, include: {
        users: { # Members of the room
          only: [:id, :username]
        },
        messages: { # Messages in the room
          # You might want to order messages, e.g., by creation date
          # This requires adjusting the association or adding an order scope
          include: {
            user: { # Author of the message
              only: [:id, :username]
            }
          }
          # Optionally limit message fields:
          # only: [:id, :body, :created_at, :user_id] # user_id might be useful too
        }
      }

    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Room not found' }, status: :not_found
    end
  end

  private

  def room_params
    params.require(:room).permit(:name, :description, :public)
  end
end
