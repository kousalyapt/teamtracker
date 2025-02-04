class CommentsController < ApplicationController
  before_action :set_project, only: [:create ]
    before_action :set_task
    before_action :set_comment, only: [ :destroy, :update]

    def index
        @comments = @task.comments.includes(:user).order(created_at: :asc) 
        render json: @comments.map { |comment| 
          {
            id: comment.id,
            content: comment.content,
            creator_id: comment.user.id,   
            creator_name: comment.user.name,
            created_at: comment.created_at
          }
        }, status: :ok
      end
    
  
    # Create a comment for a task
    #http://localhost:3000/projects/17/tasks/8/comments POST
    def create
      @comment = @task.comments.new(comment_params)
      @comment.user = current_user  # Set the logged-in user as the creator
      
      if @comment.save
        if @task.assigned_to_id && current_user.id != @task.assigned_to_id 
          Notification.create(
          user_id: @task.assigned_to_id,
          message: "#{current_user.name} has commented on task #{@task.title}",
          read: false,
          link: "/projects/#{@project.id}/tasks/#{@task.id}",
          task_id: @task.id
        )
        end
        @project_members.each do |member|
          if member == current_user
            Activity.create(
              user: member,
              message: "You commented on the task '#{@task.title}' in Project #{@project.title}",
              link: "/projects/#{@project.id}/tasks/#{@task.id}",
              task_id: @task.id
            )
          else
            Activity.create(
              user: member,
              message: "#{current_user.name} commented on the task '#{@task.title}' in Project #{@project.title}",
              link: "/projects/#{@project.id}/tasks/#{@task.id}",
              task_id: @task.id
            )
          end
        end
        render json: { comment: @comment, creator_id: @comment.user.id, creator_name: @comment.user.name }, status: :created
      else
        render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    #Update a comment
    def update
      if @comment.update(comment_params)
        render json: { comment: @comment,  creator_id: @comment.user.id, creator_name: @comment.user.name }, status: :ok
      else
        render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    # Destroy a comment
    def destroy
      @comment.destroy
      head :no_content
    end
  
    private

    
  
    def set_task
      @task = Task.find(params[:task_id])  # Find the task based on task_id
    end

    def set_project
      @project = Project.find(params[:project_id])
      @project_members = @project.members
creator = User.find(@project.user_id)

# Add creator to the project members if not already included
@project_members = @project_members << creator unless @project_members.include?(creator)
    end
  
  
    def set_comment
      @comment = @task.comments.find(params[:id])  # Find the comment by its ID under the task
    end
  
    def comment_params
      params.require(:comment).permit(:content)  # Allow the content field to be passed in
    end
  end
  