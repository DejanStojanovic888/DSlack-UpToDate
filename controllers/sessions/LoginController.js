const User = require("../../models/User");
const bcrypt = require("bcryptjs");

const LoginController = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email }); 
        if(!user) {
            return res.redirect("/");
        }
        const bpass = await bcrypt.compare(password, user.password); 
        if(!bpass) {
            return res.redirect("/");
        }
        req.session.user = user;  
        res.redirect("/admin/dashboard");

    } catch (error) {
        console.log(error.message);
        res.redirect("/login");
    }
    
};

module.exports = LoginController;