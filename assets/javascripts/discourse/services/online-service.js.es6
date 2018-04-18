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
        var { user: targetUser } = Discourse.Site.currentProp('billboard_target_user');
        this.set('targetUser', targetUser);

        const user = Discourse.User.current();
        const lowerUsername = user.username.toLocaleLowerCase();
        this.set('user', user);
        ajax(userPath(`${lowerUsername}/summary.json`))
            .then(json => {
                const summary = json.user_summary;
                // const topicMap = {};
                // const badgeMap = {};

                // json.topics.forEach(t => topicMap[t.id] = store.createRecord('topic', t));
                // Badge.createFromJson(json).forEach(b => badgeMap[b.id] = b);

                // summary.topics = summary.topic_ids.map(id => topicMap[id]);

                // summary.replies.forEach(r => {
                //     r.topic = topicMap[r.topic_id];
                //     r.url = r.topic.urlForPostNumber(r.post_number);
                //     r.createdAt = new Date(r.created_at);
                // });

                // summary.links.forEach(l => {
                //     l.topic = topicMap[l.topic_id];
                //     l.post_url = l.topic.urlForPostNumber(l.post_number);
                // });

                // if (summary.badges) {
                //     summary.badges = summary.badges.map(ub => {
                //         const badge = badgeMap[ub.badge_id];
                //         badge.count = ub.count;
                //         return badge;
                //     });
                // }
                this.set('userSummary', summary);
                console.debug('summary', summary);
            });
        ajax(userPath(`${targetUser.username.toLocaleLowerCase()}/summary.json`))
            .then(json => {
                const summary = json.user_summary;
                // const topicMap = {};
                // const badgeMap = {};

                // json.topics.forEach(t => topicMap[t.id] = store.createRecord('topic', t));
                // Badge.createFromJson(json).forEach(b => badgeMap[b.id] = b);

                // summary.topics = summary.topic_ids.map(id => topicMap[id]);

                // summary.replies.forEach(r => {
                //     r.topic = topicMap[r.topic_id];
                //     r.url = r.topic.urlForPostNumber(r.post_number);
                //     r.createdAt = new Date(r.created_at);
                // });

                // summary.links.forEach(l => {
                //     l.topic = topicMap[l.topic_id];
                //     l.post_url = l.topic.urlForPostNumber(l.post_number);
                // });

                // if (summary.badges) {
                //     summary.badges = summary.badges.map(ub => {
                //         const badge = badgeMap[ub.badge_id];
                //         badge.count = ub.count;
                //         return badge;
                //     });
                // }
                this.set('targetUserSummary', summary);
                console.debug('targetUserSummary', summary);
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