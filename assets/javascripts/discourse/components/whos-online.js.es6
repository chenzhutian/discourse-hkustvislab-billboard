import Ember from 'ember';
var inject = Ember.inject;

export default Ember.Component.extend({
  showBillBoard: function () {
    return this.get('online').get('shouldDisplay');
  }.property(),
  online: inject.service('online-service'),
  targetUser: function() {
    return this.get('online').targetUser;
  }.property(),
  user: function () {
    return this.get('online').user;
  }.property(),
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
          return {
            key: headMap[key],
            targetValue: targetUserSummary[key],
            value: userSummary[key]
          };
        })
    }
  })
});