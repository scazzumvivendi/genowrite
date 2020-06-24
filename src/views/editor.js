var _ = require('underscore')
var Backbone = require('backbone')
var utils = require('../utils')
var lang = require('../translations')
var autosize = require('autosize')
var $ = require('jquery')

var EditorView = Backbone.View.extend({
  el: '#editor',
  
  initialize: function (options) {
    _.bindAll(
      this,
      'render',
      'focus',
      'blur',
      'desktopFocus',
      'handleCharEncodings',
      'setCursor',
      'insertTab'
      )
      
      this.litewrite = options.litewrite
      this.litewrite.state
      .on('change:query', this.render)
      
      this.model
      .on('change:id', this.render)
      .on('change:content', this.handleCharEncodings)
      .on('update', this.render)
      
      autosize(this.$el)
      this.setPlaceholder()
      this.render()
    },
    
    render: function () {
      // Only re-render when content changed
      var content = this.model.get('content')
      var query = this.litewrite.state.get('query')
      
      var highlightedText = this.applyHighlights(content, query)
      this.updateHighlight(highlightedText)
      
      if (content === this.$el.val()) {
        return
      }
      
      this.$el.val(content || '')
      autosize.update(this.$el)
      
      var pos = this.model.get('cursorPos')
      if (pos) {
        this.setCursor(pos)
      }
    },
    
    focus: function () {
      if (utils.isDesktop) {
        this.$el.focus()
        return
      }
      
      // Doesn't seem to work for textarea on iOS at all.
      // Maybe it works on other platforms.
      setTimeout(_.bind(this.$el.focus, this.$el), 500)
    },
    
    desktopFocus: function () {
      if (utils.isDesktop) {
        this.focus()
      }
    },
    
    blur: function () {
      this.$el.blur()
    },
    
    events: {
      'input': 'updateOpenDoc'
    },
    
    updateOpenDoc: function () {
      this.model.set({
        content: this.$el.val(),
        cursorPos: this.$el.prop('selectionStart')
      })
      this.trigger('typing')
    },
    
    // Set CSS class for certain languages to adjust styling.
    // For char classes see: http://kourge.net/projects/regexp-unicode-block
    handleCharEncodings: function (doc) {
      var c = doc.get('content')
      var isCyrillic = !!c.match('[\u0400-\u04FF\u0500-\u052F]')
      this.$el.toggleClass('cyrillic', isCyrillic)
      
      // Arabic, Hebrew, Syriac & Thaana
      var isRTL = !!c.match('[\u0600-\u06FF\u0750-\u077F\u0590-\u05FF\u0700-\u074F\u0780-\u07BF]')
      this.$el.toggleClass('rtl', isRTL)
    },
    
    setPlaceholder: function () {
      this.$el.attr('placeholder', lang.emptyDoc)
    },
    
    setCursor: function (pos) {
      this.$el
      .prop('selectionStart', pos)
      .prop('selectionEnd', pos)
    },
    
    insertTab: function () {
      var pos = this.$el.prop('selectionStart')
      var v = this.$el.val()
      this.$el.val(v.substring(0, pos) + '\t' + v.substring(pos, v.length))
      this.setCursor(pos + 1)
      this.updateOpenDoc()
    },
    
    escapeRegex: function (str) {
      return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
    },
    
    applyHighlights: function (text, query) {
      var queryRegex = new RegExp(this.escapeRegex(query), 'gi')
      text = text
      .replace(/\n$/g, '\n\n')
      .replace(queryRegex, '<mark>$&</mark>')
      
      var ua = window.navigator.userAgent.toLowerCase()
      var isIE = !!ua.match(/msie|trident\/7|edge/)
      if (isIE) {
        // IE wraps whitespace differently in a div vs textarea, this fixes it
        text = text.replace(/ /g, ' <wbr>')
      }
      
      return text
    },
    
    updateHighlight: function (highlightedText) {
      $('.highlights').html(highlightedText)
    },
    
    importContent: function(content){
      this.model.set('content', content);
      this.setCursor(this.$el.val().length)
      this.render();
    },
    
    setTitle: function (title) {
      if(!title){
        var newTitle = this.model.get('content').match(/[^\s].{0,40}/);
        if(newTitle[0]){
          title = newTitle[0];
        } else {
          title = ''
        }
      }
      this.model.set('title', title)
    },
    
    handleAutoCorrect: function () {
      var pos = this.$el.prop('selectionStart')
      var v = this.$el.val()
      var beforeSpace = v.lastIndexOf(' ', pos - 1)
      var nearestCR = v.lastIndexOf('\n', pos - 1)
      
      var nearestDot = v.lastIndexOf('.', pos - 2)
      var nearestQuestionMark = v.lastIndexOf('?', pos - 2)
      var nearestExclamationMark = v.lastIndexOf('!', pos - 2)
      
      var charToCheck = [nearestExclamationMark, nearestQuestionMark, nearestDot]    
      
      //First space is special
      if(beforeSpace === -1){
        this.$el.val(v[0].toUpperCase() + v.substring(1, v.length))
      } else {
        for (let c of charToCheck) {
          // Capitalize first letter after full stop, exclamation mark or question mark
          if (v.substring(c + 1, pos) === v.substring(beforeSpace, pos) || v.substring(c + 2, pos) === v.substring(nearestCR + 1, pos)) {
            this.$el.val(v.substring(0, c + 2) + v[c + 2].toUpperCase() + v.substring(c + 3, v.length))
            break
          }
        }
      }
      
      // No two capitalized consecutive letters
      if (v[beforeSpace + 1] === v[beforeSpace + 1].toUpperCase() && v[beforeSpace + 2] === v[beforeSpace + 2].toUpperCase()) {
        this.$el.val(v.substring(0, beforeSpace + 2) + v[beforeSpace + 2].toLowerCase() + v.substring(beforeSpace + 3, v.length))
      }
      
      // substitute words
      var wordToCheck = v.substring(beforeSpace + 1, pos)
      var posGap = 0;
      if (Object.keys(this.wordToCorrect).includes(wordToCheck.toLowerCase())) {
        var newWord = this.wordToCorrect[wordToCheck.toLowerCase()]
        posGap = newWord.length - wordToCheck.length
        if (wordToCheck[0] === wordToCheck[0].toUpperCase()) {
          newWord = newWord[0].toUpperCase() + newWord.substring(1, newWord.length)
        }
        this.$el.val(v.substring(0, beforeSpace + 1) + newWord + v.substring(pos, v.length))
      }
      
      // substitute tokens
      var posGap = 0;
      for(let t of Object.keys(this.tokenToCorrect)){
        if (wordToCheck.toLowerCase().includes(t)) {
          newWord = wordToCheck.replace(t, this.tokenToCorrect[t]); 
          posGap = newWord.length - wordToCheck.length
          this.$el.val(v.substring(0, beforeSpace + 1) + newWord + v.substring(pos, v.length))
        }        
      }
      
      this.updateOpenDoc()
      this.setCursor(pos + posGap)
    },
    
    wordToCorrect: {
      '--': '–'
    },
    
    tokenToCorrect: {
      '...': '…'
    }
    
  })
  
  module.exports = EditorView
  