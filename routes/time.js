var express = require("express");
var router = express.Router();
var timeInLabController = require("../controller/time/timeInLabController");

router.post("/save", async function(req, res, next) {
    const username = "milan.rajkovic"
    const time = 5;
    timeInLabController.increaseAndSaveTimeForUser(username, time)
        .then(msg => {
            res.json(
                {route:"save", msg: msg}
            )
        })
        .catch(err => {
            console.log(err)
            res.json(
                {route: 'save', err:err}
            )
        })
});

router.post("/arhive", function(req, res) {
    timeInLabController.arhiveTotalTimeForTodayForAllUsers();
    res.json({msg: "arhive"})
})

router.post("/get", async function(req, res, next) {
    const startDate = new Date(Date.parse('04 Dec 1995 00:12:00 GMT'));
    const endDate = new Date(Date.parse('04 Dec 2035 00:12:00 GMT'));
    console.log(startDate);
    console.log(endDate);
    const result = await timeInLabController.getUserTimeInLabForPeriod("milan.rajkovic", startDate, endDate)
    res.json({msg: result});
});

module.exports = router;