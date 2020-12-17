const timeInLabModel = require("../../model/time");

const increaseAndSaveTimeForUser = (username, amount) => {
    return new Promise( (res, rej) => {
        timeInLabModel.findOne({username:username}, (err, userTimeInLabData) => { 
            if(!userTimeInLabData) {
                userTimeInLabData = new timeInLabModel({username: username});
            }
            userTimeInLabData.totalTimeForToday = userTimeInLabData.totalTimeForToday+amount;
            userTimeInLabData.save( (err, data) => {
                if(err) {
                    return rej(err);
                }
                return res("Saved");
            });
        });
    });
}

const arhiveTotalTimeForTodayForAllUsers = async () => {
    const now = new Date()
    const measuredDate = now.setDate(now.getDate()-1);
    timeInLabModel
        .find({totalTimeForToday : {$gt: 0}}, (err, res) => {
            res.forEach(async value => {
                const time = value.totalTimeForToday//TODO /60; //convert seconds to minutes
                const transaction = await timeInLabModel.findByIdAndUpdate(
                    value["_id"],
                    {
                        $push:{totalTimesForEachDay: {measuredAtDate: measuredDate, timeSpentThatDay: time}},
                        $set: {totalTimeForToday : 0}
                    }
                )
            })
    })
    //Ne radi $totalTimeForToday
    /*const x = await timeInLabModel.updateMany(
        {totalTimeForToday : {$gt: 0}},
        {
            $push:{totalTimesForEachDay: {measuredAtDate: measuredDate, timeSpentThatDay: "$totalTimeForToday"}},
            $set: {totalTimeForToday : 0}
        }
    )*/
}

const getUserTimeInLabForPeriod = (username1, startDate, endDate) => {     
    return new Promise(async (res, rej) => {
        const data = await timeInLabModel.aggregate([{
            $unwind: "$totalTimesForEachDay"
        }, {
            $match: {
                username: username1,
                "totalTimesForEachDay.measuredAtDate": {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        }
        ]);
        console.log(data)
        return res(data.map(({totalTimesForEachDay}) => 
        ({  time : totalTimesForEachDay.timeSpentThatDay,
            date : totalTimesForEachDay.measuredAtDate
        })));
    })
}

module.exports = {
    increaseAndSaveTimeForUser : increaseAndSaveTimeForUser,
    arhiveTotalTimeForTodayForAllUsers : arhiveTotalTimeForTodayForAllUsers,
    getUserTimeInLabForPeriod : getUserTimeInLabForPeriod
}