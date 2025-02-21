class CommentsChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel"
    stream_from "comments_#{params[:task_id]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
