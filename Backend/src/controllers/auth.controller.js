const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const blacklistModel = require("../models/balcklist.model");

async function registerUserController(req, res) {
  const { email, username, password } = req.body;
  

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Please Enter username,email and password",
    });
  }

  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (isUserAlreadyExists) {
    return res.status(400).json({
      message: "User Already Exists",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: hashPassword,
  });

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1d" },
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "User created Successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

async function loginUserController(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "Invalid Email Or Password",
    });
  }

  const isValidPass = await bcrypt.compare(password, user.password);

  if (!isValidPass) {
    return res.status(400).json({
      message: "Invalid Email or Password",
    });
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET_KEY,
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "User Logged in Successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

async function logoutuserController(req,res){
    const token=req.cookies.token

    if(token){
        await blacklistModel.create({token})
    }

    res.clearCookie("token")

    res.status(201).json({
        message:"User logged out Successfully"
    })


}

async function getMeController(req,res) {
        const user=await userModel.findById(req.user.id)

        res.status(200).json({
            message:"User details fetched Successfully",
            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }
        })
}


module.exports = {
  registerUserController,
  loginUserController,
  logoutuserController,
  getMeController
};
