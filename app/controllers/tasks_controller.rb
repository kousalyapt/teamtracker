class TasksController < ApplicationController
    before_action :set_project, only: [:create, :index]
    before_action :set_task, only: [:update, :destroy]
  
    # Fetch all tasks for a specific project
    #http://localhost:3000/projects/47/tasks GET
    def index
      @tasks = @project.tasks
      tasks_with_creator_name = @tasks.map do |task|
        task.as_json.merge(creator_name: task.creator.name)  # Include creator's name
      end
    
      render json: tasks_with_creator_name
    end
  
    # Create a new task
    #http://localhost:3000/projects/47/tasks POST
    def create
      @task = @project.tasks.new(task_params)
      @task.created_by = current_user.id

      if params[:assigned_to_id].present?
        @task.assigned_to = User.find(params[:assigned_to_id])
      end

      if @task.save
        render json: @task.as_json.merge(creator_name: @task.creator.name), status: :created
      else
        render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    # Update an existing task
    #http://localhost:3000/projects/47/tasks/1 PATCH
    def update
      if @task.update(task_params)
        render json: @task
      else
        render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    # Delete a task
    def destroy
      @task.destroy
      head :no_content
    end
  
    private
  
    # Set the project based on the project_id in the URL
    def set_project
      @project = Project.find(params[:project_id])
    end
  
    # Set the task based on the task_id in the URL
    def set_task
      @task = Task.find(params[:id])
    end
  
    # Strong parameters for task attributes
    def task_params
      params.require(:task).permit(:title, :description, :assigned_to_id, :estimated_time, :due_date, :labels)
    end
  end
  