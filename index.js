const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({limit: '10mb'}));

// ---------- Mongoose models ----------
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  regNo: { type: String },
  embedding: { type: [Number], required: true }, // store as array of numbers
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('Userface', UserSchema);

const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Userface' },
  name: String,
  timestamp: { type: Date, default: Date.now },
  sourcePhoto: String // optional base64 or url
});
const Attendance = mongoose.model('Attendanceface', AttendanceSchema);

// ---------- Helpers ----------
function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]*b[i];
    na += a[i]*a[i];
    nb += b[i]*b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// ---------- Routes ----------
// register: receives { name, regNo?, embedding: number[] }
app.post('/api/register', async (req, res) => {
  try {
    const { name, regNo, embedding } = req.body;
    if (!name || !embedding) return res.status(400).json({error:'missing fields'});
    if (embedding.length === 0) return res.status(400).json({error:'embedding empty'});
    const user = new User({ name, regNo, embedding });
    await user.save();
    res.json({ ok: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// match endpoint: receives { embeddings: [embedding,...], sourcePhoto?: base64 }
app.post('/api/match', async (req, res) => {
  try {
    const { embeddings, sourcePhoto } = req.body; // embeddings: array of arrays
    if (!embeddings || !Array.isArray(embeddings)) return res.status(400).json({error:'invalid payload'});

    const users = await User.find();
    const results = [];
    const THRESHOLD = 0.55; // cosine similarity threshold - tune this

    for (let i = 0; i < embeddings.length; i++) {
      const e = embeddings[i];
      let best = { score: -1, user: null };
      for (const u of users) {
        const score = cosineSimilarity(e, u.embedding);
        if (score > best.score) best = { score, user: u };
      }
      if (best.user && best.score >= THRESHOLD) {
        // record attendance
        const att = new Attendance({ user: best.user._id, name: best.user.name, sourcePhoto });
        await att.save();
        results.push({ detectedIndex: i, matched: true, name: best.user.name, userId: best.user._id, score: best.score });
      } else {
        results.push({ detectedIndex: i, matched: false });
      }
    }

    res.json({ ok: true, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// list registered users
app.get('/api/users', async (req, res) => {
  const users = await User.find().select('-embedding');
  res.json(users);
});

// attendance list
app.get('/api/attendance', async (req, res) => {
  const list = await Attendance.find().sort({timestamp:-1}).limit(200);
  res.json(list);
});

var path = require('path');
const dotenv=require('dotenv');
dotenv.config({path: './config.env'});

// ---------- start ----------
const PORT = process.env.PORT || 4000;
// const MONGO = process.env.MONGO || 'mongodb://127.0.0.1:27017/face-att';


// const DB1="mongodb+srv://user2:Pooja@123456@cluster0.bhzac.mongodb.net/test?retryWrites=true&w=majority"
const DB1=process.env.DATABASE2;
console.log(DB1)

mongoose.connect(DB1, {
    useNewUrlParser:true, 
    // useUnifiedTopology:true, 
    useCreateIndex: true,
    useFindAndModify: false
})
  .then(()=>{
    app.listen(PORT, ()=>console.log('Server running', PORT));
  }).catch(err=>{ console.error('mongo error', err); });
