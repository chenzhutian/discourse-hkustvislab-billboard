# name: discourse-whos-online
# about: Who's online widget
# version: 1.0
# authors: David Taylor
# url: https://github.com/davidtaylorhq/discourse-whos-online

enabled_site_setting :billboard_enabled

PLUGIN_NAME ||= 'discourse_billboard'.freeze

register_asset 'stylesheets/billboard.scss'

after_initialize do

  module ::DiscourseBillboard
    class Engine < ::Rails::Engine
      engine_name PLUGIN_NAME
      isolate_namespace DiscourseBillboard
    end
  end

  add_to_serializer(:site, :billboard_target_user) do
    { user: User.where(username: 'zhutian.chen').first,
      messagebus_id: MessageBus.last_id('/billboard') }
  end

  # on(:user_seen) do |user|
  #   guardian = Guardian.new(user)
  #   summary = UserSummary.new(user, guardian)
  #   serializer = UserSummarySerializer.new(summary, scope: guardian)

  #   MessageBus.publish('/billboard_' + user.id, serializer.as_json)
  # end

  # module ::Jobs

  #   # This clears up users who have now moved offline
  #   class BillboardUpdate < Jobs::Scheduled
  #     every 1.minutes

  #     def execute(args)
  #       return if !SiteSetting.billboard_enabled?

  #       summary = UserSummary.new(user, guardian)
  #       serializer = UserSummarySerializer.new(summary, scope: guardian)
      
  #       MessageBus.publish('/billboard', serializer)
  #     end
  #   end
  # end

end