console.log(__filename);
console.log("===== SERVER VERSION 2026 =====");

const express = require("express");
const cors = require("cors");
const connectDB = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

let orders = [];
let db;

// =============================
// เชื่อมฐานข้อมูล
// =============================
(async () => {
    try {
        db = await connectDB();
        console.log("✅ Database Connected");
    } catch (err) {
        console.error("❌ Database Error");
        console.error(err);
    }
})();

// =============================
// ทดสอบ Server
// =============================
app.get("/", (req, res) => {
    res.send("Server ทำงานแล้ว");
});

// =============================
// ทดสอบ API Register
// =============================
app.get("/api/register", (req, res) => {
    res.send("API Register ทำงาน");
});

// =============================
// สมัครสมาชิก
// =============================
app.post("/api/register", async (req, res) => {

    try {

        const { name, phone } = req.body;

        if (!name || !phone) {
            return res.json({
                success: false,
                message: "กรอกข้อมูลไม่ครบ"
            });
        }

        const customer = await db.get(
            "SELECT * FROM customers WHERE phone = ?",
            [phone]
        );

        if (customer) {
            return res.json({
                success: false,
                message: "เบอร์นี้สมัครแล้ว"
            });
        }

        await db.run(
            "INSERT INTO customers(name, phone) VALUES (?, ?)",
            [name, phone]
        );

        res.json({
            success: true,
            message: "สมัครสำเร็จ"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});

// =============================
// ตรวจสอบสมาชิก
// =============================
app.post("/api/check-phone", async (req, res) => {

    try {

        const { phone } = req.body;

        const customer = await db.get(
            "SELECT * FROM customers WHERE phone=?",
            [phone]
        );

        if (!customer) {
            return res.json({
                member: false
            });
        }

        res.json({
            member: true,
            customer
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            member: false
        });

    }

});

// =============================
// เพิ่มแต้ม
// =============================
app.post("/api/add-point", async (req, res) => {

    try {

        const { phone, point } = req.body;

        await db.run(
            "UPDATE customers SET points = points + ? WHERE phone=?",
            [point, phone]
        );

        res.json({
            success: true,
            message: "เพิ่มแต้มสำเร็จ"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false
        });

    }

});

// =============================
// ใช้แต้ม
// =============================
app.post("/api/use-point", async (req, res) => {

    try {

        const { phone, point } = req.body;

        await db.run(
            "UPDATE customers SET points = points - ? WHERE phone=?",
            [point, phone]
        );

        res.json({
            success: true,
            message: "ใช้แต้มสำเร็จ"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false
        });

    }

});

// =============================
// ดูสมาชิกทั้งหมด
// =============================
app.get("/api/customers", async (req, res) => {

    try {

        const customers = await db.all(
            "SELECT * FROM customers ORDER BY id DESC"
        );

        res.json(customers);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false
        });

    }

});

// =============================
// รับออเดอร์
// =============================
app.post("/order", (req, res) => {

    const order = req.body;

    order.status = "รอรับออเดอร์";

    orders.push(order);

    console.log(order);

    res.json({
        success: true
    });

});

// =============================
// ดูออเดอร์ทั้งหมด
// =============================
app.get("/orders", (req, res) => {

    res.json(orders);

});

// =============================
// ดูออเดอร์ตามเลข
// =============================
app.get("/order/:orderNo", (req, res) => {

    const order = orders.find(
        o => o.orderNo === req.params.orderNo
    );

    if (!order) {
        return res.status(404).json({
            success: false
        });
    }

    res.json(order);

});

// =============================
// เปลี่ยนสถานะออเดอร์
// =============================
app.put("/order/:orderNo", (req, res) => {

    const order = orders.find(
        o => o.orderNo === req.params.orderNo
    );

    if (!order) {
        return res.status(404).json({
            success: false
        });
    }

    order.status = req.body.status;

    res.json({
        success: true
    });

});

// =============================
// Start Server
// =============================
app.listen(3000, "0.0.0.0", () => {
    console.log("🚀 Server running on port 3000");
});