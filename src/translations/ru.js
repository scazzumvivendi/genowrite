module.exports = {
  emptyDoc: 'Пишите …',
  search: 'Найти',
  footer: 'Пишите с легкостью! Исходный код открыт.',
  delete: 'Удалить',
  confirmDelete: 'Вы уверены, что хотите удалить документ?',
  share: 'опубликовать',
  unshare: 'отменить публикацию',
  open: 'открыть',
  modified: 'изменён',
  updateCache: 'Доступна новая версия Litewrite. Загрузить?',
  wordCount: 'words',
  charCount: 'characters (spaces included)',
  welcome: require('./welcome-ru.txt'),
  secondsAgo: function (x) {
    return timeAgoWithPlural('секунду_секунды_секунд', x)
  },
  minutesAgo: function (x) {
    return timeAgoWithPlural('минуту_минуты_минут', x)
  },
  hoursAgo: function (x) {
    return timeAgoWithPlural('час_часа_часов', x)
  },
  daysAgo: function (x) {
    return timeAgoWithPlural('день_дня_дней', x)
  },
  weeksAgo: function (x) {
    return timeAgoWithPlural('неделю_недели_недель', x)
  },
  monthsAgo: function (x) {
    return timeAgoWithPlural('месяц_месяца_месяцев', x)
  },
  yearsAgo: function (x) {
    return timeAgoWithPlural('год_года_лет', x)
  }
}

function timeAgoWithPlural (word, number) {
  var num = number > 1 ? (number + ' ') : ''
  return num + plural(word, +number) + ' назад'
}

function plural (word, num) {
  var forms = word.split('_')
  return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2])
}
