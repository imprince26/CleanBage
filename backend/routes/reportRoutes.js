import express from "express"
const router = express.Router();

router.post('/submit', (req, res) => {
    res.send('Report submitted');
});

export default router;
