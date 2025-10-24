const mongoose=require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Userface' },
  name: String,
  timestamp: { type: Date, default: Date.now },
  sourcePhoto: String // optional base64 or url
});
const Attendance = mongoose.model('Attendanceface', AttendanceSchema);

module.exports=Attendance;