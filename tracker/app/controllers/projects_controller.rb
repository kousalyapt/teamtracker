class ProjectsController < ApplicationController
    before_action :authenticate_user!

    def members
      @project = Project.find(params[:id])
      all_members = @project.members.to_a
      all_members << @project.user unless all_members.include?(@project.user)
  
      render json: {
        members: all_members.map do |member|
          {
            id: member.id,
            name: member.name,
            email: member.email
          }
        end
      }, status: :ok
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Project not found" }, status: :not_found
    end
  
    def create
      logger.info "Received params: #{params[:project]}"

      @project = current_user.projects.new(project_params.except(:member_emails))
  
      if @project.save
        if params[:project][:member_emails].present?
          add_members_to_project(@project, params[:project][:member_emails])
        end
        render json: @project, status: :created
      else
        render json: @project.errors, status: :unprocessable_entity
      end
    end
  
    def index
      @user = current_user # Get the current user
      @projects_created = @user.projects # Projects the user has created
      @projects_as_member = @user.member_projects # Projects where the user is a member
  
      render json: { projects_created: @projects_created, projects_as_member: @projects_as_member }
    end

    def show
        @project = Project.find(params[:id])
    
        render json: @project
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Project not found" }, status: 404
      end

    def update
      @project = Project.find(params[:id])
      if @project.update(project_params.except(:member_emails))
        old_members = @project.members.to_a
        puts "qqqqqqqqqqq"
        old_members.each do |mem|
          puts mem.email
        end
        puts "rrrrrrrrrrrrrrrrrr"
        puts params[:project][:member_emails]
        if params[:project][:member_emails].present?
          puts "projecttttttt"
          puts @project
          add_members_to_project(@project, params[:project][:member_emails], old_members)
        end
        render json: @project, status: :created
      else
        render json: @project.errors, status: :unprocessable_entity
      end
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Project not found" }, status: :not_found
    end

    def destroy
      @project = Project.find(params[:id])
      @project.destroy
      head :no_content
    end

    private
  
    def project_params
      params.require(:project).permit(:title, :description, member_emails: [])
    end
  
    def add_members_to_project(project, member_emails, old_members = [])
      # project.members.clear
      new_members = []
      member_emails.each do |email|
        user = User.find_by(email: email)
        if user
        #   project.members << user unless project.members.include?(user)
        #   Notification.create(
        #   user_id: user.id,
        #   message: "You have been added to the project: #{project.title}",
        #   read: false
        # )
        puts "pid"
        puts project.user_id
        puts "uid"
        puts user.id
          unless project.members.include?(user) || project.user_id == user.id
            project.members << user
            new_members << user
            # Send notification to new member
            Notification.create(
              user_id: user.id,
              message: "You have been added to the project: #{project.title}",
              read: false
            )
          end
        else
          Rails.logger.warn("User with email #{email} not found")
        end
      end

      # old_members.each do |email|
      #   user = User.find_by(email: email.email)
      #   if user
      #     unless member_emails.include?(user)
      #       Notification.create(
      #       user_id: user.id,
      #       message: "You have been removed from the project: #{project.title}",
      #       read: false
      #     )
      #     # Actually remove the member from the project
      #     project.members.delete(user)
      #     end
      #   end
      # end

      members_to_remove = project.members - User.where(email: member_emails)
members_to_remove.each do |user|
  Notification.create(
    user_id: user.id,
    message: "You have been removed from the project: #{project.title}",
    read: false
  )
  project.members.delete(user)
end
      
        # (old_members - member_emails).each do |removed_member|
        #   # Send notification to removed member
        #   puts "sssssssssss"
        #   puts removed_member
        #   Notification.create(
        #     user_id: removed_member.id,
        #     message: "You have been removed from the project: #{project.title}",
        #     read: false
        #   )
        #   # Actually remove the member from the project
        #   project.members.delete(removed_member)
        # end
        puts "kkkkkkkkkkkkkk"
        puts project.members
    end
  end
  