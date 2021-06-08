const { loginUser, registerUser, resetUserPassword } = require("../controllers/users");

const router = require("express").Router();

router.post("/login", async (req, res) => {

    const { email, password } = req.body;
    
    if(!email || !password) return res.status(400).send({
        message: "Failed to login",
        success: false
    })

    try {
        const response = await loginUser(email, password);
        res.status(200).send(response);
    } catch (error) {
        res.status(400).send({
            message: "Failed to login",
            success: false
        })
    }
});


router.post("/register", async (req, res) => {

    const { email, username, password } = req.body;
    
    if(!email || !username || !password) return res.status(400).send({
        message: "Failed to register: invalid inputs",
        success: false
    });

    try {
        const response = await registerUser(username, email, password);
        res.status(200).send(response);
    } catch (error) {
        res.status(400).send({
            message: "Failed to register: invalid inputs",
            success: false
        });    
    }
});

router.post("/resetpassword", async (req, res) => {

    const { email } = req.body;

    if(!email) return res.status(401).send({
        message: "Invalid inputs",
        success: false
    });

    try {
       const response = await resetUserPassword(email);
       res.status(200).send(response);
    } catch (error) {
        res.status(401).send({
            message:"Failed to send reset email",
            success: false
        })
    }
});

module.exports = router;
