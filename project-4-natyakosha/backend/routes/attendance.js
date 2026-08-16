const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");
const { isAuthenticated, isTeacher } = require("../middleware/auth");
const { getLocalDateString } = require("../helpers/date");

// GET /api/attendance/batch/:batchId (Teacher only - retrieve attendance records for a batch)
// Query param: ?date=YYYY-MM-DD
router.get("/batch/:batchId", isTeacher, async (req, res) => {
  const { batchId } = req.params;
  const { date } = req.query;

  try {
    const db = getDB();
    const query = { batchId: new ObjectId(batchId) };
    if (date) {
      query.date = date;
    }

    // 1. Fetch existing attendance records
    const records = await db.collection("attendance").find(query).toArray();

    // 2. Fetch the batch to get the students list
    const batch = await db
      .collection("batches")
      .findOne({ _id: new ObjectId(batchId) });
    const studentsList = batch ? batch.students : [];

    // 3. Fetch user details for the students in the batch
    const students = await db
      .collection("users")
      .find({ username: { $in: studentsList } })
      .toArray();

    // 4. Filter allowed students who were registered on or before the requested date
    const allowedStudents = [];
    students.forEach((student) => {
      const createdDateStr = student.createdAt
        ? getLocalDateString(student.createdAt)
        : "";

      // Check if student has an existing log on this date
      const hasExistingLog = records.some((log) => log.username === student.username);

      // If date is not provided, or student registration date is on/before the requested date, or they already have a log
      if (!date || !createdDateStr || date >= createdDateStr || hasExistingLog) {
        allowedStudents.push({
          username: student.username,
          firstName: student.firstName || "",
          lastName: student.lastName || "",
        });
      }
    });

    res.json({
      records,
      allowedStudents,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Failed to retrieve attendance logs." });
  }
});

// POST /api/attendance (Teacher only - save/overwrite attendance for a date & batch)
router.post("/", isTeacher, async (req, res) => {
  const { batchId, date, records } = req.body; // records: [{ username, status }]

  if (!batchId || !date || !Array.isArray(records)) {
    return res
      .status(400)
      .json({ error: "BatchId, date, and records array are required." });
  }

  try {
    const db = getDB();
    const batchOid = new ObjectId(batchId);

    // Validate students' registration dates against the attendance date
    if (records.length > 0) {
      const usernames = records.map((rec) => rec.username.toLowerCase().trim());
      const users = await db
        .collection("users")
        .find({ username: { $in: usernames } })
        .toArray();

      const userMap = {};
      users.forEach((u) => {
        userMap[u.username] = u;
      });

      for (const rec of records) {
        const uName = rec.username.toLowerCase().trim();
        const student = userMap[uName];
        if (student && student.createdAt) {
          const studentCreatedDateStr = getLocalDateString(student.createdAt);
          if (date < studentCreatedDateStr) {
            // Check if there is an existing record in the DB for this date and student
            const existingLog = await db.collection("attendance").findOne({
              username: uName,
              date: date,
            });
            if (!existingLog) {
              return res.status(400).json({
                error: `Cannot mark attendance for ${student.firstName || student.username} on a date before they joined (${studentCreatedDateStr}).`,
              });
            }
          }
        }
      }
    }

    // Remove existing records for this batch and date to prevent duplicate logs
    await db.collection("attendance").deleteMany({
      batchId: batchOid,
      date: date,
    });

    if (records.length > 0) {
      const documents = records.map((rec) => ({
        username: rec.username.toLowerCase().trim(),
        batchId: batchOid,
        date: date,
        status: rec.status, // 'present' or 'absent'
        createdAt: new Date(),
      }));

      await db.collection("attendance").insertMany(documents);
    }

    res.json({ message: "Attendance records updated successfully." });
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ error: "Failed to save attendance logs." });
  }
});

// GET /api/attendance/my (Student only - overall attendance percentage & history)
router.get("/my", isAuthenticated, async (req, res) => {
  try {
    const db = getDB();
    const username = req.user.username;

    // Retrieve historical logs sorted by date descending
    const records = await db
      .collection("attendance")
      .find({ username: username })
      .sort({ date: -1 })
      .toArray();

    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

    res.json({
      summary: {
        totalClasses: total,
        presentCount: present,
        absentCount: total - present,
        presenceRate: rate,
      },
      history: records,
    });
  } catch (error) {
    console.error("Error fetching student attendance summary:", error);
    res
      .status(500)
      .json({ error: "Failed to calculate attendance statistics." });
  }
});

module.exports = router;
