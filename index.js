const express = require('express');
const app = express();
app.get('/',(req,res)=>{
    res.send("App is Running Letsss Go!!! ✈️");
});
app.listen(3000,()=>{
    console.log("App is Running on port 3000");
});