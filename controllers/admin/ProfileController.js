const User = require('../../models/User');
const fs = require('fs');  
const path = require('path');  

const index = async (req, res) => {
    const user = await User.findById(req.session.user._id);
    res.render('admin/profile/index', { user, title: 'Profile' });
};

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.redirect('/admin/profile');
        }
        
        const user = await User.findById(req.session.user._id);
        
        // Obriši stari fajl (samo ako nije default slika)
        if (user.profileImage && user.profileImage !== '/uploads/profiles/default.png') {
            const oldImagePath = path.join(__dirname, '../../public', user.profileImage);
            
            if (fs.existsSync(oldImagePath)) {  // Proveri da li fajl postoji 
                fs.unlinkSync(oldImagePath);  // Brišemo fajl
            }
        }

        // Sačuvamo path u bazi
        const imagePath = '/uploads/profiles/' + req.file.filename;
        await User.findByIdAndUpdate(req.session.user._id, { 
            profileImage: imagePath 
        });
        
        // Ažuriramo session
        req.session.user.profileImage = imagePath;
        
        res.redirect('/admin/profile');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/profile');
    }
};

module.exports = { index, uploadImage };