if Rails.env.production?
  # Configuration for the production environment on Render.
  Rails.application.config.session_store :cookie_store,
    key: "_chatzilla_session", 
    domain: :all,             
    same_site: :none,         
    secure: true,             
    tld_length: 2             
else
  # Default configuration for the development environment.
  Rails.application.config.session_store :cookie_store, key: "_chatzilla_session_dev"
end