const { promisify } = require("util");

const attendaneface = require("./../Models/attendaneface");
const userface = require("./../Models/userface");

const User = require('./../Models/userface');
const Attendance = require('./../Models/attendaneface');

// cosine similarity between two arrays

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


exports.faceregister = async (req, res) => {
  try {
    const { name, regNo, embedding } = req.body;
    if (!name || !embedding) return res.status(400).json({error:'missing fields'});
    if (embedding.length === 0) return res.status(400).json({error:'embedding empty'});
    const user = new User({ name, regNo, embedding });
    await user.save();
    return res.json({ ok: true, user });

    //console.log(lcat1233);
    // return res.status(200).json({
    //   status: "Success",
    //   data: {
    //     classes: lcat1233,
    //   },
    // });
  } catch (err) {
    /* res.status(400).json({
            status:'Failed',
            message: err
        }); */
  }
};


exports.facematch = async (req, res) => {
  try {
    const { embeddings, sourcePhoto } = req.body; // embeddings: array of arrays
    if (!embeddings || !Array.isArray(embeddings)) return res.status(400).json({error:'invalid payload'});

    const users = await User.find();
    const results = [];
    const THRESHOLD = 0.95; // cosine similarity threshold - tune this

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
        //results.push({ detectedIndex: i, matched: false });
      }
    }

    res.json({ ok: true, results });
  } catch (err) {
    /* res.status(400).json({
            status:'Failed',
            message: err
        }); */
  }
};


exports.getfaceusers = async (req, res) => {
  try {
    const users = await User.find().select('-embedding');
  res.json(users);

  
  } catch (err) {
    /* res.status(400).json({
            status:'Failed',
            message: err
        }); */
  }
};


exports.getfaeattendance = async (req, res) => {
  try {
    const list = await Attendance.find().sort({timestamp:-1}).limit(200);
  res.json(list);

  
  } catch (err) {
    /* res.status(400).json({
            status:'Failed',
            message: err
        }); */
  }
};