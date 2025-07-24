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
    username = sign_up_params[:username]

    if username.present? && ProfanityChecker.new(username).profane?
      # Build a resource object so error can be added to it.
      build_resource(sign_up_params)
      resource.errors.add(:username, "contains inappropriate language.")
      
      # Respond with the resource, which will now contain the error
      render json: { 
        status: { 
          code: 422, 
          message: "Registration failed.", 
          errors: resource.errors.full_messages 
        } 
      }, status: :unprocessable_entity
    else
      # If the username is clean, proceed with the default Devise behavior.
      super
    end
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
