var Backbone = require('backbone')
var _ = require('underscore')
var FileSaver = require('file-saver')
var EntriesView = require('./entries')
var EditorView = require('./editor')
var DateView = require('./date')
var AsideView = require('./aside')
var SearchView = require('./search')
var ShareView = require('./share')
var DeleteView = require('./delete')
var WordCountView = require('./wordcount')
var utils = require('../utils')

// Enable search if at least this number of documents
var searchMinDocCount = 10

var AppView = Backbone.View.extend({
  el: 'body',

  initialize: function (options) {
    _.bindAll(this, 'toggleSearch')

    this.litewrite = options.litewrite

    this.editor = new EditorView({ model: this.model, litewrite: this.litewrite })
    this.aside = new AsideView({ model: this.model, collection: this.collection })
    this.search = new SearchView({ model: this.litewrite.state })
    this.entries = new EntriesView({ litewrite: this.litewrite, collection: this.collection })
    this.date = new DateView({ model: this.model })
    this.wordCount = new WordCountView({ model: this.model })
    var deleteView = new DeleteView({ model: this.model })
    var share = new ShareView({ model: this.model, collection: this.collection, remote: options.remote })

    this.litewrite
      .on('ready', this.editor.render)
      .on('ready', this.editor.desktopFocus)
      .on('connected', share.show)
      .on('disconnected', share.hide)

    this.collection
      .on('update', this.toggleSearch)

    this.search
      .on('focus', this.aside.show)
      .on('blur', this.editor.desktopFocus)

    this.editor
      .on('typing', this.aside.desktopHide)

    this.aside
      .on('opening', this.editor.blur)

    this.entries
      .on('open', this.editor.desktopFocus)
      .on('open', this.aside.hide)

    deleteView
      .on('delete', this.editor.render)
      .on('delete', this.editor.focus)
      .on('delete', share.unshare)
  },

  events: {
    'click #add': 'newDoc',
    'touchend #add': 'newDoc',
    'click #menu-button': 'toggleAside',
    'touchend #menu-button': 'toggleAside',
    'keydown': 'handleKey',
    'keyup': 'closeAside',
    'click #confirm-title': 'setTitle',
  },

  newDoc: function () {
    if (utils.isMobile) {
      this.aside.hide()
    }
    if (!this.model.isEmpty()) {
      this.collection.addNew()
    }
    this.editor.focus()
    this.search.clear()
    return false
  },

  toggleAside: function () {
    this.aside.toggle()
    return false
  },

  toggleSearch: function () {
    if (this.collection.length >= searchMinDocCount) {
      this.search.show()
    } else {
      this.search.hide()
    }
  },

  // Global key handler
  handleKey: function (e) {
    var tabKey = e.keyCode === 9
    var spaceKey = e.keyCode === 32

    var sKey = e.keyCode === 83
    var saveShortcut = sKey && e.ctrlKey

    if (tabKey && !e.shiftKey) {
      this.editor.insertTab()
    }

    if (tabKey || saveShortcut) {
      e.preventDefault()
      return
    }

    const hotKey = (utils.isMac && e.altKey) || e.ctrlKey
    if (!hotKey && spaceKey) {
      this.editor.handleAutoCorrect()
    }

    if (!hotKey) return

    var shortcut = this.shortcuts[e.keyCode]
    if (!shortcut) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    shortcut.call(this, e)
  },

  shortcuts: {
    32: function space () {
      this.aside.toggle()
    },
    68: function d () {
      this.newDoc()
    },
    69: function e () {
      this.exportDoc()
    },
    73: function i () {
      this.importDoc()
    },
    38: function up () {
      this.previous()
    },
    40: function down () {
      this.next()
    },
    70: function f () {
      this.search.focus()
    }
  },

  previous: function () {
    var id = this.entries.previous(this.model.id)
    if (id) {
      this.litewrite.open(id)
    }
  },

  next: function () {
    var id = this.entries.next(this.model.id)
    if (id) {
      this.litewrite.open(id)
    }
  },

  closeAside: function (e) {
    var isModKey = e.keyCode === 18
    if (!isModKey) {
      return
    }
    if (this.search.isFocused()) {
      return
    }
    this.aside.hide()
  },

  exportDoc: function () {
    var blob = new Blob([this.model.attributes.content], { type: 'text/plain;charset=utf-8' })
    FileSaver.saveAs(blob, this.model.attributes.title+'.txt')
  },

  importDoc: function () {
    var input = document.createElement('input')
    input.type = 'file'

    input.onchange = e => {
      var file = e.target.files[0]

      var reader = new FileReader()
      reader.readAsText(file, 'UTF-8')

      reader.onload = readerEvent => {
        var content = readerEvent.target.result
        this.editor.importContent(content)
        this.editor.setTitle(readerEvent.target.fileName);
      }
    }
    input.click();
  },

  setTitle: function (e){
    this.editor.setTitle(this.$el.find('#title')[0].value);
    this.entries.update(this.model);
  }

})

module.exports = AppView
