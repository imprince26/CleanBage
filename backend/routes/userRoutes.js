import express from "express";
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Users list: ');
});

export default router;