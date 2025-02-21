
require 'sendgrid-ruby'
include SendGrid

class InvitationMailer < ApplicationMailer
  def invite_member(email, project_name, invite_link)
    @project_name = project_name
    @invite_link = invite_link

    mail(
      to: email,
      subject: "You're Invited to Join the Project: #{@project_name}"
    )
  end
end
