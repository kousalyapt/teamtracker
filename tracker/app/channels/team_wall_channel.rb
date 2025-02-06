class TeamWallChannel < ApplicationCable::Channel
  def subscribed
    stream_from "team_wall_#{params[:project_id]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
