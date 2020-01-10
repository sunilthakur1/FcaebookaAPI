const user = require('../model/User');
let jwt = require('jsonwebtoken');
let config = require('../config');
const bcrypt = require('bcryptjs');

class AuthController{

     login(req, res){
      user.findOne({email : req.body.email}, function(err, user){
        if(err){
            return res.status(500).send('Error on the server');
            
        }

        console.log(req.body.email);
        
        
        if(!user){
            return res.status(401).json([{
                success : false,
                message: 'Incorrent username or password',
                token : null
            }]);
        }
        
        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if(!passwordIsValid){
            return res.status(401).json([{
                success : false,
                message: 'Incorrent username or password',
                token : null
            }]);
        }

      
        let token = jwt.sign({id : user._id.toString()},config.secret, 
            {
                expiresIn : '24h'
            }) ;
            user.tokens = user.tokens.concat({ token: token });
             user.save();
    
           return res.status(200).json([{
                success : true,
                message : 'Authentication successful',
                token : token,
                user : user,
            }]);
      });
    }


    register(req, res){
        var hashedPassword = bcrypt.hashSync(req.body.password, 8);
        var image = "man.png";

        console.log(req.body);

        if(req.body.gender == "Female"){
            image = "female.png";
        }
        user.create({
            firstname : req.body.fname,
            lastname : req.body.lname,
            dob : req.body.dob,
            gender: req.body.gender,
            phonenumber: req.body.phone,
            email : req.body.email,
            password : hashedPassword,
            image:image
        },
        
        function(err, user){
            if(err) return res.status(500).send(err)
        
            let token = jwt.sign({id : user._id},config.secret, 
                {
                    expiresIn : '24h'
                }) ;
                user.tokens = user.tokens.concat({ token: token });
                user.save();

             return res.status(200).json([{
                    success : true,
                    message : 'Authentication successful',
                    token : token,
                    user : user,
                }]);

        }
        
        );
        
        }


        checkEmailAvailability(req, res){
           
            
            user.findOne({email : req.body.email}, function(err, user){
                if(err){
                    return res.status(500).send('Error on the server');
                    
                }
        
                if(user){
                   
                    return res.send({
                        success : false,
                        message: 'Email Already Exists',
                        
                    });
                }else{
                    return res.send({
                        success : true,
                        message: 'Email Available',
                        
                    });
                }
                
            })
        }

 
}

module.exports = AuthController;