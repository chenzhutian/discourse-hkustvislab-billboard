import Ember from 'ember';
import { ajax } from 'discourse/lib/ajax';
import { userPath } from 'discourse/lib/url';

export default Ember.Service.extend({
    after: 'message-bus',

    messageBus: window.MessageBus,
    user: null,
    targetUser: null,
    targetUserSummary: null,
    userSummary: null,

    siteSettings: Discourse.__container__.lookup('site-settings:main'),

    init() {
        // If user not allowed, don't display
        if (!this.get('shouldDisplay')) return;
        var { user: targetUser, userSummary: targetUserSummary } = Discourse.Site.currentProp('billboard_target_user');
        this.set('targetUser', targetUser);
        this.set('targetUserSummary', targetUserSummary.user_summary);

        const user = Discourse.User.current();
        this.set('user', user);
        ajax(userPath(`${user.username.toLocaleLowerCase()}/summary.json`))
            .then(json => {
                const summary = json.user_summary;
                this.set('userSummary', summary);
            });

        setInterval(() => {
            ajax(userPath(`${user.username.toLocaleLowerCase()}/summary.json`))
                .then(json => {
                    const summary = json.user_summary;
                    this.set('userSummary', summary);
                });
        }, 60000);

        this.messageBus.subscribe('/billboard_targetUser', (data, global_id, message_id) => {
            console.debug('messages', data);
            if (data.user_summary) {
                this.set('targetUserSummary', data.user_summary);
            }
        });
    },

    shouldDisplay: function () {
        // If the plugin is disabled, return false
        if (!this.siteSettings.billboard_enabled) {
            return false;
        }

        // Check user trust levels
        var currentUser = Discourse.User.current();
        if (currentUser === null) {
            return false;
        } else {
            return currentUser.trust_level >= this.siteSettings.billboard_display_min_trust_level;
        }

    }.property(),

});