class RoomChannel < ApplicationCable::Channel
   # Called when a consumer subscribes to this channel for a specific room
   def subscribed
    # Params passed from the frontend subscription
    @room = Room.find(params[:room_id])

    # --- Authorization Check ---
    # Ensure current_user (identified in connection.rb) can access this room
    #unless @room.users.include?(current_user) || @room.public?
     # reject # Reject the subscription if user is not authorized
      #return
    #end
    # ---

    # Create a unique stream for this specific room object
    stream_for @room
  end

  # Called when a consumer unsubscribes
  def unsubscribed
    # Any cleanup needed when user leaves the room channel
    stop_all_streams
  end
end
