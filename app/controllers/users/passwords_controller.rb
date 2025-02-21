class Users::PasswordsController < ApplicationController
    respond_to :json

  def create
    user = User.find_by(email: params[:email])

    if user
      user.send_reset_password_instructions
      render json: { message: "Reset password instructions sent. Check your mail." }, status: :ok
    else
      render json: { error: "Email not found." }, status: :not_found
    end
  end

  # Override the update action to reset the password
  def update
    user = User.reset_password_by_token(
      reset_password_token: params[:reset_password_token],
      password: params[:password],
      password_confirmation: params[:password_confirmation]
    )

    if user.errors.empty?
      render json: { message: "Password has been reset successfully." }, status: :ok
    else
      render json: { error: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def password_reset_params
    params.permit(:reset_password_token, :password, :password_confirmation)
  end
end
