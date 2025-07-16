const fs = require('fs')
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../model/tourModel');
const User = require('../../model/userModel');
const Review = require('../../model/reviewModel');
const path = require('path');


// dotenv.config({ path: '../../config.env' });
dotenv.config({ path: path.resolve(__dirname, '../../config.env') });

console.log('DATABASE from .env:', process.env.DATABASE);


const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => console.log('DB connection successful!'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//import data into database
const importData = async () => {
    try {
        await Tour.create(tours);
        //await Review.create(reviews ,{validateBeforeSave: false});
        //await User.create(users, {validateBeforeSave: false});

        console.log("data loaded");
        process.exit();
    }
    catch (err) {
        //console.log(err)
        if (err.name === 'ValidationError') {
            console.log(err.message)
        }
        else{
            console.log(err)
        }
    }
}

//Delete data from database
const deleteData = async () =>{
    try {
        await Tour.deleteMany();
        //await Review.deleteMany();
        //await User.deleteMany();
        process.exit()
        console.log("Data deleted successfully")
    }
    catch (err) {
        console.log(err)
    }
}
if (process.argv[2] === '--import') {
    importData()
}
else if (process.argv[2] === '--delete'){
    deleteData()
}
