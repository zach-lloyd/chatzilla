Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations"
  }
 
  resources :users, only: [:index, :show] do
    member do
      patch :toggle_presence
    end
  end

  resources :rooms, only: [:create, :index, :show] do
    resources :messages, only: [:create, :index]
    resource :membership, only: [:create, :destroy]
  end

  resources :messages, only: [:create]

  get "up" => "rails/health#show", as: :rails_health_check

  mount ActionCable.server => "/cable"

  get "/csrf-token", to: "csrf#show"
end
