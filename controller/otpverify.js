let nodemailer = require("nodemailer");
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const conn = require('../db').promise();
exports.verifyOTP = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith('Bearer') ||
            !req.headers.authorization.split(' ')[1]
        ) {
            return res.status(422).json({
                message: "Please provide the token",
            });
        }
        const theToken = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(theToken, 'the-super-strong-secrect');
console.log(decoded.email);
        await conn.execute(
            "DELETE FROM `OTP` WHERE time < (NOW() - INTERVAL 10 MINUTE) AND email=?",[decoded.email]
        );
        // const OTPToken = await conn.execute('Select OTP from OTP WHERE email=?', [
        //     decoded.email]);
        //const token = OTPToken[0][0].OTP
        //const isTokenExpired = token => Date.now() >= (JSON.parse(atob(token.split('.')[1]))).exp * 1000
        let [row] = await conn.execute(
            "Select * FROM `OTP` WHERE email=?", [decoded.email]
        );
        if (row.length == 0) {
            return res.json({
                message: "OTP Expired! Please try again"
            })
        } else {
            const OTP = row[0].otp
            console.log(OTP);
            if (OTP == req.body.otp) {
                await conn.execute('UPDATE register SET status=? WHERE email=?', [
                    true,
                    decoded.email
                ]);
                return res.status(201).json({
                    message: "verify"
                });
            }
            else {
                return res.status(201).json({
                    message: "OTP is not  matched"
                });
            }
        }
    } catch (err) {
        next(err);
    }
}

