import Ember from 'ember';
var inject = Ember.inject;

export default Ember.Component.extend({
  showWhosOnline: function () {
    // If the number of users is less than the minimum, and it's set to hide, hide it
    if (this.get('online').users.length < this.siteSettings.whos_online_minimum_display &&
      this.siteSettings.whos_online_hide_below_minimum_display) {
      return false;
    }

    return this.get('online').get('shouldDisplay');
  }.property(),
  online: inject.service('online-service'),
  user: function () {
    return this.get('online').user;
  }.property('online.users.@each'),
  isLong: function () {
    return this.get('online').users.length >= this.siteSettings.whos_online_collapse_threshold;
  }.property('online.users.length'),
  isUsers: function () {
    return this.get('online').users.length >= this.siteSettings.whos_online_minimum_display;
  }.property('online.users.length'),
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
  summaryTableRows: Ember.computed('online.user_summary', function () {
    const { user_summary } = this.get('online');
    const headMap = this.get('summaryTableHeadsMap');
    if (user_summary) {
      return Object.keys(this.get('summaryTableHeadsMap'))
        .map(key => {
          return { key: headMap[key], value: user_summary[key] };
        })
    }
  })
});