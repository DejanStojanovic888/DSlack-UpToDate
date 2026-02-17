const User = require('../../models/User');
const fs = require('fs');  
const path = require('path');  
const bcrypt = require('bcryptjs');
//  using bcrypt.compare() and bcrypt.genSalt() without importing the bcryptjs package at the top of the file.
//  bcrypt is undefined, which causes an error and likely destroys your session.

const index = async (req, res) => {
    const user = await User.findById(req.session.user._id);
    const message = req.session.message || '';
    if (req.session.message) {
        delete req.session.message;
    }
    res.render('admin/profile/index3', { user, title: 'Profile', message });
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



// GET: Prikaži edit formu
const showEdit = async (req, res) => {
    const user = await User.findById(req.session.user._id);
    res.render('admin/profile/edit', { user, title: 'Edit Profile' });
};

// POST: Ažuriraj profile
const update = async (req, res) => {
    try {
        const { 
            username, 
            email, 
            newPassword, 
            confirmNewPassword, 
            currentEmail, 
            currentPassword 
        } = req.body;

        // Validacija obaveznih polja (za sigurnosnu proveru)
        if (!currentEmail || !currentPassword) {
            console.log('Trenutni email i šifra su obavezni');
            return res.redirect('/admin/profile/edit');
        }

        const user = await User.findById(req.session.user._id);

        // SIGURNOSNA PROVERA 1: Trenutni email
        if (user.email !== currentEmail) {
            console.log('Trenutni email se ne poklapa');
            return res.redirect('/admin/profile/edit');
        }

        // SIGURNOSNA PROVERA 2: Trenutna šifra
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            console.log('Pogrešna trenutna šifra');
            return res.redirect('/admin/profile/edit');
        }

        // Ako je prošla sigurnosna provera, nastavi sa ažuriranjem

        // AŽURIRANJE USERNAME-A
        if (username && username !== user.username) {
            if (username.length < 3 || username.length > 20) {
                console.log('Username mora imati između 3 i 20 karaktera');
                return res.redirect('/admin/profile/edit');
            }
            user.username = username;
            req.session.user.username = username;
        }

        // AŽURIRANJE EMAIL-A
        if (email && email !== user.email) {
            // Proveri da li novi email već postoji
            const existingUser = await User.findOne({ 
                email: email, 
                _id: { $ne: user._id } 
            });
            if (existingUser) {
                console.log('Email već postoji u bazi');
                return res.redirect('/admin/profile/edit');
            }
            user.email = email;
            req.session.user.email = email;
        }

        // AŽURIRANJE ŠIFRE (opciono)
        if (newPassword) {
            // Proveri da li su obe nove šifre unete
            if (!confirmNewPassword) {
                console.log('Potvrdi novu šifru');
                return res.redirect('/admin/profile/edit');
            }

            // Proveri da li se nove šifre poklapaju
            if (newPassword !== confirmNewPassword) {
                console.log('Nove šifre se ne poklapaju');
                return res.redirect('/admin/profile/edit');
            }

            // Validacija dužine
            if (newPassword.length < 5) {
                console.log('Nova šifra mora imati najmanje 5 karaktera');
                return res.redirect('/admin/profile/edit');
            }

            // Ne dozvoli istu šifru kao trenutna
            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                console.log('Nova šifra mora biti različita od trenutne');
                return res.redirect('/admin/profile/edit');
            }

            // Hash nova šifra
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Sačuvaj sve izmene
        await user.save();

        req.session.save(() => {
            console.log('Profil uspešno ažuriran');
            res.redirect('/admin/profile');
        });

    } catch (error) {
        console.error('Greška pri ažuriranju profila:', error);
        res.redirect('/admin/profile/edit');
    }
};

module.exports = { 
    index, 
    uploadImage,
    showEdit,
    update
};