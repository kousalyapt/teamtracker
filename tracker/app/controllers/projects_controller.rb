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
          add_members_to_project(@project, params[:project][:member_emails],false)
          create_activity_for_project_action(current_user, "create", @project)
          create_activity_for_project_members_action(current_user, "added", @project)
        end
        render json: @project, status: :created
      else
        render json: @project.errors, status: :unprocessable_entity
      end
    end

    def invite_members
      emails = params[:emails]
      project = Project.find(params[:id])
      invite_link = "http://localhost:3001/projects/#{project.id}/accept_invite"
    
      emails.each do |email|
        InvitationMailer.invite_member(email, project.title, invite_link).deliver_now
      end
    
      render json: { message: 'Invites sent successfully' }, status: :ok
    rescue StandardError => e
      render json: { error: e.message }, status: :unprocessable_entity
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
      previous_title = @project.title
      previous_description  =@project.description
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
          add_members_to_project(@project, params[:project][:member_emails], old_members, true)
        end
        notify_title_change(@project, previous_title, current_user)
        notify_description_change(@project, previous_description, current_user)
        render json: @project, status: :created
      else
        render json: @project.errors, status: :unprocessable_entity
      end
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Project not found" }, status: :not_found
    end

    def destroy
      @project = Project.find(params[:id])
      create_activity_for_project_action(current_user, "delete", @project)
      @project.destroy
      head :no_content
    end

    private
  
    def project_params
      params.require(:project).permit(:title, :description, member_emails: [])
    end
  
    def add_members_to_project(project, member_emails, old_members = [], flag)
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
              read: false,
              link: "/projects/#{project.id}/tasks"
            )
            if flag == true
              create_activity_for_update_members(project,user,"add")

            end
            

            

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
          read: false,
          link: "/notifications"
    
        )
        if flag == true
          create_activity_for_update_members(project,user,"remove")

        end
        
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

    def create_activity_for_project_action(user,action, project)
      project_members = project.members
      puts "hhhhhhhhhi"
      puts project_members
      puts "biiiiiiiiiiii"
      creator = User.find(project.user_id)

# # Add creator to the project members if not already included
      project_members = project_members << creator unless project_members.include?(creator)
      project_members.each do |member|
        if member == user
          Activity.create(
              user: member,
              message: "You #{action}d the project '#{project.title}'",
              link: "/projects/#{project.id}/tasks"
            )

        else
          Activity.create(
              user: member,
              message: "#{user.name} #{action}d the project '#{project.title}'",
              link: "/projects/#{project.id}/tasks"
            )
        end
      end
    end

    def create_activity_for_project_members_action(user, action, project)
      project_members = project.members
      creator = User.find(project.user_id)
      final_members = project_members.filter { |member| member.id != creator.id }
      puts "los"
      final_members.each {|mem| puts mem.name}
      puts "its"
      puts creator.name
      puts "gain"
      final_members.each do |member|
          Activity.create(
              user: creator,
              message: "#{member.name} #{action}d to the project '#{project.title}'",
              link: "/projects/#{project.id}/tasks"
            )
      end

# Add creator to the project members if not already included

      final_members.each do |member|
        final_members.each do |mem|
          if mem == member
            Activity.create(
                user: member,
                message: "You #{action}d to the project '#{project.title}'",
                link: "/projects/#{project.id}/tasks"
              )
        
          else
            Activity.create(
                user: member,
                message: "#{mem.name} #{action}d the project '#{project.title}'",
                link: "/projects/#{project.id}/tasks"
              )
          end
        end
  
      end
    end

    def create_activity_for_update_members(project, user, action)
      project_members = project.members
      project_members.each do |member|
        if user == member
          Activity.create(
              user: member,
              message: "You #{action}d the project '#{project.title}'",
              link: "/projects/#{project.id}/tasks"
            )
        else
          Activity.create(
              user: member,
              message: "#{user.name} #{action}d the project '#{project.title}'",
              link: "/projects/#{project.id}/tasks"
            )
        end
        
      end
      
    end

    def notify_title_change(project, previous_title, user)
      if previous_title != project.title
        project_members = project.members
        project_members.each do |member|
          if user == member
            Activity.create(
                user: member,
                message: "The Title for the project '#{previous_title}' has been changed to #{project.title} by You",
                link: "/projects/#{project.id}/tasks"
              )
          else
            Activity.create(
                user: member,
                message: "The Title for the project '#{previous_title}' has been changed to #{project.title} by #{user.name}",
                link: "/projects/#{project.id}/tasks"
              )
          end
          
        end
        
      end
    end

    def notify_description_change(project, previous_description, user)
      if previous_description != project.description
        project_members = project.members
        project_members.each do |member|
          if user == member
            Activity.create(
                user: member,
                message: "The description for the project '#{project.title}' has been changed by You",
                link: "/projects/#{project.id}/tasks"
              )
          else
            Activity.create(
                user: member,
                message: "The description for the project '#{project.title}' has been changed by #{user.name}",
                link: "/projects/#{project.id}/tasks"
              )
          end
          
        end
        
      end
    end
      
  end
  