const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const conn = require('../db').promise();

exports.register = async(req,res,next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{

        const [email] = await conn.execute(
            "SELECT `email` FROM `register` WHERE `email`=?",
            [req.body.email]
          );

        if (email.length > 0) {
            return res.status(201).json({
                message: "The E-mail already in use",
            });
        }

        const [contact] = await conn.execute(
            "SELECT `contact` FROM `register` WHERE `contact`=?",
            [req.body.contact]
          );

        if (contact.length > 0) {
            return res.status(201).json({
                message: "The contact already in use",
            });
        }
        const hashPass = await bcrypt.hash(req.body.userPass, 12);

        const [rows] = await conn.execute('INSERT INTO `register`(`email`,`contact`,`userPass`) VALUES(?,?,?)',[
            req.body.email,
            req.body.contact,
            hashPass
        ]);

        if (rows.affectedRows === 1) {
            return res.status(201).json({
                message: "The user has been successfully inserted.",
            });
        }
        
    }catch(err){
        next(err);
    }
}