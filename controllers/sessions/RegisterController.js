const User = require("../../models/User");
const bcrypt = require("bcryptjs"); 
const RegisterController = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const testUser = await User.findOne({ email: email }); 
        if(testUser) {
            return res.status(400).json({ message: "User already exists" }); 
        }   
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt); 

        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword  
        });
        await newUser.save();
        res.redirect("/");  
            
    } catch (error) {
        console.log(error.message);
        res.redirect("/register");
    }
    
}

module.exports = RegisterController;