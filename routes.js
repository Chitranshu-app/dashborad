const router = require('express').Router();
const {body} = require('express-validator');
const {register} = require('./controller/registerControllers');
 const {login} = require('./controller/loginController');
const {getUser} = require('./controller/getUserController');
const {step1} = require ('./controller/step1')
const {step2} = require ('./controller/step2')
const {step3} = require ('./controller/step3');
const { OTP } = require('./controller/otpsend');
const { verifyOTP } = require('./controller/otpverify');


router.post('/register', [
    body('email',"Invalid email address")
    .notEmpty()
    .escape()
    .trim().isEmail(),
    body('contact',"Invalid contact number").notEmpty().trim().escape().isLength(10),
    body('userPass',"The Password must be of minimum 4 characters length").notEmpty().trim().isLength({ min: 4 }),
], register);


router.post('/login',[
    body('email',"Invalid email address")
    .notEmpty()
    .escape()
    .trim().isEmail(),
    body('userPass',"The Password must be of minimum 4 characters length").notEmpty().trim().isLength({ min: 4 }),
],login);

router.get('/getuser',getUser);


router.put('/step1',[
    body('userName',"must be of minimum 3 of length")
    .notEmpty()
    .escape()
    .trim().isLength({min:3}),
    body('age',"Invalid age").notEmpty().trim().isNumeric(),
    body('gender',"Invalid gender")
    .notEmpty().trim().escape(),
],step1);

router.put('/step2',[
    body('address',"must be of minimum 3 of length")
    .notEmpty()
    .escape()
    .trim().isLength({min:3}),
   
],step2);

router.put('/step3',[
    body('education',"must be valid key ")
    .notEmpty()
    .escape()
    .trim().isLength({min:1}),
   
],step3);


router.post('/sendotp',OTP);


router.post('/verifyotp',[
    body('otp','otp doesnot matched')
],verifyOTP)


module.exports = router;

// {
//     "userName":"vk@gmail.com",
//     "age":23,
//     "gender":"male"
    
// }

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRldmFAZ21haWwuY29tIiwiaWF0IjoxNjU5NjEwMDU5LCJleHAiOjE2NTk2MTM2NTl9.NhI7m6YF587RzChfXP77xyfhmVx-MrJc4PUpEi-vVC4