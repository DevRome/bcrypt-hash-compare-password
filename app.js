const express = require("express")
const path = require("path")
const mongoose = require("mongoose")

// bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;  // più è alto il numero e più sarà criptata, ma più ci metterà


const User = require("./models/user")

const app = express()
const PORT = process.env.PORT || 3000

// body parser
app.use(express.urlencoded({extended: true}))
app.use(express.json({extended: true}))

// Database connection
mongoose.connect("mongodb://localhost/bcrypt-test", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection db error"))
db.once("open", ()=> console.log("Connected to db!"))

// view engine
app.set("views", path.join(__dirname, "/views"))
app.set("view engine", "ejs")


// Routes
app.get("/", (req, res)=>{
    res.render("index")
})

app.post("/hash", async(req, res)=>{

    const password = req.body.password;
    const email = req.body.email;
    console.log(password)
    
    // qui attraverso queste 2 funzioni si cripta la password con bcrypt
     bcrypt.genSalt(saltRounds, (err, salt)=>{  // prima fa il salt, senza bisogno della password
         bcrypt.hash(password, salt, async(err, hash)=>{ // poi fa l'hash, e crea la password che vado a mettere nel database
            
            console.log(`Salt: ${salt}`);
            console.log(`Hash: ${hash}`);
            
            try{
                const user = new User({
                    email: email,
                    password: hash
                })
                const newUser = await user.save()
                res.redirect("/user/" + newUser._id)
            }catch(err){
                console.log(err)
            }

        })
    })     
})

app.get("/login", (req, res)=>{
    res.render("login")
})

app.post("/login", async(req, res)=>{
    const email = req.body.email;
    const password = req.body.password;

    try{
        const user = await User.findOne({email: email})
        const hash = user.password
    
        bcrypt.compare(password, hash, function(err, result) {
            if(result){
                console.log("Login successfully")
                res.redirect("/")
            }else{
                console.log("Invalid password")
                res.redirect("/login")
            }
          }); 
    }catch(err){
        console.log(err)
    }
    
})

app.get("/user/:id", async(req, res)=>{
    const userId = req.params.id
    try{
        const user = await User.findById(userId)
        res.render("user", {user})
    }catch(err){
        console.log(err)
    }
})


// Server 
app.listen(PORT, ()=> console.log("Server listening on port: ", PORT))