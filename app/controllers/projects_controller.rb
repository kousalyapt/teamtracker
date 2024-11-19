class ProjectsController < ApplicationController
    before_action :authenticate_user!
  
    # POST http://localhost:3000/projects
    def create
      # Create a new project for the current user
      logger.info "Received params: #{params[:project]}"

      @project = current_user.projects.new(project_params.except(:member_emails))
  
      if @project.save
        # Add members if member_emails are provided
        if params[:project][:member_emails].present?
          add_members_to_project(@project, params[:project][:member_emails])
        end
        render json: @project, status: :created
      else
        render json: @project.errors, status: :unprocessable_entity
      end
    end
  
    # GET http://localhost:3000/projects
    def index
      @user = current_user # Get the current user
      @projects_created = @user.projects # Projects the user has created
      @projects_as_member = @user.member_projects # Projects where the user is a member
  
      render json: { projects_created: @projects_created, projects_as_member: @projects_as_member }
    end

    def show
        @project = Project.find(params[:id])
    
        # If you have tasks associated with this project, include them in the response
        render json: @project
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Project not found" }, status: 404
      end
    private
  
    # Strong parameters
    def project_params
      # Permit title, description, and member_emails
      params.require(:project).permit(:title, :description, member_emails: [])
    end
  
    # Add members to the project based on emails
    def add_members_to_project(project, member_emails)
      member_emails.each do |email|
        user = User.find_by(email: email)
        if user
          # Add the user as a member if they are not already part of the project
          project.members << user unless project.members.include?(user)
        else
          # Log a warning for invalid emails
          Rails.logger.warn("User with email #{email} not found")
        end
      end
    end
  end
  