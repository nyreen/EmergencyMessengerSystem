var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET auth page. */
router.get('/auth', function(req, res, next) {
  res.render('auth', { title: 'redirect URI' });
});

/* GET admin home page. */
router.get('/adminhome', function(req, res, next) {
  res.render('adminhome', { title: 'Admin Home' });
});

/* GET view agencies page. */
router.get('/agencies', function(req, res, next) {
  res.render('agencies', { title: 'View' });
});

/* GET add agency page. */
router.get('/addagency', function(req, res, next) {
  res.render('addagency', { title: 'Add Agency' });
});

/* GET set parameter page. */
router.get('/setparams', function(req, res, next) {
  res.render('setparams', { title: 'Set Parameters' });
});

/* GET notify page. */
router.get('/messagenew', function(req, res, next) {
  res.render('messagenew', { title: 'View' });
});

/* GET mixins page. */
router.get('/mixins', function(req, res, next) {
  res.render('mixins', { title: 'View' });
});

/* GET mix page. */
router.get('/mix', function(req, res, next) {
  res.render('mix', { title: 'View' });
});

module.exports = router;
