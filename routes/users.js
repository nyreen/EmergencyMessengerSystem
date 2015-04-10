var express = require('express');
var router = express.Router();

/*
 * GET userlist.
 */
router.get('/contacts', function(req, res) {
    var db = req.db;

    db.collection('contacts').find().toArray(function (err, items) {
        res.json(items);
    });
});

/*
 * POST to adduser.
 */
router.post('/contacts', function(req, res) {
    var db = req.db;
    db.collection('contacts').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * POST to accesstokens.
 */
router.post('/accesstokens', function(req, res) {
    var db = req.db;
    db.collection('accesstokens').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * DELETE to deleteuser.
 */
router.delete('/deleteuser/:id', function(req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('contacts').removeById(userToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

/*
 * GET admin account.
 */
router.get('/adminaccount', function(req, res) {
    var db = req.db;

    db.collection('adminaccount').find().toArray(function (err, items) {
        res.json(items);
    });
});

module.exports = router;