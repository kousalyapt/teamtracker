Rails.application.routes.draw do

 
  devise_for :users, controllers: {
      sessions: 'users/sessions',
      registrations: 'users/registrations',
      passwords: 'users/passwords'
  }
  get '/projects', to: 'projects#index'
  resources :users do
    get 'tasks', to: 'tasks#user_tasks'
    
  end
  get 'user/projectids', to: 'projects#user_projects' 

  resources :chats, only: [:index, :create, :show, :destroy] do
    resources :messages do
      collection do
        get :unread_messages
      end
    end
    collection do
      get :chatted_people # ✅ Add this new route
      
     
    
    end
    member do
      patch :mark_as_read  # Adds `/chats/:id/mark_as_read`
    end
  end
  # resources :messages do
  #   collection do
  #     get :unread_messages
  #   end
  # end
  

  mount ActionCable.server => '/cable' 
  get 'all_tasks', to: 'tasks#all_tasks'
  resources :projects do
    resources :tasks, only: [:index, :create, :update, :destroy, :show] do
      post 'add_label/:label_id', to: 'tasks#add_label', as: 'add_label'
      member do
        patch :resolve
        patch :close
        patch :open
      end
      resources :comments, only: [:create, :update, :destroy,  :index]
    end
  end
  resources :projects do
    member do
      get :members
      get :accept_invite
    end
  end
  resources :projects do
    resources :chat_messages, only: [:index, :create]
  end

  resources :projects do
    post 'invite_members', on: :member
    
  end

  
  

  resources :tasks do
    collection do
      get 'filter'
    end
  end
  resources :labels, only: [:index, :create, :destroy]
  delete '/notifications/delete_all', to: 'notifications#destroy_all'


  resources :notifications, only: [:create, :index] do
    member do
      patch :mark_as_read
      delete :destroy
      
    end
  end
  patch '/notifications/mark_all_as_read', to: 'notifications#mark_all_as_read'
   get '/notify',to: 'notifications#testing'
  delete '/activities/delete_all', to: 'activities#delete_all'
  resources :activities, only: [:index, :destroy]

  


  # Assuming the endpoint is within the Dashboard controller
  get '/projects', to: 'projects#index'

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
