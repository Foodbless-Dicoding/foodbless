require('dotenv').config()

const PORT = process.env.PORT || 5000;
const express = require('express');
const usersRoutes = require('./routes/users');
const middlewareLogRequest = require('./middleware/logs');
const upload = require('./middleware/multer');
const userModel = require('./models/users');
const sellerModel = require('./models/sellers');
const adminModel = require('./models/admins');
const foodModel = require('./models/foods');
const orderModel = require('./models/orders');
const cityModel = require('./models/cities');
const provinceModel = require('./models/provincies');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middlewareLogRequest);
    app.use('/assets', express.static('public/images'))

app.use('/users', usersRoutes);
app.post('/usersCreate', upload.single('photo'), async (req, res, next) => {
    try {
        let imagePath = null;
        if (req.file) {
            imagePath = req.file.filename; // Ambil nama file dari multer
        }
        const userData = {
            name: req.body.name,
            email: req.body.email,
            address: req.body.address,
            password: req.body.password,
            photo: imagePath // Simpan nama file foto ke database
        };
        await userModel.createNewUser(userData);
        res.status(201).json({ message: 'User berhasil ditambahkan' });
    } catch (error) {
        next(error); // Lewatkan error ke middleware error handling
    }
});



app.post('/loginUser', async (req, res, next) => {
    try {
        const dataMasuk = {
            email: req.body.email,
            password: req.body.password
        };

        if (!dataMasuk.email || !dataMasuk.password) {
            throw new Error('Email dan password harus diisi');
        }
        console.log(dataMasuk);
        const token = await userModel.authenticateUser(dataMasuk);
        const userData = await userModel.getUserByEmail(dataMasuk.email);

        res.status(200).json({
            message: 'Login berhasil',
            token: token,
            data: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                address: userData.address
            }
        });
    } catch (error) {
        next(error); 
    }
});

app.post('/upload',upload.single('photo'),(req, res) => {
    res.json({
        message: 'Upload berhasil'
    })
})

//USER ROUTE
app.post('/userRegist', async (req, res, next) => {
    try {
        // const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        // const updatedAt = createdAt;
        const userData = {
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            provinceId: req.body.provinceId,
            cityId: req.body.cityId,
            address: req.body.address,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        };
        console.log(userData);
        if (!userData.email || !userData.password || !userData.name || !userData.address || !userData.latitude || !userData.longitude) {
            throw new Error('Semua Kolom Wajib Di Isi!!!');
        }
        
        await userModel.createNewUser(userData);
        res.status(201).json({ status: '200',
        message: 'Registrasi User Berhasil' });
    } catch (error) {
        next(error); 
    }
});

app.post('/userLogin', async (req, res, next) => {
    try {
        const reqDataLogin = {
            email: req.body.email,
            password: req.body.password
        };

        if (!reqDataLogin.email || !reqDataLogin.password) {
            throw new Error('Email dan password harus diisi');
        }
        
        const token = await userModel.authenticateUser(reqDataLogin);
        const userData = await userModel.getUserByEmail(reqDataLogin.email);

        res.status(200).json({
            message: 'Login berhasil',
            token: token,
            data: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                provinceId: userData.provinceId,
                cityId: userData.cityId,
                address: userData.address,
                latitude: userData.latitude,
                longitude: userData.longitude
            }
        });
    } catch (error) {
        next(error); 
    }
});

// SELERS ROUTE
// Registrasi Seller
app.post('/sellerRegist', async (req, res, next) => {
    try {
        const dataSeller = {
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            provinceId: req.body.provinceId,
            cityId: req.body.cityId,
            address: req.body.address,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        };

        if (!dataSeller.email || !dataSeller.password || !dataSeller.name || !dataSeller.address || !dataSeller.latitude || !dataSeller.longitude) {
            throw new Error('Semua Kolom Wajib Di Isi!!!');
        }
        
        await sellerModel.createNewSeller(dataSeller);
        res.status(201).json({ status: '200', message: 'Registrasi Seller Berhasil' });
    } catch (error) {
        next(error); 
    }
});

// Login Seller
app.post('/sellerLogin', async (req, res, next) => {
    try {
        const reqDataLogin = {
            email: req.body.email,
            password: req.body.password
        };

        if (!reqDataLogin.email || !reqDataLogin.password) {
            throw new Error('Email dan password harus diisi');
        }
        
        const token = await sellerModel.authenticateSeller(reqDataLogin);
        const sellerData = await sellerModel.getSellerByEmail(reqDataLogin.email);

        res.status(200).json({
            message: 'Login berhasil',
            token: token,
            data: {
                id: sellerData.id,
                email: sellerData.email,
                name: sellerData.name,
                provinceId: sellerData.provinceId,
                cityId: sellerData.cityId,
                address: sellerData.address,
                latitude: sellerData.latitude,
                longitude: sellerData.longitude
            }
        });
    } catch (error) {
        next(error); 
    }
});



// Foods
// Buat data makanan
app.post('/createFood', upload.single('photo'), async (req, res, next) => {
    try {
        let imagePath = null;
        if (req.file) {
            imagePath = req.file.filename; 
        }
        const foodData = {
            sellerId: req.body.sellerId,
            name: req.body.name,
            price: req.body.price,
            stock: req.body.stock,
            photo: imagePath,
            token: req.headers.authorization 
        };
        await foodModel.createNewFood(foodData);
        res.status(201).json({ 
            status: 200,
            message: 'Berhasil Membuat Data Makanan'
         });
    } catch (error) {
        next(error); 
    }
});

// ambil semua data makanan
app.get('/getAllFoods', async (req, res, next) => {
    try {

        const [foods] = await foodModel.getAllFoods();
        res.status(201).json({
            status: 200,
            message: 'Berhasil Mengambil Semua Data Makanan',
            foods: foods
        });
    } catch (error) {
        next(error);
    }
});

// ambil data makanan berdasarkan Id
app.get('/getFoodById', async (req, res, next) => {
    try {
        const foodId = req.body.id;
        const food = await foodModel.getFoodById(foodId);
        res.status(200).json({
            status: 200,
            message: 'Berhasil Mendapatkan Data Makanan',
            food: food
        });
    } catch (error) {
        next(error);
    }
});

app.delete('/deleteFood', async (req, res, next) => {
    try {
        const foodData = {
            id: req.body.id,
            sellerId: req.body.sellerId,
            token: req.headers.authorization 
        };
        await foodModel.deleteFood(foodData);
        res.status(201).json({ 
            status: 200,
            message: 'Berhasil Menghapus Data Makanan'
         });
    } catch (error) {
        next(error); 
    }
});

app.put('/updateFood', async (req, res, next) => {
    try {
        const foodData = {
            id: req.body.id,
            sellerId: req.body.sellerId,
            name: req.body.name,
            price: req.body.price,
            stock: req.body.stock,
            token: req.headers.authorization 
        };
        await foodModel.updateFood(foodData);
        res.status(201).json({ 
            status: 200,
            message: 'Berhasil meperbaharui Data Makanan'
         });
    } catch (error) {
        next(error); 
    }
});


// ORDER FOOD
app.post('/orderFood', async (req, res, next) => {
    try {
        const dataOrder = {
            foodId: req.body.foodId,
            sellerId: req.body.sellerId,
            userId: req.body.userId,
            amount: req.body.amount,
            token: req.headers.authorization
        };

        if (!dataOrder.foodId || !dataOrder.userId || !dataOrder.amount || !dataOrder.sellerId  ) {
            throw new Error('Semua Kolom Wajib Di Isi!!!');
        }
        
        await orderModel.createNewOrder(dataOrder);
        res.status(201).json({ message: 'Order Food Berhasil Sedang Menunggu Konfirmasi Toko' });
    } catch (error) {
        next(error); 
    }
});

app.get('/cityAll', async (req, res, next) => {
    try {

        const [cities] = await cityModel.getAllCities();
        res.status(201).json({
            status: 200,
            message: 'Berhasil Mengambil Semua Data Kota',
            cities: cities
        });
    } catch (error) {
        next(error);
    }
});

app.get('/cityById', express.json(), async (req, res, next) => {
    try {
        const id = req.query.id; 
        const city = await cityModel.getCityById(id);
        res.status(200).json({
            status: 200,
            message: 'Berhasil Mengambil Semua Data Kota Berdasarkan Provinsi',
            city: city
        });
    } catch (error) {
        next(error);
    }
});

app.get('/cityByProvinceId', express.json(), async (req, res, next) => {
    try {
        const provinceId = req.query.provinceId; 
        const cities = await cityModel.getCityByProvinceId(provinceId);
        res.status(200).json({
            status: 200,
            message: 'Berhasil Mengambil Semua Data Kota Berdasarkan Provinsi',
            cities: cities
        });
    } catch (error) {
        next(error);
    }
});

app.get('/provinceAll', async (req, res, next) => {
    try {

        const [provincies] = await provinceModel.getAllProvincies();
        res.status(201).json({
            status: 200,
            message: 'Berhasil Mengambil Semua Data Provinsi',
            provincies: provincies
        });
    } catch (error) {
        next(error);
    }
});

app.get('/provinceById', express.json(), async (req, res, next) => {
    try {
        const id = req.query.id; 
        const province = await provinceModel.getProvinceById(id);
        res.status(200).json({
            status: 200,
            message: 'Berhasil Mengambil Data Provinsi Berdasarkan Id',
            province: province
        });
    } catch (error) {
        next(error);
    }
});


// ADMIN
// Registrasi Admin
app.post('/adminRegist', async (req, res, next) => {
    try {
        const dataAdmin = {
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            provinceId: req.body.provinceId,
            cityId: req.body.cityId,
            address: req.body.address,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        };

        if (!dataAdmin.email || !dataAdmin.password || !dataAdmin.name || !dataAdmin.address || !dataAdmin.latitude || !dataAdmin.longitude) {
            throw new Error('Semua Kolom Wajib Di Isi!!!');
        }
        
        await adminModel.createNewAdmin(dataAdmin);
        res.status(201).json({ status: '200', message: 'Registrasi Admin Berhasil' });
    } catch (error) {
        next(error); 
    }
});

// Login Admin
app.post('/adminLogin', async (req, res, next) => {
    try {
        const reqDataLogin = {
            email: req.body.email,
            password: req.body.password
        };

        if (!reqDataLogin.email || !reqDataLogin.password) {
            throw new Error('Email dan password harus diisi');
        }
        
        const token = await adminModel.authenticateAdmin(reqDataLogin);
        const adminData = await adminModel.getAdminByEmail(reqDataLogin.email);

        res.status(200).json({
            message: 'Login berhasil',
            token: token,
            data: {
                id: adminData.id,
                email: adminData.email,
                name: adminData.name,
                provinceId: adminData.provinceId,
                cityId: adminData.cityId,
                address: adminData.address,
                latitude: adminData.latitude,
                longitude: adminData.longitude
            }
        });
    } catch (error) {
        next(error); 
    }
});







app.use((err, req, res, next) => {
    res.json({
        message: err.message
    })
})

app.listen(PORT, () => {
    console.log(`Server berhasil di running di port ${PORT}`);
})