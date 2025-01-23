class ActivitiesController < ApplicationController
    before_action :authenticate_user!

    # def create
    #     @activity = Activity.new(activity_params)
    #     if @activity.save
    #       render json: @activity, status: :created
    #     else
    #       render json: { errors: @activity.errors.full_messages }, status: :unprocessable_entity
    #     end
    # end

    def create
        @activity = Activity.new(activity_params)
        if params[:task_id].present?
          @activity.task = Task.find(params[:task_id])
        end
        if @activity.save
          render json: @activity, status: :created
        else
          render json: { errors: @activity.errors.full_messages }, status: :unprocessable_entity
        end
    end

    def index
        @activities = current_user.activities.order(created_at: :desc)
        render json: @activities
    end

    def destroy
        @activity = current_user.activities.find(params[:id])
        @activity.destroy
        head :no_content
    end

    def delete_all
        current_user.activities.destroy_all
        head :no_content
    end
  
    private
  
    def activity_params
        params.require(:activity).permit(:user, :message, :task_id, :link)
    end
end
