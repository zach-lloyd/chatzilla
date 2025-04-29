class PresenceChannel < ApplicationCable::Channel
  ONLINE_SET_KEY = "users:online".freeze

  def subscribed
    # Add this user’s ID to the Redis set
    $redis.sadd(ONLINE_SET_KEY, current_user.id)

    # Stream from a single “presence” broadcast stream
    stream_from "presence"

    # Push an updated list to everyone
    broadcast_online_users
  end

  def unsubscribed
    # Remove the user’s ID when they disconnect
    $redis.srem(ONLINE_SET_KEY, current_user.id)
    broadcast_online_users
  end

  private

  def broadcast_online_users
    # Fetch all IDs as integers
    online_ids = $redis.smembers(ONLINE_SET_KEY).map(&:to_i)

    # Broadcast a simple payload
    ActionCable.server.broadcast(
      "presence",
      { online_user_ids: online_ids }
    )
  end
end