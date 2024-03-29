const User = require("../models/user");
const { comparePassword, hashPassword } = require("../utils/password");
const jwt = require('jsonwebtoken')

exports.user = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name) return res.status(400).send({ error: "Name is required" });
    if (!email) return res.status(400).send({ error: "email is required" });
    if (!password)
      return res.status(400).send({ error: "password is required" });
    if (!phone) return res.status(400).send({ error: "phone is required" });

    const hashedPassword = await hashPassword(password);
    const request = {
      name: name,
      email: email,
      password: hashedPassword,
      phone: phone,
    };

    let user = await User.create(request);
    return res.status(200).send({ user, msg: "Successfully created" });
  } catch (error) {
    console.log("error");
    return res.status(500).send({ error: "Something broke" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .send({ error: "Please provide both email and password." });
    }

    const user = await User.findOne({ email: email});
    if (!user || !user.password) {
        return res.status(400).send({
          error: "The credentials you provided are incorrect, please try again.",
        });
      }
   
      const match = await comparePassword(password, user.password);
    if (!match)
      return res.status(400).send({
        error: "The credentials you provided are incorrect, please try again.",
      });
      const payload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone : user.phone
      };

      let token = jwt.sign({ userId: user._id }, "To-Do", { expiresIn: '1d' });
      return res.status(200).send({payload,token:token, msg : "login successfully"})

  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Something broke" });
  }
};
