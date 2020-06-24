module.exports = {
  emptyDoc: 'Écrire …',
  search: 'Rechercher',
  footer: 'Ecrivez géno, écrivez libre !',
  delete: 'effacer',
  confirmDelete: 'Voulez-vous vraiment supprimer la note ?',
  share: 'partager',
  unshare: 'cacher',
  open: 'ouvrir',
  modified: 'dernière modification',
  updateCache: 'Une nouvelle version de Litewrite est disponible. La charger maintenant ?',
  wordCount: 'words',
  charCount: 'characters (spaces included)',
  welcome: require('./welcome-fr.txt'),
  secondsAgo: function (x) {
    if (x === 1) return 'il y a une seconde'
    return 'il y a ' + x + ' secondes'
  },
  minutesAgo: function (x) {
    if (x === 1) return 'il y a une minute'
    return 'il y a ' + x + ' minutes'
  },
  hoursAgo: function (x) {
    if (x === 1) return 'il y a une heure'
    return 'il y a ' + x + ' heures'
  },
  daysAgo: function (x) {
    if (x === 1) return 'il y a un jour'
    return 'il y a ' + x + ' jours'
  },
  weeksAgo: function (x) {
    if (x === 1) return 'il y a une semaine'
    return 'il y a ' + x + ' semaines'
  },
  monthsAgo: function (x) {
    if (x === 1) return 'il y a un mois'
    return 'il y a ' + x + ' mois'
  },
  yearsAgo: function (x) {
    if (x === 1) return 'il y a un an'
    return 'il y a ' + x + ' ans'
  }
}
