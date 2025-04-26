class MembershipsController < ApplicationController
  before_action :authenticate_user!

  def create
    @membership = current_user.memberships.build(membership_params)

    if @membership.save
      render json: @membership, status: :created
    else
      render json: @membership.errors, status: :unprocessable_entity
    end
  end

  def destroy
  end

  private

  def membership_params
    params.require(:membership).permit(:user_id, :room_id)
  end
end
