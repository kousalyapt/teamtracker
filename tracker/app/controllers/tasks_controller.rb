class TasksController < ApplicationController
    before_action :set_project, only: [:create, :index, :show]
    before_action :set_task, only: [:update, :destroy, :add_label, :show, :resolve, :close, :open]

    def resolve
      @task.resolve!
      render json: { message: 'Task resolved successfully', task: @task }, status: :ok
    end
  
    # Change the state to closed
    def close
      @task.close!
      render json: { message: 'Task closed successfully', task: @task }, status: :ok
    end

    def open
      @task.open!
      render json: { message: 'Task reopened successfully', task: @task }, status: :ok
    end
  
    def user_tasks
      user = User.find(params[:user_id])
  
      # Fetch tasks where the user is either the creator or assigned to the task
      tasks = Task.where(assigned_to_id: user.id)
                  .includes(:project, :labels) # Eager load associated records to optimize queries
  
      tasks_with_project_info = tasks.map do |task|
        task.as_json(include: [:labels]).merge(
          project_title: task.project.title,
          project_id: task.project.id
        )
      end

      render json: { tasks: tasks_with_project_info }, status: :ok
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'User not found' }, status: :not_found
    end
      
    def show
      render json: @task.as_json(include: :labels).merge(creator_name: @task.creator&.name || 'Unknown')
    end

    def add_label
      @label = Label.find(params[:label_id])
      @task.labels << @label unless @task.labels.include?(@label)
      render json: @task.labels, status: :ok
    end

    def filter
      from_date = params[:from_date].present? ? Date.parse(params[:from_date]) : nil
      to_date = params[:to_date].present? ? Date.parse(params[:to_date]) : nil
  
      if from_date && to_date
        @tasks = Task.where(due_date: from_date..to_date)
      else
        @tasks = Task.all
      end
  
      render json: @tasks
    end
  
    def index
      @tasks = @project.tasks
      tasks_with_creator_name = @tasks.map do |task|
        task.as_json(include: :labels).merge(creator_name: task.creator&.name || 'Unknown') # Include creator's name
      end
    
      render json: tasks_with_creator_name
    end
  
    def create
      @task = @project.tasks.new(task_params)
      @task.created_by = current_user.id

      if params[:assigned_to_id].present?
        @task.assigned_to = User.find(params[:assigned_to_id])
      end

      if @task.save
        Notification.create(
        user_id: @task.assigned_to_id, 
        message: "You have been assigned a new task: #{@task.title}",
        read: false
      )
        if params[:label_ids].present?
          labels = Label.where(name: params[:label_ids])
          @task.labels << labels 
        end
        render json: @task.as_json.merge(creator_name: @task.creator.name), status: :created
      else
        render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    def update
      previous_title = @task.title
      previous_description  =@task.description
      previous_estimated_time = @task.estimated_time
      previous_due_date = @task.due_date
      previous_labels = @task.labels.map(&:name)
      previous_assigned_to_id = @task.assigned_to_id
      puts "hhhhhhhhhhhhhh"
      puts @task.labels.map(&:name)

      if @task.update(task_params)
        notify_assigned_user(previous_assigned_to_id)
        notify_due_date_change(previous_due_date)
        
        notify_title_change(previous_title)
        notify_description_change(previous_description)
        notify_estimated_time_change(previous_estimated_time)

        if params[:label_ids].present?
          labels = Label.where(name: params[:label_ids])
          @task.labels = labels 
        end
        notify_label_change(previous_labels)
        
    
        render json: @task
      else
        render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    def destroy
      @task.destroy
      head :no_content
    end
  
    private

    def notify_assigned_user(previous_assigned_to_id)
      if previous_assigned_to_id != @task.assigned_to_id && @task.assigned_to_id.present?
        Notification.create(
          user_id: @task.assigned_to_id,
          message: "You have been assigned the task: #{@task.title}",
          read: false
        )
    
    # Create a notification for the previous assignee (optional)
        Notification.create(
          user_id: previous_assigned_to_id,
          message: "You were unassigned from the task: #{@task.title}",
          read: false
        )
      end
    end

    def notify_title_change(previous_title)
      if previous_title != @task.title
        Notification.create(
          user_id: @task.assigned_to_id,
          message: "The Title for the task '#{previous_title}' has been changed to #{@task.title}",
          read: false
        )
      end
    end

    def notify_description_change(previous_description)
      if previous_description != @task.description
        Notification.create(
          user_id: @task.assigned_to_id,
          message: "The description for the task '#{@task.title}' has been changed.",
          read: false
        )
      end
    end

    def notify_estimated_time_change(previous_estimated_time)
      if previous_estimated_time != @task.estimated_time
        Notification.create(
          user_id: @task.assigned_to_id,
          message: "The Estimated time for the task '#{@task.title}' has been changed to #{@task.estimated_time}.",
          read: false
        )
      end
    end

    def notify_due_date_change(previous_due_date)
      if previous_due_date != @task.due_date
        Notification.create(
          user_id: @task.assigned_to_id,
          message: "The due date for the task '#{@task.title}' has been changed to #{@task.due_date}",
          read: false
        )
      end
    end

    def notify_label_change(previous_labels)
      new_labels = @task.labels.map(&:name)
puts previous_labels
puts "and"
puts new_labels
      if previous_labels != new_labels
        Notification.create(
          user_id: @task.assigned_to_id,
          message: "Label for the task '#{@task.title}' has been changed to #{new_labels.join()}",
          read: false
        )
      end
      
    
      # unless added_labels.empty? && removed_labels.empty?
      #   message = "Labels for the task '#{@task.title}' have been updated."
      #   message += " Added: #{added_labels.join(', ')}" unless added_labels.empty?
      #   message += " Removed: #{removed_labels.join(', ')}" unless removed_labels.empty?
      #   Notification.create(
      #     user_id: @task.assigned_to_id,
      #     message: message,
      #     read: false
      #   )
      # end
    end
  
    def set_project
      @project = Project.find(params[:project_id])
    end
  
    def set_task
      @task = Task.find(params[:id])
    end
  
    def task_params
      params.require(:task).permit(:title, :description, :assigned_to_id, :estimated_time, :due_date, label_ids: [])
    end

    def comment_params
      params.require(:comment).permit(:content)
    end
  end
  