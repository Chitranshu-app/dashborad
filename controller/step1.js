const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const conn = require('../db').promise();


exports.step1 = async(req,res,next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        if(
            !req.headers.authorization ||
            !req.headers.authorization.startsWith('Bearer') ||
            !req.headers.authorization.split(' ')[1]
        ){
            return res.status(422).json({
                message: "Please provide the token",
            });
        }

        const theToken = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(theToken, 'the-super-strong-secrect');

        const [step1]=await conn.execute('SELECT step FROM register WHERE email=?',[decoded.email]);
       // console.log(step1);
        const st = step1[0].step;
        //console.log(st);
        if (st==0){
    
        const [rows] = await conn.execute('UPDATE register SET userName=?, age=?, gender=?,step=1 WHERE email=?',[
            req.body.userName,
            req.body.age,
            req.body.gender,
            decoded.email
        ]);

        if (rows.affectedRows === 1) {
            return res.status(201).json({
                message: "Data updated successfully .",
            });
        }
    }
    else  return res.status(422).json({
        message:"you have already completed step 1"
    })
        
    }catch(err){
        next(err);
    }
}