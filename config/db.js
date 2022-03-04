require('dotenv').config();
const mongoose = require("mongoose");

console.log(process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("DB Connected");
    })
    .catch((err) => console.log(err));