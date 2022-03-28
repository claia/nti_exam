const { check } = require('express-validator')
module.exports = {
    validateConfirmPassword: check('confirmPassword')
        .trim()
        .isLength({ min: 4, max: 16 })
        .withMessage('Password must be between 4 to 16 characters')
        .custom(async(confirmPassword, { req }) => {
            const password = req.body.password
            if (password !== confirmPassword) {
                throw new Error('Passwords must be same')
            }
        }),
}