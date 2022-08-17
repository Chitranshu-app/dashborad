const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const conn = require('../db').promise();

exports.step2 = async(req,res,next) => {
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
        //console.log(step1);
        const st = step1[0].step;
        //console.log(st);
        if (st==1){



        const [rows] = await conn.execute('UPDATE register SET address=?,step=2 WHERE email=?',[
            req.body.address,
            decoded.email
        ]);

        if (rows.affectedRows === 1) {
            return res.status(201).json({
                message: "Data updated successfully .",
            });
        }
    }
    else if (st<1){
        return res.status(422).json({
            message:"Please complete step 1 first"
        })
    
    }
    else return res.status(422).json({
        message:"You have already completed this step"
    })

        
    }catch(err){
        next(err);
    }
}