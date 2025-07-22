# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  before_action :configure_sign_up_params, only: [:create]
  respond_to :json

  include ActionController::Flash

  # GET /resource/sign_up
  def new
    super
  end

  # POST /resource
  def create   
    super
  end

  # DELETE /resource
  def destroy
    super
  end


  # protected

  # If you have extra params to permit, append them to the sanitizer.
  def configure_sign_up_params
    devise_parameter_sanitizer.permit(
      :sign_up, 
      keys: [:username, :email, :password, :password_confirmation]
    )
  end
end
