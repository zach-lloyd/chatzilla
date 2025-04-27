Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  resources :users, only: [:index]

  resources :rooms, only: [:create, :index, :show] do
    resources :messages, only: [:create, :index]
    resource :membership, only: [:create, :destroy]
  end

  resources :messages, only: [:create]

  get "up" => "rails/health#show", as: :rails_health_check

  mount ActionCable.server => '/cable'

  # Defines the root path route ("/")
  # root "posts#index"
end
