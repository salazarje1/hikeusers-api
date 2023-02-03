const app = require("./app"); 
const { PORT } = require("./config"); 


app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`.green);
})
