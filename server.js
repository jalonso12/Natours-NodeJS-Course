const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log('DB connection stablished!'));

const APP = require('./app');

// SERVER STARTER
const port = process.env.PORT || 8000;
APP.listen(port, 'localhost', () => {
    console.log(`<--- App running on ${process.env.NODE_ENV} (Port: ${port}) --->`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);

    console.log('Shutting down program...')
    process.exit(1);
});