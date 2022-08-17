const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator');
const conn = require('../db.js').promise();
exports.login = async (req,res,next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }
    try{
        const [row] = await conn.execute(
            "SELECT * FROM `register` WHERE `email`=?",
            [req.body.email]
          );
        if (row.length === 0) {
            return res.status(422).json({
                message: "Invalid email address",
            });
        }
        const passMatch = await bcrypt.compare(req.body.userPass, row[0].userPass);
        if(!passMatch){
            return res.status(422).json({
                message: "Incorrect password",
            });
        }
        const theToken = jwt.sign({email:row[0].email},'the-super-strong-secrect',{ expiresIn: '1h' });
        return res.json({
            token:theToken,
            message:"/getFirstStep"
        });
    }
    catch(err){
        next(err);
    }
}

