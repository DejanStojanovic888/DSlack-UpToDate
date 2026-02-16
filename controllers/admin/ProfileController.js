const User = require('../../models/User');
const fs = require('fs');  
const path = require('path');  

const index = async (req, res) => {
    const user = await User.findById(req.session.user._id);
    res.render('admin/profile/index2', { user, title: 'Profile' });
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

const update = async (req, res) => {
    try {
        const { username, email, currentPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findById(req.session.user._id);

        // Validacija username-a
        if (!username || username.length < 3 || username.length > 20) {
            console.log('Invalid username');
            return res.redirect('/admin/profile');
        }

        // Proveri da li email već postoji u bazi (osim za trenutnog usera)
        const existingUser = await User.findOne({ email: email, _id: { $ne: user._id } });  // $ne = "not equal"
        if (existingUser) {
            console.log('Email već postoji');
            return res.redirect('/admin/profile');
        }

        user.username = username;
        user.email = email;

        // Ako želi da promeni šifru
        if (currentPassword && newPassword) {
            // Proveri trenutnu šifru
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                console.log('Pogrešna trenutna šifra');
                return res.redirect('/admin/profile');  // stavljamo ispred return da bi prekinuli dalju egzekuciju funkcije
            }

            // Proveri da li se nove šifre poklapaju
            if (newPassword !== confirmPassword) {
                console.log('Nove šifre se ne poklapaju');
                return res.redirect('/admin/profile');
            }

            // Validacija dužine
            if (newPassword.length < 5) {
                console.log('Šifra mora imati najmanje 5 karaktera');
                return res.redirect('/admin/profile');
            }

            // Hash nova šifra
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Sačuvaj izmene\
        await user.save();

        // Ažuriraj session
        req.session.user.username = user.username;
        req.session.user.email = user.email;

        req.session.save(() => {
            console.log('Profil uspešno ažuriran');
            res.redirect('/admin/profile');
        });

    } catch (error) {
        console.error(error);
        res.redirect('/admin/profile');
    }
};

module.exports = { index, uploadImage, update };