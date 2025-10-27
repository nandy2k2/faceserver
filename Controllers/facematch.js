const { promisify } = require("util");

const attendaneface = require("./../Models/attendaneface");
const userface = require("./../Models/userface");

const User = require('./../Models/userface');
const Attendance = require('./../Models/attendaneface');

const User1 = require('./../Models/userface1');
const attendancenew = require("./../Models/attendancenew");

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


// oct 25 2025


exports.faceregister1 = async (req, res) => {
  try {
    const { name, regNo, program, semester, section, admissionyear, colid, embedding } = req.body;
    
    if (!name || !embedding) return res.status(400).json({error:'missing fields'});
    if (embedding.length === 0) return res.status(400).json({error:'embedding empty'});
    const user1 = new User1({ name, regNo, colid, program,semester,section, admissionyear, embedding });
    await user1.save();
    return res.json({ ok: true, user1 });

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


exports.facematch1 = async (req, res) => {
  try {
    //console.log(req.body);
    // const { embeddings, program,semester, section, sourcePhoto } = req.body; // embeddings: array of arrays
    const { name, colid, user, year, classdate,  programcode, course, coursecode, classid, embeddings, program, semester, section, sourcePhoto } = req.body; // embeddings: array of arrays
    if (!embeddings || !Array.isArray(embeddings)) return res.status(400).json({error:'invalid payload'});

    //  const pub2=attendancenew.deleteMany({ classid: classid });
    //  console.log(pub2);
    
    const users = await User1.find({ program: program, semester: semester, section: section });
    //console.log(users);
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
        // const pub2=attendancenew.deleteMany({ classid: classid, regno: best.user.regNo, student: best.user.name });
      
    try {
       
         const pat1 = await attendancenew.findOneAndUpdate(
      {
        classid: classid,
        regno: best.user.regNo,
        student: best.user.name,
      },
      {
        name: name,
        colid: colid,
        user: user,
        year: year,
        programcode: programcode,
        program: program,
        course: course,
        coursecode: coursecode,
        att: 1,
        classdate: new Date(classdate),
        semester: best.user.semester,
        section: best.user.section,
        status1: "Submitted",
        comments: "NA",
      },
      {
        new: true,
        upsert: true,
      }
    );
    //    const pub1 = await attendancenew.create({
    //   name: name,
    //   colid: colid,
    //   user: user,
    //   year: year,
    //   classid: classid,
    //   programcode: programcode,
    //   program: program,
    //   course: course,
    //   coursecode: coursecode,
    //   student: best.user.name,
    //   regno: best.user.regNo,
    //   att: 1,
    //   classdate: new Date(classdate),
    //   semester: best.user.semester,
    //   section: best.user.section,
    //   status1: "Submitted",
    //   comments: "NA",
    // });
    // console.log(pat1);

    } catch(err) {
      console.log(err);
    }
       
      } else {
        results.push({ detectedIndex: i, matched: false, name: best.user.name, userId: best.user._id, score: best.score });
         try {
       
         const pat1 = await attendancenew.findOneAndUpdate(
      {
        classid: classid,
        regno: best.user.regNo,
        student: best.user.name,
      },
      {
        name: name,
        colid: colid,
        user: user,
        year: year,
        programcode: programcode,
        program: program,
        course: course,
        coursecode: coursecode,
        att: 0,
        classdate: new Date(classdate),
        semester: best.user.semester,
        section: best.user.section,
        status1: "Submitted",
        comments: "NA",
      },
      {
        new: true,
        upsert: true,
      }
    );
  

    } catch(err) {
      console.log(err);
    }
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