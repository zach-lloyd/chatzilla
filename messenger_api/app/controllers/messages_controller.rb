class MessagesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_room # Helper method to find the room.

  def create
    # Check if the currently logged-in user is a member of the room; if they are
    # not, they can't post messages to the room.
    unless @room.users.include?(current_user)
      render json: { error: "You must be a member to post messages in this room." }, 
             status: :forbidden
      return 
    end

    # Check the message for profanity using Neutrino.
    is_profane = ProfanityChecker.new(message_params[:body]).profane?
    
    if is_profane
      render json: { error: "Your message contains inappropriate language and was not sent." },
             status: :unprocessable_entity
      return
    end

    # If authorization passed, proceed with creating the message.
    @message = @room.messages.build(message_params.merge(user: current_user))

    if @message.save
      # Broadcast the message to the Room Channel.
      RoomChannel.broadcast_to(
        @room,
        { id: @message.id,
          body: @message.body,
          created_at: @message.created_at, 
          user: { id: @message.user.id, username: @message.user.username } 
        }
      )
      
      render json: @message, status: :created
    else
      render json: @message.errors, status: :unprocessable_entity
    end
  end

  private
  
  def set_room
    @room = Room.find(params[:room_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Room not found" }, status: :not_found
  end

  def message_params
    params.require(:message).permit(:body)
  end
end
