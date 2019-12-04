const mongoose = require('mongoose');
const DB_URI = 'mongodb://localhost:27017/myapp';
const app = require('../server');

const PORT = process.env.PORT || 5000;

function connect() {
    console.log(DB_URI);
    if (process.env.NODE_ENV === 'test') {
        const Mockgoose = require('mockgoose').Mockgoose;
        const mockgoose = new Mockgoose(mongoose);
        
        mockgoose.prepareStorage()
            .then(() => {
                mongoose.connect(DB_URI,
                    { useNewUrlParser: true, useUnifiedTopology: true })
                        .then(() => {
                            app.listen(PORT, () => {
                                console.log('Listening on port: ' + PORT);
                            });
                            console.log('MongoDB Connected')
                        })
                        .catch(err => console.log(err))
            })
    } else {
        mongoose.connect(DB_URI,
            { useNewUrlParser: true, useUnifiedTopology: true })
                .then(() => {
                    app.listen(PORT, () => {
                        console.log('Listening on port: ' + PORT);
                    });
                    console.log('MongoDB Connected')
                })
                .catch(err => console.log(err))
    }
}

function close() {
  return mongoose.disconnect();
}

module.exports = { connect, close };
