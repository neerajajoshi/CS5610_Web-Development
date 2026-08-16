const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");
const { isAuthenticated, isTeacher } = require("../middleware/auth");
const { getLocalYearMonthString, getMonthsRange, getProratedAmount } = require("../helpers/date");

/**
 * Reconciles fee payment records for a student by generating missing invoices
 * from their registration month to the current month.
 * @param {object} db 
 * @param {object} student 
 */
async function reconcileFeesForStudent(db, student) {
  const enrollmentDate = student.createdAt ? new Date(student.createdAt) : new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  const currentDate = new Date();
  
  const months = getMonthsRange(enrollmentDate, currentDate);
  
  for (const m of months) {
    // Check if fee record already exists for this student and billing month
    const existing = await db.collection("fee_payments").findOne({
      username: student.username,
      dueDate: m.dueDate,
    });
    
    if (!existing) {
      const amount = getProratedAmount(enrollmentDate, m.year, m.month);
      await db.collection("fee_payments").insertOne({
        username: student.username,
        planType: "Monthly",
        amount,
        status: "unpaid",
        dueDate: m.dueDate,
        paidDate: null,
        monthName: m.monthName,
      });
    }
  }
}

// GET /api/fees/dashboard (Teacher only - aggregations & status lists)
router.get("/dashboard", isTeacher, async (req, res) => {
  try {
    const db = getDB();
    // Fetch all student users
    const users = await db
      .collection("users")
      .find({ role: "student" })
      .toArray();

    // Reconcile fee records for all students
    for (const student of users) {
      await reconcileFeesForStudent(db, student);
    }

    const payments = await db
      .collection("fee_payments")
      .find()
      .sort({ dueDate: -1 })
      .toArray();

    // Fetch batch mappings to decorate payment records
    const batches = await db.collection("batches").find().toArray();

    const userMap = {};
    users.forEach((u) => {
      userMap[u.username.toLowerCase().trim()] = u;
    });

    const batchMap = {};
    batches.forEach((b) => {
      batchMap[b._id.toString()] = `${b.name} (${b.timeSlot})`;
    });

    // Decorate each payment with batch info and name details
    payments.forEach((p) => {
      const uName = p.username.toLowerCase().trim();
      const student = userMap[uName];
      const bId = student && student.batchId ? student.batchId.toString() : null;
      
      p.batchId = bId || null;
      p.batchName = bId ? batchMap[bId] || null : null;
      p.firstName = student ? student.firstName || "" : "";
      p.lastName = student ? student.lastName || "" : "";
    });

    // Aggregations
    let totalCollected = 0;
    let totalOutstanding = 0;
    const unpaidStudents = new Set();
    const unpaidLedger = [];

    payments.forEach((p) => {
      if (p.status === "paid") {
        totalCollected += p.amount;
      } else {
        totalOutstanding += p.amount;
        unpaidStudents.add(p.username);
        unpaidLedger.push(p);
      }
    });

    res.json({
      summary: {
        totalCollected,
        totalOutstanding,
        outstandingCount: unpaidLedger.length,
        unpaidStudentsCount: unpaidStudents.size,
      },
      ledger: payments,
      unpaidList: unpaidLedger,
      batches: batches.map((b) => ({
        _id: b._id.toString(),
        name: b.name,
        timeSlot: b.timeSlot,
      })),
    });
  } catch (error) {
    console.error("Error fetching fees dashboard:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve fee payments dashboard." });
  }
});

// PUT /api/fees/:id (Teacher only - manually mark student fee status)
router.put("/:id", isTeacher, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'paid' or 'unpaid'

  if (!status || !["paid", "unpaid"].includes(status)) {
    return res
      .status(400)
      .json({ error: 'Valid status ("paid" or "unpaid") is required.' });
  }

  try {
    const db = getDB();
    const feeId = new ObjectId(id);

    const record = await db.collection("fee_payments").findOne({ _id: feeId });
    if (!record) {
      return res.status(404).json({ error: "Fee payment record not found." });
    }

    // Validate if the fee billing month is before the student's registration month
    const student = await db.collection("users").findOne({ username: record.username });
    if (student && student.createdAt) {
      const studentCreatedYM = getLocalYearMonthString(student.createdAt);
      const feeYM = record.dueDate.substring(0, 7);
      if (feeYM < studentCreatedYM) {
        return res.status(400).json({
          error: `Cannot pay fees for a month (${record.monthName || feeYM}) prior to the student's joining month (${studentCreatedYM}).`
        });
      }
    }

    const updateFields = { status };
    if (status === "paid") {
      updateFields.paidDate = new Date().toISOString().split("T")[0];
    } else {
      updateFields.paidDate = null;
    }

    const result = await db
      .collection("fee_payments")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateFields },
        { returnDocument: "after" },
      );

    if (!result) {
      return res.status(404).json({ error: "Fee payment record not found." });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating fee status:", error);
    res.status(500).json({ error: "Failed to update fee record." });
  }
});

// GET /api/fees/my (Student only - check personal payment logs)
router.get("/my", isAuthenticated, async (req, res) => {
  try {
    const db = getDB();
    const username = req.user.username;

    // Reconcile for this specific student
    const student = await db.collection("users").findOne({ username: username });
    if (student) {
      await reconcileFeesForStudent(db, student);
    }

    const payments = await db
      .collection("fee_payments")
      .find({ username: username })
      .sort({ dueDate: -1 })
      .toArray();

    res.json(payments);
  } catch (error) {
    console.error("Error fetching student fee list:", error);
    res.status(500).json({ error: "Failed to retrieve fee payments history." });
  }
});

// POST /api/fees/my/pay/:id (Student only - mock payment action)
router.post("/my/pay/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const username = req.user.username;

  try {
    const db = getDB();

    // Ensure the fee payment belongs to the logged-in student
    const record = await db.collection("fee_payments").findOne({
      _id: new ObjectId(id),
      username: username,
    });

    if (!record) {
      return res
        .status(404)
        .json({ error: "Fee payment record not found or access denied." });
    }

    // Validate if the fee billing month is before the student's registration month
    const student = await db.collection("users").findOne({ username: username });
    if (student && student.createdAt) {
      const studentCreatedYM = getLocalYearMonthString(student.createdAt);
      const feeYM = record.dueDate.substring(0, 7);
      if (feeYM < studentCreatedYM) {
        return res.status(400).json({
          error: `Cannot pay fees for a month (${record.monthName || feeYM}) prior to your joining month (${studentCreatedYM}).`
        });
      }
    }

    if (record.status === "paid") {
      return res.status(400).json({ error: "Fee is already marked as paid." });
    }

    const updatedRecord = await db.collection("fee_payments").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "paid",
          paidDate: new Date().toISOString().split("T")[0],
        },
      },
      { returnDocument: "after" },
    );

    res.json({
      message: "Payment completed successfully!",
      record: updatedRecord,
    });
  } catch (error) {
    console.error("Error processing student payment mock:", error);
    res.status(500).json({ error: "Failed to process payment." });
  }
});

module.exports = router;
