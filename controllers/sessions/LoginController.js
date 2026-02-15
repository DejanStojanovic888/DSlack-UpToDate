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
        req.session.save((err) => {
            if (err) {
                console.log("Session Save Error:", err);
                return res.redirect("/login");
            }
            res.redirect("/admin/dashboard");  // redirect inside the callback to ensure it happens after the session is saved
        });
        // res.redirect("/admin/dashboard");

    } catch (error) {
        console.log(error.message);
        res.redirect("/login");
    }
    
};

module.exports = LoginController;