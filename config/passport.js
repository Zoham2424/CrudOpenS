const LocalStrategy = require("passport-local").Strategy;

//Variable that simulates in our database
const users = [{
    id:1,
    username:"testuser",
    password:"password1234",
    name:"Test User"
}];

module.exports = function(passport){
    passport.use(
        new LocalStrategy(async (username, password, done)=>{
            const user = users.find(u => u.username === username);

            //check for user
            if(!user) return done(null, false, {message:"No user found"});
            
            //Then check password
            if(password !== user.password) return done(null,false, {message:"Incorrect password"});

            //pass the checks
            return done(null, user);
        })
    );

    passport.serializeUser((user, done)=> done(null, user.id));

    passport.deserializeUser((id,done)=>{
        const user = users.find(u => u.id === id);
        done(null,user);
    })
}