import Ember from 'ember';
import { ajax } from 'discourse/lib/ajax';
import { userPath } from 'discourse/lib/url';

export default Ember.Service.extend({
    after: 'message-bus',

    users: [],
    user: null,
    _lastMessageId: null,
    user_summary: null,

    appEvents: Discourse.__container__.lookup('app-events:main'),
    messageBus: window.MessageBus,
    siteSettings: Discourse.__container__.lookup('site-settings:main'),

    isUserOnline(user_id) {

        var matchById = function (element) {
            return element.id === this;
        };

        var found = this.get('users').find(matchById, user_id);
        if (found !== undefined) {
            return true;
        }

        return false;

    },

    messageProcessor() {
        var onlineService = this;

        return function (data, global_id, message_id) {
            console.debug('messageProcessor', data, global_id, message_id);
            var currentUsers = onlineService.get('users');

            var last_message_id = onlineService.get('_lastMessageId');

            if (message_id !== last_message_id + 1) { // If not the next message
                console.log("Reloading online users data");
                onlineService.messageBus.unsubscribe('/whos-online', this.func);

                // Fetch up to date data
                ajax('/whosonline/get.json', { method: 'GET' }).then(function (result) {
                    let oldUserIds = currentUsers.map(({ id }) => id);
                    onlineService.set('users', result['users']);
                    let newUserIds = result['users'].map(({ id }) => id);
                    onlineService.set('_lastMessageId', result['messagebus_id']);
                    onlineService.messageBus.subscribe('/whos-online', onlineService.messageProcessor(), result['messagebus_id']);

                    let changedUsers = [...oldUserIds, ...newUserIds];

                    onlineService.appEvents.trigger('whosonline:changed', changedUsers);
                }, function (msg) {
                    console.log(msg); // Log the error
                });

                return;
            }

            onlineService.set('_lastMessageId', message_id);

            switch (data['message_type']) {
                case 'going_online':
                    var user = data['user'];
                    currentUsers.pushObject(user);
                    onlineService.appEvents.trigger('whosonline:changed', [data['user'].id]);
                    break;
                case 'going_offline':
                    var matchById = function (element) {
                        return element.id === this;
                    };

                    data['users'].forEach(function (user_id) {
                        var found = currentUsers.find(matchById, user_id);
                        if (found !== undefined) {
                            currentUsers.removeObject(found);
                        }
                    });

                    onlineService.appEvents.trigger('whosonline:changed', data['users']);

                    break;
                default:
                    console.error('Unknown message type sent to /whos-online');
                    break;
            }

        };
    },

    init() {
        var startingData = Discourse.Site.currentProp('users_online');
        const lowerUsername = Discourse.User.current().username.toLocaleLowerCase();
        this.set('user',  Discourse.User.current());
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
                console.debug('summary', summary);
                this.set('user_summary', summary);
            });

        if (startingData) {
            console.debug('online-service#init', startingData['users'], startingData['messagebus_id']);
            this.set('users', startingData['users']);
            this.set('_lastMessageId', startingData['messagebus_id']);

            this.appEvents.trigger('whosonline:changed', startingData['users'].map(({ id }) => id));
            this.messageBus.subscribe('/whos-online', this.messageProcessor(), startingData['messagebus_id']);
        }
    },

    shouldDisplay: function () {
        window.store2 = this.get('store');
        // If the plugin is disabled, return false
        if (!this.siteSettings.billboard_enabled) {
            return false;
        }

        // If it's visible to the public, always make visible
        if (this.siteSettings.whos_online_display_public) {
            return true;
        }

        // Check user trust levels
        var currentUser = Discourse.User.current();
        if (currentUser === null) {
            return false;
        } else {
            return currentUser.trust_level >= this.siteSettings.whos_online_display_min_trust_level;
        }

    }.property(),

});