class MessagesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_room # Helper method to find the room

  def create
    # --- Authorization Check ---
    # Check if the currently logged-in user is a member of the room
    unless @room.users.include?(current_user)
      # If not a member, render the error response and stop execution
      render json: { error: 'You must be a member to post messages in this room.' }, status: :forbidden
      return # Stop further processing
    end
    # --- End Authorization Check ---

    # If authorization passed, proceed with creating the message
    @message = @room.messages.build(message_params.merge(user: current_user))

    if @message.save
      render json: @message, status: :created
    else
      render json: @message.errors, status: :unprocessable_entity
    end
  end

  private
  
  def set_room
    @room = Room.find(params[:room_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Room not found' }, status: :not_found
  end

  def message_params
    params.require(:message).permit(:body)
  end
end
