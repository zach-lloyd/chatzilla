class ProfanityChecker
  include HTTParty

  base_uri "https://neutrinoapi.net"

  def initialize(content)
    @content = content
    @options = {
      headers: {
        "User-Id" => Rails.application.credentials.neutrino[:user_id],
        "API-Key" => Rails.application.credentials.neutrino[:api_key],
        "Content-Type" => "application/x-www-form-urlencoded"
      },
      body: {
        "output-case" => "camel",
        content: @content
      }
    }
  end

  def profane?
    response = self.class.post("/bad-word-filter", @options)
    
    # Check if the API call was successful and the response body is valid JSON.
    return false unless response.success? && response.parsed_response.is_a?(Hash)

    response.parsed_response["isBad"]
  rescue HTTParty::Error, SocketError => e
    # If the API call fails for any reason (e.g., network issue),
    # default to not blocking the message to maintain app functionality.
    Rails.logger.error "Neutrino API error: #{e.message}"
    false
  end
end