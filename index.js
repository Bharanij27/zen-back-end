const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const {
    response
} = require("express");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const url = "mongodb+srv://bharani:DF8b4vOeqVVIchCQ@cluster0.jsd3k.mongodb.net?retryWrites=true&w=majority";
const cors = require("cors");

// app.use(cors({
//     origin: "https://assign-mentor-bharani.netlify.app"
// }))

app.use(bodyParser.json());

app.get("/", async function (req, res) {
    res.json("Hello World");
});

app.post("/student", async function (req, res) {
    try {
        let client = await mongoClient.connect(url);
        let db = client.db("zenClass");
        let insertedStudent = await db
            .collection("students")
            .insertOne({
                name: req.body.name,
                mentor: null
            });
        console.log(insertedStudent);
        client.close();
        res.json({
            message: "New Student Added",
            id: insertedStudent.insertedId,
        });
    } catch (error) {
        console.log(error)
        res.json("Something went wrong");
    }
});

app.post("/mentor", async function (req, res) {
    try {
        let client = await mongoClient.connect(url);
        let db = client.db("zenClass");
        let insertedStudent = await db
            .collection("mentors")
            .insertOne({
                name: req.body.name,
                students: []
            });
        console.log(insertedStudent.insertedId);
        client.close();
        res.json({
            message: "New Mentor Added",
            id: insertedStudent.insertedId,
        });
    } catch (error) {
        console.log(error)
        res.json("Something went wrong");
    }
});

app.get("/students", async function (req, res) {
    try {
        let client = await mongoClient.connect(url);
        let db = client.db("zenClass");
        let studentsList = await db.collection("students").find().toArray();
        client.close();
        res.json(studentsList);
    } catch (error) {
        console.log(error)
        res.json("Something went wrong");
    }
});

app.get("/mentors", async function (req, res) {
    try {
        let client = await mongoClient.connect(url);
        let db = client.db("zenClass");
        let mentorsList = await db.collection("mentors").find().toArray();
        client.close();
        res.json(mentorsList);
    } catch (error) {
        console.log(error)
        res.json("Something went wrong");
    }
});


app.put("/assign/:studentName", async function (req, res) {
    try {
        let client = await mongoClient.connect(url);
        let db = client.db("zenClass");

        await db
            .collection("students")
            .findOneAndUpdate({
                name : req.params.studentName //student id
            }, {
                $set: {
                    mentor: req.body.mentorName
                }
            });

        await db
            .collection("mentors")
            .findOneAndUpdate({
                name: req.body.mentorName //mentor id
            }, {
                $push: {
                    students: req.params.studentName
                }
            });

        client.close();
        res.json("Success");
    } catch (error) {
        console.log(error);
        res.json("Something went wrong");
    }
});

app.put("/update/:mentorName", async function (req, res) {
    try {
        let client = await mongoClient.connect(url);
        let db = client.db("zenClass");

        let student = await db
        .collection("students")
        .findOne({
            name: req.body.student
        });
        console.log(student);

        let a = await db
            .collection("mentor")
            .findOneAndUpdate({
                name: req.params.mentorName
            },
            {
                $addToSet : {
                    students : req.body.student
                }
            });

            let b = await db
            .collection("mentor")
            .findOneAndUpdate({
                name: student.mentor
            },
            {
                $pull : {
                    students : req.body.student
                }
            });

            await db
            .collection("students")
            .updateMany({
                name:  req.body.student
            }, {
                $set: {
                    mentor: req.params.mentorName
                }
            });
            
            client.close();
            res.json("Success");
            console.log(a, b)
        } catch (error) {
        console.log(error);
        res.json("Something went wrong");
    }
});


app.get("/students/:mentorName", async function (req, res) {
    //  ObjectId("5f61a2b9b521d153087d3c09") == ObjectId("5f61a2b9b521d153087d3c09")
    try {
        let client = await mongoClient.connect(url);
        let db = client.db("zenClass");
        let studentsDetials = await db
            .collection("students")
            .find({
                mentor: req.params.mentorName
            }).toArray();
        client.close();
        if (studentsDetials) {
            res.json({
                status: 200,
                message: "Retrievd Successfully",
                data: studentsDetials
            });
        } else {
            res.json({
                status: 404,
                message: "Not student Available",
            });
        }
    } catch (error) {
        console.log(error);
        res.json("Something went wrong");
    }
});

app.listen(process.env.PORT || 3030, function () {
    console.log("Server Started");
});