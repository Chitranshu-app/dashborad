let nodemailer = require("nodemailer");
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const conn = require('../db').promise();
exports.OTP = async (req, res, next) => {
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
    const [userdetail] = await conn.execute('Select * from register WHERE email=?', [
      decoded.email
    ]);
    if (userdetail[0].step == 3) {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "chitranshu@appventurez.com",
          pass: "vfvncglwqrfjlssq",
        },
      });
      let OTP = () => {
        let numbers = "0123456789";
        let OTP = "";
        for (let i = 0; i < 4; i++) {
          OTP += numbers[Math.floor(Math.random() * 10)];
        }
        return OTP;
      };
      const saveOTP = OTP();
      console.log(saveOTP);
      let mailOptions = {
        from: "chitranshu@appventurez.com",
        to: decoded.email,
        subject: "OTP verification",
        text:"your otp is :"+ saveOTP ,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: ");
        }
      });
      const [email] = await conn.execute(
        "SELECT `email` FROM `OTP` WHERE `email`=?",
        [decoded.email]
      );
      console.log(email[0]);
      //////////////////////////////////////////////////////
      if (email.length > 0) {
        await conn.execute('UPDATE OTP SET otp=? WHERE email=?', [
          saveOTP,
          decoded.email
        ]);
      }
      else {
        const [rows] = await conn.execute('INSERT INTO `OTP`(`email`,`otp`) VALUES(?,?)', [
          decoded.email,
          saveOTP
        ]);
      }
      return res.status(201).json({
        message: "otp send"
      });
    }
    else {
      return res.status(201).json({
        message: "Complete previous details"
      });
    }
  } catch (err) {
    next(err);
  }
}
