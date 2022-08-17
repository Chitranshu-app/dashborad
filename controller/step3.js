const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const conn = require('../db').promise();

exports.step3 = async(req,res,next) => {
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


        let key=(req.body.education);

        const [step1]=await conn.execute('SELECT step FROM register WHERE email=?',[decoded.email]);
        //console.log(step1);
        const st= step1[0].step;

        if (st==2){
        let st1;
        if (key==="1"){
             st1="Graduate"
        }
        else if(key==="2"){
            st1="PostGraduate"
        }
        else {
            throw new Error('invalid key')
        }
        const [rows] = await conn.execute('UPDATE register SET education=?,step=3 WHERE email=?',[
            st1,
            decoded.email
        ]);

        if (rows.affectedRows === 1) {
            return res.status(201).json({
                message: "Data updated successfully .",
            });
        }
    }
    else if (st<2){
        return res.status(422).json({
            message:"Complete the previous steps"
        })
    }
    else return res.status(422).json({
        message:"you have already completed this step"
    })
        
    }catch(err){
        next(err);
    }
}