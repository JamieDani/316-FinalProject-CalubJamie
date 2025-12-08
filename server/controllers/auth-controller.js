const auth = require('../auth')
const bcrypt = require('bcryptjs')
const db = require('../db')

getLoggedIn = async (req, res) => {
    try {
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            })
        }

        const loggedInUser = await db.getUserById(userId);
        console.log("loggedInUser: " + loggedInUser);

        return res.status(200).json({
            loggedIn: true,
            user: {
                username: loggedInUser.username,
                email: loggedInUser.email,
                profilePicture: loggedInUser.profilePicture
            }
        })
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }
}

loginUser = async (req, res) => {
    console.log("loginUser");
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }

        const existingUser = await db.getUserByEmail(email);
        console.log("existingUser: " + existingUser);
        if (!existingUser) {
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })
        }

        console.log("provided password: " + password);
        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordCorrect) {
            console.log("Incorrect password");
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })
        }

        // LOGIN THE USER
        const token = auth.signToken(existingUser._id || existingUser.id);
        console.log(token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: true
        }).status(200).json({
            success: true,
            user: {
                username: existingUser.username,
                email: existingUser.email,
                profilePicture: existingUser.profilePicture
            }
        })

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none"
    }).send();
}

updateUser = async (req, res) => {
    console.log("UPDATING USER IN BACKEND");
    try {
        const userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({
                errorMessage: "Unauthorized"
            });
        }

        const { username, email, password, passwordVerify, profilePicture } = req.body;
        console.log("update user: " + username + " " + email);

        if (!username && !email && !password && !profilePicture) {
            return res.status(400).json({
                errorMessage: "Please provide at least one field to update."
            });
        }

        let passwordHash = undefined;
        if (password) {
            if (password.length < 8) {
                return res.status(400).json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
            }
            if (password !== passwordVerify) {
                return res.status(400).json({
                    errorMessage: "Please enter the same password twice."
                });
            }

            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            passwordHash = await bcrypt.hash(password, salt);
        }

        if (email) {
            const existingUser = await db.getUserByEmail(email);
            const existingUserId = existingUser ? (existingUser._id || existingUser.id) : null;
            if (existingUser && existingUserId.toString() !== userId.toString()) {
                return res.status(400).json({
                    errorMessage: "An account with this email address already exists."
                });
            }
        }

        const updatedUser = await db.updateUser(userId, username, email, passwordHash, profilePicture);
        console.log("user updated: " + (updatedUser._id || updatedUser.id));

        return res.status(200).json({
            success: true,
            user: {
                username: updatedUser.username,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

registerUser = async (req, res) => {
    console.log("REGISTERING USER IN BACKEND");
    try {
        const { username, email, password, passwordVerify, profilePicture } = req.body;
        console.log("create user: " + username + " " + email + " " + password + " " + passwordVerify);
        if (!username || !email || !password || !passwordVerify) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }
        console.log("all fields provided");
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }
        console.log("password long enough");
        if (password !== passwordVerify) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                })
        }
        console.log("password and password verify match");
        const existingUser = await db.getUserByEmail(email);
        console.log("existingUser: " + existingUser);
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                })
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log("passwordHash: " + passwordHash);

        const savedUser = await db.createUser(username, email, passwordHash, profilePicture)
        console.log("new user saved: " + savedUser._id);

        // LOGIN THE USER
        const token = auth.signToken(savedUser._id);
        console.log("token:" + token);

        await res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }).status(200).json({
            success: true,
            user: {
                username: savedUser.username,
                email: savedUser.email,
                profilePicture: savedUser.profilePicture
            }
        })

        console.log("token sent");

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

checkEmail = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                exists: false,
                errorMessage: "Email parameter is required"
            });
        }

        const existingUser = await db.getUserByEmail(email);

        return res.status(200).json({
            exists: existingUser !== null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            exists: false,
            errorMessage: "Error checking email"
        });
    }
}

module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser,
    updateUser,
    checkEmail
}