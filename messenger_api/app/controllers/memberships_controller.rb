class MembershipsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_room          # Find the room based on :room_id

  def create
    @membership = current_user.memberships.build(membership_params)

    if @membership.save
      render json: @membership, status: :created
    else
      render json: @membership.errors, status: :unprocessable_entity
    end
  end

  def destroy
    # Find the specific membership record linking the current_user to this @room
    @membership = current_user.memberships.find_by(room: @room)

    if @membership
      # Attempt to destroy the membership
      if @membership.destroy
        # Success: Respond with 204 No Content (standard for successful DELETE)
        head :no_content
      else
        # Unlikely for destroy, but handle potential errors
        render json: { error: "Could not leave the room at this time." }, status: :unprocessable_entity
      end
    else
      # If no membership found, the user wasn't a member anyway.
      render json: { error: "You are not currently a member of this room." }, status: :not_found 
    end
  end

  private

  def membership_params
    params.require(:membership).permit(:user_id, :room_id)
  end

  def set_room
    @room = Room.find(params[:room_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Room not found' }, status: :not_found
  end
end
