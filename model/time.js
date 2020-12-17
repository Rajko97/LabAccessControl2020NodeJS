const mongoose = require("mongoose");

//TODO totalTimeForEachDay should be array of arrays
/*{
    username: "milan.rajkovic"
    totalTimeForToday : 9999 //seconds
    totalTimesForEachDay : [
        {
            measuredAtDate: "5.3.1997",
            timeSpentThatDay: "9999" //minutes
        }
    ]
}*/

const timeForEachDayModel = new mongoose.Schema({
    measuredAtDate: {
        type: Date,
        required: true
    },
    timeSpentThatDay: {
        type: Number,
        required: true,
        default: 0
    }
})

const userTimeInLabScheme = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  totalTimeForToday: {
      type: Number,
      required: true,
      default: 0
  },
  totalTimesForEachDay: [timeForEachDayModel]
});

const userTimeInLab = mongoose.model("userTimeInLab", userTimeInLabScheme);

module.exports = userTimeInLab;