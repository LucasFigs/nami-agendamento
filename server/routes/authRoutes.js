const express = require('express');
const { registrar, login } = require('../controllers/authController');

const router = express.Router();

router.post('/registro', registrar);
router.post('/login', login);

// Rota de teste
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Rota de autenticação funcionando!'
    });
});

module.exports = router;