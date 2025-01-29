# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
   before_action :configure_permitted_parameters, if: :devise_controller?
  include RackSessionFix
  respond_to :json

  def create
    super do |user|
      puts "ssssssss"
      # If the project_id is present in the params, try to find the project and associate it with the user
      if params[:user][:project_id].present? && params[:user][:project_id].present?
        puts "rrrrrrrrr"
        project = Project.find_by(id: params[:user][:project_id])
        if project
          # Add the user to the project if the project exists
          project.members << user unless project.members.include?(user)
          # You can also create any necessary activity or notification here
          Notification.create(
            user_id: user.id,
            message: "You have been added to the project: #{project.title}",
            read: false
          )
        else
          # Handle case when the project does not exist
          
          
          
          Rails.logger.error "Project with ID #{params[:user][:project_id]} not found."
        end
      end
    end
  end

  

  def destroy
    current_user.destroy
    render json: { message: 'Account deleted successfully.' }, status: :ok
  end

  private

  def respond_with(resource, _opts = {})
    if request.method == 'POST' && resource.persisted?
      puts "---------------------------------"
      Rails.logger.debug "Received Params: #{resource.inspect}"
      render json: {
        message: 'Signed up sucessfully.',
        data: resource
      }, status: :ok
    elsif request.method == "DELETE"
      render json: {
        message: 'Account deleted successfully.',
      }, status: :ok
    else
      render json: {
        message: "User couldn't be created successfully.",
        errors: resource.errors.full_messages.to_sentence
      }, status: :unprocessable_entity
    end
  end

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name, :email, :password, :password_confirmation,  :project_id])
  #  devise_parameter_sanitizer.permit(:account_update, keys: [:name, :email, :password, :current_password,  :password_confirmation, :current_password])
  end
end
