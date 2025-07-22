class RoomChannel < ApplicationCable::Channel
   # Called when a consumer subscribes to this channel for a specific room.
   def subscribed
    @room = Room.find(params[:room_id])
    # Create a unique stream for this specific room object.
    stream_for @room
  end

  # Called when a consumer unsubscribes.
  def unsubscribed
    stop_all_streams
  end
end
