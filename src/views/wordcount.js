var _ = require('underscore')
var Backbone = require('backbone')
var lang = require('../translations')

var WordCountView = Backbone.View.extend({
  el: '#counters',
  charcount: '#charcount',
  wordcount: '#wordcount',

  initialize: function (options) {
    _.bindAll(this, 'render')
    this.model.on('change:charCount', this.render)
    this.model.on('change:wordCount', this.render)
  },

  render: function () {
    var charCount = this.model.attributes.charCount
    var wordCount = this.model.attributes.wordCount
    this.$el.children(this.charcount).html(charCount ? lang.charCount + ' ' + charCount : '')
    this.$el.children(this.wordcount).html(wordCount ? lang.wordCount + ' ' + wordCount : '')
  }

})

module.exports = WordCountView
