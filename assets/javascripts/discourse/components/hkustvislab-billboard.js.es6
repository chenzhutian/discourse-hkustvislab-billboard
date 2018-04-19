import Ember from 'ember';
var inject = Ember.inject;

export default Ember.Component.extend({
  actions: {
    triggerCollapse: function (e) {
      this.set('isCollapsed', !this.get('isCollapsed'));
    }
  },

  showBillBoard: function () {
    return this.get('online').get('shouldDisplay');
  }.property(),
  online: inject.service('billboard-service'),
  targetUser: function () {
    return this.get('online').targetUser;
  }.property(),
  user: function () {
    return this.get('online').user;
  }.property(),
  isCollapsed: false,
  summaryTableHeadsMap: {
    'likes_given': 'Likes Given',
    'likes_received': 'Likes Received',
    'topics_entered': 'Topics Entered',
    'posts_read_count': 'Posts Read',
    'days_visited': 'Days Visited',
    'topic_count': 'Topic Count',
    'post_count': 'Post Count',
    'time_read': 'Time Read',
    // 'recent_time_read': 'Recent Time Read',
    'bookmark_count': 'Bookmark Count',
    // 'replies': 'Replies',
    // 'most_liked_by_users': 'Most Liked by Users',
    // 'most_liked_users': 'Most Liked Users',
    // 'most_replied_to_users': 'Most Replied to Users',
    // 'badges': 'Badges'
  },
  summaryTableRows: Ember.computed('online.userSummary', 'online.targetUserSummary', function () {
    const { userSummary, targetUserSummary } = this.get('online');
    const headMap = this.get('summaryTableHeadsMap');
    if (userSummary && targetUserSummary) {
      return Object.keys(this.get('summaryTableHeadsMap'))
        .map(key => {
          let targetValue = targetUserSummary[key];
          let value = userSummary[key];
          if (key === 'time_read') {
            targetValue = new Date(targetValue * 1000).toISOString().substr(11, 8);
            value = new Date(value * 1000).toISOString().substr(11, 8);
          }
          return {
            key: headMap[key],
            targetValue,
            value
          };
        })
    }
  })
});