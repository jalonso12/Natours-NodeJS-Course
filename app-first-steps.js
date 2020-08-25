const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();
// Middleware
app.use(express.json());

// Local Middleware
app.use((req, res, next) => {
    console.log('Middleware hobbit in action');
    next();
});

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 3th Party Middleware
app.use(morgan('dev'));

// This equals to the raw node http methods
/*app.get('/', (req, res) => {
    res
        .status(200)
        .json({
            message: 'Hello from server side :D', 
            app: 'Natours'
        });
});

app.post('/', (req, res) => {
    res.send('You can post to this endpoint c:');
}); */

// Loads the JSON
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

// Creates the API with the data information plus some additions (status & results)
const getAllTours = (req, res) => {
    console.log(req.requestTime);
    res
        .status(200)
        .json({
            status: 'success',
            requestedAt: req.requestTime,
            results: tours.length,
            data: {
                tours
            }
        });
};


const getSpecificTour = (req, res) => {
    //console.log(req.params);

    const id = req.params.id * 1; // Converts number strings into integers

    // Cycles through the data until it finds the param of the url
    const tour = tours.find(el => el.id === id);

    //if(id > tours.length) {
    if(!tour) {
        return res
                .status(404)
                .json({
                    status: 'Failed',
                    message: 'Invalid id'    
                })
    };

    res
        .status(200)
        .json({
            status: 'success',
            data: {
                tour
            }
        });
};

// Adds data to the API and JSON file.
const createTour = (req, res) => {
    //console.log(req.body);

    const newID = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newID }, req.body);

    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res
            .status(201) // 201 stads for created
            .json({ 
                status: 'success',
                data: {
                    tour: newTour
                }
            }); 
    });
};

// Method to update information on an item
const updateTour = (req, res) => {
    const id = req.params.id * 1;

    if(id > tours.length) {
        return res
                .status(404)
                .json({
                    status: 'Failed',
                    message: 'Invalid id'    
                })
    };

    res
        .status(200)
        .json({
            status: 'success',
            data: {
                tour: '<Updated tour here>'
            }
        })
};

const deleteTour = (req, res) => {
    const id = req.params.id * 1;

    if(id > tours.length) {
        return res
                .status(404)
                .json({
                    status: 'Failed',
                    message: 'Invalid id'    
                })
    };

    res
        .status(204)
        .json({
            status: 'success',
            data: null
        })
};

const createUser = (req, res) => {
    res
        .status(500)
        .json({
            status: 'error',
            message: 'This route is not yet defined'
        })
};

const getUser = (req, res) => {
    res
        .status(500)
        .json({
            status: 'error',
            message: 'This route is not yet defined'
        })
};

const getAllUsers = (req, res) => {
    res
        .status(500)
        .json({
            status: 'error',
            message: 'This route is not yet defined'
        })
};

const updateUser = (req, res) => {
    res
        .status(500)
        .json({
            status: 'error',
            message: 'This route is not yet defined'
        })
};

const deleteUser = (req, res) => {
    res
        .status(500)
        .json({
            status: 'error',
            message: 'This route is not yet defined'
        })
};

//app.get('/api/v1/tours', getAllTours);
//app.post('/api/v1/tours', createTour);
//app.get('/api/v1/tours/:id', getSpecificTour); // For optional parameters use ? at the end; /api/v1/tours/:id?
//app.patch('/api/v1/tours/:id', updateTour); 
//app.delete('/api/v1/tours/:id', deleteTour);

app
    .route('/api/v1/tours')
    .get(getAllTours)
    .post(createTour);

app
    .route('/api/v1/tours/:id')
    .get(getSpecificTour)
    .patch(updateTour)
    .delete(deleteTour);

app
    .route('/api/v1/users')
    .get(getAllUsers)
    .post(createUser);

app 
    .route('/api/v1/users/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

const port = 3000;
app.listen(port, 'localhost',() => {
    console.log(`App running on port ${port}...`);
});
