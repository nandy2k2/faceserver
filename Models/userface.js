const mongoose=require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  regNo: { type: String },
  embedding: { type: [Number], required: true }, // store as array of numbers
  createdAt: { type: Date, default: Date.now },
});
const Userface = mongoose.model('Userface', UserSchema);

module.exports=Userface;