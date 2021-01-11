const { Router } = require('express');
const router = Router();
const usersService = require('./accounts.service');


router.post('/auth', authenticate);
router.get('/projects', getUserProjects);
router.post('/update', updateWorkTime);
router.post('/screenshot', screenshot);

module.exports = router;

function authenticate(req, res, next) {
    usersService.authenticate(req.body)
        .then(account => account ? res.json(account) : res.status(400).json({ message: 'Email or password is incorrect' }))
        .catch(err => next(err));
}

function getUserProjects(req, res, next) {
  const token = req.headers.authorization.split(' ')[1];
  usersService.getUserProjects(token)
    .then(account => res.json(account))
    .catch(err => next(err));
}

function updateWorkTime(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];
    usersService.updateWorkTime(token, req.body)
        .then(response => res.json(response))
        .catch(err => next(err));
}

function screenshot(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];

    usersService.takeScreenshot(token, req.body)
        .then(response => res.json(response))
        .catch(err => next(err));
}


