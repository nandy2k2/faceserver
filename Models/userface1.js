const mongoose=require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  regNo: { type: String },
  colid: { type: Number },
  program: { type: String },
  semester: { type: String },
  section: { type: String },
  admissionyear: { type: String },
  embedding: { type: [Number], required: true }, // store as array of numbers
  createdAt: { type: Date, default: Date.now },
});
const Userface = mongoose.model('Userface1', UserSchema);

module.exports=Userface;