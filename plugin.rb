# name: discourse-hkustvislab-billboard
# about: The billboard of HKUST-VisLab
# version: 0.5
# authors: Zhutian Chen
# url: https://github.com/chenzhutian/discourse-hkustvislab-billboard

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
    user = User.where(username: SiteSetting.billboard_target_user).first
    userSummary = { user_summary: nil }.as_json

    if !user.nil?
      guardian = Guardian.new(user)
      summary = UserSummary.new(user, guardian)
      userSummary = UserSummarySerializer.new(summary, scope: guardian)
    end

    # target user
    { user:  BasicUserSerializer.new(user, root: false),
      userSummary: userSummary,
      messagebus_id: MessageBus.last_id('/billboard') }
  end

  # Thread.new do
  #   loop do 
  #     sleep 60
  #     user = User.where(username: 'zhutian.chen').first
  #     guardian = Guardian.new(user)
  #     summary = UserSummary.new(user, guardian)
        
  #     MessageBus.publish('/billboard_targetUser', UserSummarySerializer.new(summary, scope: guardian).as_json)
  #   end
  # end

  module ::Jobs

    # This clears up users who have now moved offline
    class BillBoardTargetUserInfo < ::Jobs::Scheduled
      every 1.minutes

      def execute(args)
        return if !SiteSetting.billboard_enabled?

        user = User.where(username: SiteSetting.billboard_target_user).first
        userSummary = { user_summary: nil }.as_json
    
        if !user.nil?
          guardian = Guardian.new(user)
          summary = UserSummary.new(user, guardian)
          userSummary = UserSummarySerializer.new(summary, scope: guardian)
        end

        MessageBus.publish('/billboard_targetUser', userSummary)
      end
    end
  end

end