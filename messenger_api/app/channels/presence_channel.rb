class PresenceChannel < ApplicationCable::Channel
  ONLINE_SET_KEY = "users:online".freeze

  def self.broadcast_online_users
    # Fetch all IDs of users that are online as integers.
    online_ids = $redis.smembers(ONLINE_SET_KEY).map(&:to_i)
    # Fetch all IDs of users that are online and do not have their presence 
    # hidden as integers.
    visible_ids = User.where(id: online_ids, presence: true).pluck(:id)

    ActionCable.server.broadcast(
      "presence",
      { online_user_ids: visible_ids }
    )
  end

  def subscribed
    if current_user.presence?
      # Ensure user shows up as online upon initial sign-in.
      added = $redis.sadd(ONLINE_SET_KEY, current_user.id)
      Rails.logger.debug "[PresenceChannel] → Redis SADD returned=#{added}"
    else
      Rails.logger.debug "[PresenceChannel] → skipping SADD (opted out)"
    end

    # Stream from a single “presence” broadcast stream
    stream_from "presence"

    # Push an updated list to everyone
    self.class.broadcast_online_users
  end

  def unsubscribed
    # Remove the user’s ID when they disconnect
    $redis.srem(ONLINE_SET_KEY, current_user.id)    
    self.class.broadcast_online_users
  end
end