Rails.application.config.session_store :cookie_store,
                                       key: '_odin_messenger_session', # Replace with your app's name
                                       same_site: :lax,
                                       secure: Rails.env.production?