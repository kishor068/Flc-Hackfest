const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const _ = require("Lodash");

// Certificate Init
const PDFDocument = require('pdfkit');
const fs = require('fs');
const doc = new PDFDocument({
  layout: 'landscape',
  size: 'A4',
});

// Global Declarations
let loginDetails;
let adminDetails;
let active = false;
let changemarks_student;
let changemarks_marks;
let flag = 0;
let temp_flag = 0;
let tempusn;
let tempsem;
let count;
let newcgpa;
let date = new Date();


// Middle Ware
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


// Mongo URI
const mongoURI='mongodb://0.0.0.0:27017/hackfestDB'


// create mongodb connection
const conn = mongoose.createConnection(mongoURI)


// Mongoose connection
mongoose.connect(mongoURI);


// Seat database creation
const seatSchema = new mongoose.Schema({
  _id:{
    type: String,
    required: true
  },
  seq:{
    type: Number,
    default: 0
  }
});

const Seat = mongoose.model("Seat", seatSchema);


// Admin Database Creation
const adminSchema = new mongoose.Schema({
  name: String,
  phone: Number,
  email: String,
  username: String,
  password: String,
  domain: String,
  desig: String,
  edu: String,
});

const Admin = mongoose.model("Admin", adminSchema);

//Marks database Creation
const markSchema = new mongoose.Schema({
  usn: String,
  year: String,
  sem: String,
  subject1: Number,
  subject2: Number,
  subject3: Number,
  subject4: Number,
  subject5: Number,
  sgpa: Number
});
const Mark = mongoose.model("Mark", markSchema);


// Admissions database creation
const admissionSchema = new mongoose.Schema({
  status: Boolean,
  usn: String,
  firstName: String,
  middleName: String,
  lastName: String,
  parentName: String,
  parentNumber: Number,
  parentEmail: String,
  dateOfBirth: {
    "type": "string",
    "format": "date"
  },
  studentPhone: Number,
  studentEmail: String,
  course: String,
  aadhaarNumber: Number,
  aadhaarCard: Boolean,
  tenthPassingMonth: {
    "type": "string",
    "format": "date"
  },
  tenthMarks: Number,
  tenthMarkSheet: Boolean,
  twelfthPassingMonth: {
    "type": "string",
    "format": "date"
  },
  twelfthMarks: Number,
  twelfthMarkSheet: Boolean,
  nucatNo: Number,
  nucatRank: Number,
  nucatMonth: {
    "type": "string",
    "format": "date"
  },
  username: String,
  password: String,
  year: String,
  semester: String,
  payment: Number,
  transCert: Boolean,
  studyCert: Boolean,
  transCertCol: Boolean,
  studyCertCol: Boolean,
  cgpa: mongoose.Types.Decimal128,
  ts: Number
});

const Admission = mongoose.model('Admission', admissionSchema);


// Route Route for frontpage
app.get("/", function(req, res) {
  res.render("frontpage.ejs");
})


// Login Page
app.get("/login", function(req, res) {
  res.render("login");
});

app.post("/login", function(req, res) {

  const username = req.body.username;
  const password = req.body.password;

  Admission.findOne({
    username: username
  }, function(err, foundItem) {
    if (err) {
      console.log(err);
    }
    if (foundItem) {
      if (foundItem.password === password) {
        if (foundItem.status === true){
          loginDetails = foundItem;
          res.render("studentpage", {foundItem: foundItem});
        }else{
          res.render("popup-noaccess");
        }
      }
    }
  });

  Admin.findOne({
    username: username
  }, function(err, foundItem) {
    if (err) {
        console.log("err at log admin")
      console.log(err);
    }
    if (foundItem) {
      if (foundItem.password === password) {
        loginDetails = foundItem;
        Admission.find({},function(err, foundElements){
          if(err){
            console.log("err at log admin2")
            console.log(err);
          }else{
            adminDetails = foundElements;
            res.render("adminpage", {foundItem: loginDetails, studentList: adminDetails});
          }
        });
      }else{
        res.render("popup-invalidaccess");
      }
    }else{
      res.render("popup-invalidaccess");
    }
  });
});



// Admission page
app.get("/admission", function(req, res) {
  res.render("admission");
})

app.post("/admission", function(req, res){
  const firstName = _.upperFirst(req.body.firstName);
  const middleName = _.upperFirst(req.body.middleName);
  const lastName = _.upperFirst(req.body.lastName);
  const parentName = _.startCase(req.body.parentName);
  const parentNumber = req.body.parentNumber;
  const parentEmail = req.body.parentEmail;
  const dateOfBirth = req.body.dateOfBirth;
  const studentPhone = req.body.studentPhone;
  const studentEmail = req.body.studentEmail;
  const course = req.body.course;
  const aadhaarNumber = req.body.aadhaarNumber;
  var aadhaarCard;
  if (req.body.aadhaarCard){
    aadhaarCard = true;
  }else{
    aadhaarCard = false;
  }
  const tenthPassingMonth = req.body.tenthPassingMonth;
  const tenthMarks = req.body.tenthMarks;
  var tenthMarkSheet;
  if(req.body.tenthMarkSheet){
    tenthMarkSheet = true;
  }else{
    tenthMarkSheet = false;
  }
  const twelfthPassingMonth = req.body.twelfthPassingMonth;
  const twelfthMarks = req.body.twelfthMarks;
  var twelfthMarkSheet;
  if(req.body.twelfthMarkSheet)
  {
    twelfthMarkSheet = true;
  }else{
    twelfthMarkSheet = false;
  }
  const nucatNo = req.body.nucatNo;
  const nucatRank = req.body.nucatRank;
  const nucatMonth = req.body.nucatMonth;

  const student = new Admission({
    status: false,
    usn: '',
    firstName: firstName,
    middleName: middleName,
    lastName: lastName,
    parentName: parentName,
    parentNumber: parentNumber,
    parentEmail: parentEmail,
    dateOfBirth: dateOfBirth,
    studentPhone: studentPhone,
    studentEmail: studentEmail,
    course: course,
    aadhaarNumber: aadhaarNumber,
    aadhaarCard: aadhaarCard,
    tenthPassingMonth: tenthPassingMonth,
    tenthMarks: tenthMarks,
    tenthMarkSheet: tenthMarkSheet,
    twelfthPassingMonth: twelfthPassingMonth,
    twelfthMarks: twelfthMarks,
    twelfthMarkSheet: twelfthMarkSheet,
    nucatNo: nucatNo,
    nucatRank: nucatRank,
    nucatMonth: nucatMonth,
    username: '',
    password: '',
    year: "First",
    semester: "First",
    payment: 0,
    transCert: false,
    studyCert: false,
    transCertCol: false,
    studyCertCol: false,
    cgpa: 0
  });

  student.save();



  let newUsername;
  let newPassword;
  let fullyr = date.getFullYear();
  let yr = fullyr % 100;
  if (date.getDate() == 1 && date.getMonth() == 1){
    Seat.updateMany({},{$set: {seq: 1}}, function(err){
      if (err){
        console.log(err);
      }
    })
  }



  if (course === "Information Science") {

    Seat.findOne({_id:"IS"},function(err, obj){
      if (err){
        console.log(err);
      }else{
        newUsername = "9nm" + yr + "is" + obj.seq + "@nmamit.in";
        newPassword = "9nm" + yr + "is" + obj.seq;

        Admission.updateOne({firstName: firstName, username: ''},{$set: {username: newUsername, password: newPassword, usn: newPassword}}, function(err){
          if(err){
            console.log(err);
          }
        });

        Seat.updateOne({_id: "IS"},{$inc: {seq: 1}},function(err){
          if (err){
            console.log(err);
          }
        })

        res.render("popup-admission", {
          username: newUsername,
          password: newPassword
        });

        const firstMark = new Mark({
          usn: newPassword,
          year: "First",
          sem: "First",
          subject1: 0,
          subject2: 0,
          subject3: 0,
          subject4: 0,
          subject5: 0,
          sgpa: 0
        });

        firstMark.save();
      }
    });
  }


  else if (course === "Computer Science") {
    Seat.findOne({_id:"CS"},function(err, obj){
      if (err){
        console.log(err);
      }else{
        newUsername = "9nm" + yr + "cs" + obj.seq + "@nmamit.in";
        newPassword = "9nm" + yr + "cs" + obj.seq;

        Admission.updateOne({firstName: firstName, username: ''},{$set: {username: newUsername, password: newPassword, usn: newPassword}}, function(err){
          if(err){
            console.log(err);
          }
        });

        res.render("popup-admission", {
          username: newUsername,
          password: newPassword
        });

        const firstMark = new Mark({
          usn: newPassword,
          year: "First",
          sem: "First",
          subject1: 0,
          subject2: 0,
          subject3: 0,
          subject4: 0,
          subject5: 0,
          sgpa: 0
        });

        firstMark.save();
      }
    });
    Seat.updateOne({_id: "CS"},{$inc: {seq: 1}},function(err){
      if (err){
        console.log(err);
      }
    })
  }


  else if (course === "Mechanical Engineering") {

    Seat.findOne({_id:"ME"},function(err, obj){
      if (err){
        console.log(err);
      }else{
        newUsername = "9nm" + yr + "me" + obj.seq + "@nmamit.in";
        newPassword = "9nm" + yr + "me" + obj.seq;

        Admission.updateOne({firstName: firstName, username: ''},{$set: {username: newUsername, password: newPassword, usn: newPassword}}, function(err){
          if(err){
            console.log(err);
          }
        });

        res.render("popup-admission", {
          username: newUsername,
          password: newPassword
        });

        const firstMark = new Mark({
          usn: newPassword,
          year: "First",
          sem: "First",
          subject1: 0,
          subject2: 0,
          subject3: 0,
          subject4: 0,
          subject5: 0,
          sgpa: 0
        });

        firstMark.save();
      }
    });
      Seat.updateOne({_id: "ME"},{$inc: {seq: 1}},function(err){
        if (err){
          console.log(err);
        }
      })
  }


  else if (course === "Artificial Intelligence and Machine Learning") {

    Seat.findOne({_id:"AIML"},function(err, obj){
      if (err){
        console.log(err);
      }else{
        newUsername = "9nm" + yr + "aiml" + obj.seq + "@nmamit.in";
        newPassword = "9nm" + yr + "aiml" + obj.seq;

        Admission.updateOne({firstName: firstName, username: ''},{$set: {username: newUsername, password: newPassword, usn: newPassword}}, function(err){
          if(err){
            console.log(err);
          }
        });

        res.render("popup-admission", {
          username: newUsername,
          password: newPassword
        });

        const firstMark = new Mark({
          usn: newPassword,
          year: "First",
          sem: "First",
          subject1: 0,
          subject2: 0,
          subject3: 0,
          subject4: 0,
          subject5: 0,
          sgpa: 0
        });

        firstMark.save();
      }
    });
      Seat.updateOne({_id: "AIML"},{$inc: {seq: 1}},function(err){
        if (err){
          console.log(err);
        }
      })
  }


  else if (course === "Civil Engineering") {

    Seat.findOne({_id:"CE"},function(err, obj){
      if (err){
        console.log(err);
      }else{
        newUsername = "9nm" + yr + "ce" + obj.seq + "@nmamit.in";
        newPassword = "9nm" + yr + "ce" + obj.seq;

        Admission.updateOne({firstName: firstName, username: ''},{$set: {username: newUsername, password: newPassword, usn: newPassword}}, function(err){
          if(err){
            console.log(err);
          }
        });

        res.render("popup-admission", {
          username: newUsername,
          password: newPassword
        });

        const firstMark = new Mark({
          usn: newPassword,
          year: "First",
          sem: "First",
          subject1: 0,
          subject2: 0,
          subject3: 0,
          subject4: 0,
          subject5: 0,
          sgpa: 0
        });

        firstMark.save();
      }
    });
      Seat.updateOne({_id: "CE"},{$inc: {seq: 1}},function(err){
        if (err){
          console.log(err);
        }
      })
  }


  else if (course === "Electrical and Electronics Engineering") {

    Seat.findOne({_id:"EEE"},function(err, obj){
      if (err){
        console.log(err);
      }else{
        newUsername = "9nm" + yr + "eee" + obj.seq + "@nmamit.in";
        newPassword = "9nm" + yr + "eee" + obj.seq;

        Admission.updateOne({firstName: firstName, username: ''},{$set: {username: newUsername, password: newPassword, usn: newPassword}}, function(err){
          if(err){
            console.log(err);
          }
        });

        res.render("popup-admission", {
          username: newUsername,
          password: newPassword
        });

        const firstMark = new Mark({
          usn: newPassword,
          year: "First",
          sem: "First",
          subject1: 0,
          subject2: 0,
          subject3: 0,
          subject4: 0,
          subject5: 0,
          sgpa: 0
        });

        firstMark.save();
      }
    });
      Seat.updateOne({_id: "EEE"},{$inc: {seq: 1}},function(err){
        if (err){
          console.log(err);
        }
      })
  }
});




// About Us Page
app.get("/aboutus", function(req, res) {
  res.render("aboutus");
});





// Student Page
app.get("/studentpage", function(req, res) {
  res.render("studentpage", {foundItem: loginDetails});
});
//
// app.post("/studentpage", function(req, res) {
//   res.render("studentpage", {foundItem: loginDetails});
// });




// Payment Pages
app.get("/payment", function(req, res){
  res.render("payment", {foundItem: loginDetails});
});

app.get("/paymentdetails", function(req, res){
  res.render("paymentdetails", {foundItem: loginDetails});
});

app.post("/paymentdetails", function(req, res){
  const amount = req.body.amount;
  var total = parseInt(loginDetails.payment)+parseInt(amount);
  Admission.updateOne({password: loginDetails.password},{$set: {payment: total}}, function(err){
    if (err){
      console.log(err);
    }
  })
  res.render("popup-paymentconfirmed");
});




// Change Details Page
app.get("/changedetails", function(req, res){
  res.render("changedetails", {foundItem: loginDetails})
});

app.post("/changedetails", function(req, res){
  const firstName = _.upperFirst(req.body.firstName);
  const middleName = _.upperFirst(req.body.middleName);
  const lastName = _.upperFirst(req.body.lastName);
  const parentName = _.startCase(req.body.parentName);
  const parentNumber = req.body.parentNumber;
  const parentEmail = req.body.parentEmail;
  const dateOfBirth = req.body.dateOfBirth;
  const studentPhone = req.body.studentPhone;
  const studentEmail = req.body.studentEmail;
  const aadhaarNumber = req.body.aadhaarNumber;
  const tenthPassingMonth = req.body.tenthPassingMonth;
  const tenthMarks = req.body.tenthMarks;
  const twelfthPassingMonth = req.body.twelfthPassingMonth;
  const twelfthMarks = req.body.twelfthMarks;
  const nucatNo = req.body.nucatNo;
  const nucatRank = req.body.nucatRank;
  const nucatMonth = req.body.nucatMonth;

  if (firstName != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {firstName: firstName}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (middleName != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {middleName: middleName}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (lastName != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {lastName: lastName}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (parentName != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {parentName: parentName}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (parentNumber != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {parentNumber: parentNumber}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (parentEmail != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {parentEmail: parentEmail}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (dateOfBirth != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {dateOfBirth: dateOfBirth}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (studentPhone != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {studentPhone: studentPhone}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (studentEmail != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {studentEmail: studentEmail}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (aadhaarNumber != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {aadhaarNumber: aadhaarNumber}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (tenthPassingMonth != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {tenthPassingMonth: tenthPassingMonth}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (tenthMarks != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {tenthMarks: tenthMarks}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (twelfthPassingMonth != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {twelfthPassingMonth: twelfthPassingMonth}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (twelfthMarks != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {twelfthMarks: twelfthMarks}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (nucatNo != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {nucatNo: nucatNo}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (nucatRank != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {nucatRank: nucatRank}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }
  if (nucatMonth != '')
  {
    Admission.updateOne({password: loginDetails.password},{$set: {nucatMonth: nucatMonth}}, function(err){
      if(err){
        console.log(err);
      }
    })
  }

  res.render("popup-changedetails");
});


// Certificates Page
app.get("/certificate", function(req, res){
  res.render("certificate", {foundItem: loginDetails});
});

app.post("/certificate", function(req, res){
  var type = req.body.type;

  if (type === "transfer" && loginDetails.transCertCol === false){
    Admission.updateOne({usn: loginDetails.usn}, {$set: {transCert: true}}, function(err){
      if (err){
        console.log(err);
      }
    })
    Admission.findOne({usn:loginDetails.usn}, function(err, foundItem){
      if (err){
        console.log(err);
      }else{
        loginDetails = foundItem;
        res.render("certificate", {foundItem: loginDetails});
      }
    })
  } else if (type === "study" && loginDetails.studyCertCol === false){
    Admission.updateOne({usn: loginDetails.usn}, {$set: {studyCert: true}}, function(err){
      if (err){
        console.log(err);
      }
    })
    Admission.findOne({usn:loginDetails.usn}, function(err, foundItem){
      if (err){
        console.log(err);
      }else{
        loginDetails = foundItem;
        res.render("certificate", {foundItem: loginDetails});
      }
    })
  }
})

app.get("/transdownload", function(req, res){
  res.download("./public/Certificates/"+loginDetails.usn+"-Transfer.pdf");
})

app.get("/studydownload", function(req, res){
  res.download("./public/Certificates/"+loginDetails.usn+"-Study.pdf");
})

// Change Password Page
app.get("/changepassword", function(req, res){
  res.render("changepassword");
});

app.post("/changepassword", function(req, res){
  const curPass = req.body.curPass;
  const newPass1 = req.body.newPass1;
  const newPass2 = req.body.newPass2;

  if (loginDetails.password === curPass && newPass1 === newPass2){
    Admission.updateOne({password: loginDetails.password}, {$set: {password: newPass1}}, function(err){
      if (err){
        console.log(err);
      }
    });
    res.render("popup-passwordchange");
  }else if(loginDetails.password === curPass && newPass1 != newPass2){
    res.send("<h1>Passwords don't match. Try again!</h1>");
  }else{
    res.send("<h1>Incorrect password. Try again!</h1>");
  }
});


app.get("/documents", function(req, res){
  res.render("documents", {foundItem: loginDetails});
});

app.get("/adminpage", function(req, res){
  res.render("adminpage", {foundItem: loginDetails, studentList: adminDetails})
})

app.get("/adminrequest", function(req, res){
  res.render("adminrequest", {studentList: adminDetails});
})

app.post("/adminrequest", function(req, res){
  var usn = req.body.usn;
  var stat = req.body.stat;
  var type = req.body.type;

  if(type == "transfer"){
    if (stat == "true"){
      Admission.updateMany({usn: usn}, {$set: {transCert: false, transCertCol: true}}, function(err){
        if (err){
          console.log(err)
        }
      });

      Admission.findOne({usn: usn},function(err, foundItem){
        if(err){
          console.log(err);
        }else{
          doc.pipe(fs.createWriteStream("public/Certificates/"+foundItem.usn+"-Transfer.pdf"));
          doc.rect(0, 0, doc.page.width, doc.page.height).fill('#fff');
          const distanceMargin = 18;
          doc
            .fillAndStroke('#0e8cc3')
            .lineWidth(20)
            .lineJoin('round')
            .rect(
              distanceMargin,
              distanceMargin,
              doc.page.width - distanceMargin * 2,
              doc.page.height - distanceMargin * 2,
            )
            .stroke();


          const maxWidth = 140;
          const maxHeight = 70;
          doc.image(
            'public/Images/main-logo.png',
            doc.page.width / 2 - maxWidth / 2,
            60,
            {
              fit: [maxWidth, maxHeight],
              align: 'center',
             }
          );


          function jumpLine(doc, lines) {
            for (let index = 0; index < lines; index++) {
              doc.moveDown();
            }
          }
          jumpLine(doc, 5);


          doc
            .fontSize(50)
            .fill('#0e8cc3')
            .text('Transfer Certificate', {
              align: 'center',
            }
          );

          jumpLine(doc, 1);

          doc
            .fontSize(25)
            .fill('black')
            if (foundItem.middleName != ''){
              doc
                .fontSize(25)
                .fill('black')
                .text('This is to certify that Mr/Mrs ' + foundItem.firstName +' '+ foundItem.middleName +' '+ foundItem.lastName + ',USN ' + foundItem.usn + ' son/daughter of ' + foundItem.parentName + ' was a student of our institution and has passed the ' + foundItem.semester + ' semester with a CGPA of ' + foundItem.cgpa + ' as a student of NMAM Institute of Technology', {align: 'center'});
            }else{
              doc
                .fontSize(25)
                .fill('black')
                .text('This is to certify that Mr/Mrs ' + foundItem.firstName +' '+ foundItem.lastName + ',USN ' + foundItem.usn + ' son/daughter of ' + foundItem.parentName + ' was a student of our institution and has passed the ' + foundItem.semester + ' semester with a CGPA of ' + foundItem.cgpa + ' as a student of NMAM Institute of Technology', {align: 'center'});
            }



          const lineSize = 174;
          const signatureHeight = 500;
          doc.lineWidth(2);
          doc.fillAndStroke('#021c27');
          doc.strokeOpacity(0.2);
          const startLine1 = 108;
          const endLine1 = 108 + lineSize;
          // Creates a line
          doc
            .moveTo(startLine1, signatureHeight)
            .lineTo(endLine1, signatureHeight)
            .stroke();
          // Evaluator info
          doc
            .fontSize(10)
            .fill('#021c27')
            .text(
              'Dr. Niranjan N Chiplunkar',
              startLine1,
              signatureHeight + 10,
              {
                columns: 1,
                columnGap: 0,
                height: 60,
                width: lineSize,
                align: 'center',
              }
            );
          doc
            .fontSize(10)
            .fill('#021c27')
            .text(
              'Principal',
              startLine1,
              signatureHeight + 25,
              {
                columns: 1,
                columnGap: 0,
                height: 40,
                width: lineSize,
                align: 'center',
              }
            );


                const startLine3 = 556;
                const endLine3 = 556 + lineSize;
                // Creates a line
                doc
                  .moveTo(startLine3, signatureHeight)
                  .lineTo(endLine3, signatureHeight)
                  .stroke();
                // Evaluator info
                doc
                  .fontSize(10)
                  .fill('#021c27')
                  .text(
                    'Mr/Mrs ' + foundItem.firstName +' '+ foundItem.middleName +' '+ foundItem.lastName,
                    startLine3,
                    signatureHeight + 10,
                    {
                      columns: 1,
                      columnGap: 0,
                      height: 60,
                      width: lineSize,
                      align: 'center',
                    }
                  );
                doc
                  .fontSize(10)
                  .fill('#021c27')
                  .text(
                    'Student',
                    startLine3,
                    signatureHeight + 25,
                    {
                      columns: 1,
                      columnGap: 0,
                      height: 40,
                      width: lineSize,
                      align: 'center',
                    }
                  );

          doc.end();
        }
      });
      Admission.find({}, function(err, foundItems){
        if(err){
          console.log(err);
        }else{
          adminDetails = foundItems
          res.render("adminrequest", {studentList: adminDetails});
        }
      })
    }else{
      Admission.updateOne({usn: usn}, {$set: {transCert: false}}, function(err){
        if (err){
          console.log(err)
        }
      });
      Admission.find({}, function(err, foundItems){
        if(err){
          console.log(err);
        }else{
          adminDetails = foundItems
          res.render("adminrequest", {studentList: adminDetails});
        }
      })
    }
  }


  else if (type == "study") {
    if (stat == "true"){
      Admission.updateOne({usn: usn}, {$set: {studyCert: false, studyCertCol: true}}, function(err){
        if (err){
          console.log(err)
        }
      });

      Admission.findOne({usn: usn},function(err, foundItem){
        if(err){
          console.log(err);
        }else{
          doc.pipe(fs.createWriteStream("public/Certificates/"+foundItem.usn+"-Study.pdf"));
          doc.rect(0, 0, doc.page.width, doc.page.height).fill('#fff');
          const distanceMargin = 18;
          doc
            .fillAndStroke('#0e8cc3')
            .lineWidth(20)
            .lineJoin('round')
            .rect(
              distanceMargin,
              distanceMargin,
              doc.page.width - distanceMargin * 2,
              doc.page.height - distanceMargin * 2,
            )
            .stroke();


          const maxWidth = 140;
          const maxHeight = 70;
          doc.image(
            'public/Images/main-logo.png',
            doc.page.width / 2 - maxWidth / 2,
            60,
            {
              fit: [maxWidth, maxHeight],
              align: 'center',
             }
          );


          function jumpLine(doc, lines) {
            for (let index = 0; index < lines; index++) {
              doc.moveDown();
            }
          }
          jumpLine(doc, 5);


          doc
            .fontSize(50)
            .fill('#0e8cc3')
            .text('Study Certificate', {
              align: 'center',
            }
          );

          jumpLine(doc, 1);


            if (foundItem.middleName != ''){
              doc
                .fontSize(25)
                .fill('black')
                .text('This is to certify that ' + foundItem.firstName +' '+ foundItem.middleName +' '+ foundItem.lastName + ' , USN ' + foundItem.usn + ' is a bonifide student studying in ' + foundItem.semester + ' semester ,B.E Degree Course in ' + foundItem.course + ' in this institution for the academic year 2022-23.', {align: 'center'});
            }else{
              doc
                .fontSize(25)
                .fill('black')
                .text('This is to certify that ' + foundItem.firstName +' '+ foundItem.middleName +' '+ foundItem.lastName + ' , USN ' + foundItem.usn + ' is a bonifide student studying in ' + foundItem.semester + ' semester ,B.E Degree Course in ' + foundItem.course + ' in this institution for the academic year 2022-23.', {align: 'center'});
            }


          const lineSize = 174;
          const signatureHeight = 500;
          doc.lineWidth(2);
          doc.fillAndStroke('#021c27');
          doc.strokeOpacity(0.2);
          const startLine1 = 108;
          const endLine1 = 108 + lineSize;
          // Creates a line
          doc
            .moveTo(startLine1, signatureHeight)
            .lineTo(endLine1, signatureHeight)
            .stroke();
          // Evaluator info
          doc
            .fontSize(10)
            .fill('#021c27')
            .text(
              'Dr. Niranjan N Chiplunkar',
              startLine1,
              signatureHeight + 10,
              {
                columns: 1,
                columnGap: 0,
                height: 60,
                width: lineSize,
                align: 'center',
              }
            );
          doc
            .fontSize(10)
            .fill('#021c27')
            .text(
              'Principal',
              startLine1,
              signatureHeight + 25,
              {
                columns: 1,
                columnGap: 0,
                height: 40,
                width: lineSize,
                align: 'center',
              }
            );


                const startLine3 = 556;
                const endLine3 = 556 + lineSize;
                // Creates a line
                doc
                  .moveTo(startLine3, signatureHeight)
                  .lineTo(endLine3, signatureHeight)
                  .stroke();
                // Evaluator info
                doc
                  .fontSize(10)
                  .fill('#021c27')
                  .text(
                    'Mr/Mrs ' + foundItem.firstName +' '+ foundItem.middleName +' '+ foundItem.lastName,
                    startLine3,
                    signatureHeight + 10,
                    {
                      columns: 1,
                      columnGap: 0,
                      height: 60,
                      width: lineSize,
                      align: 'center',
                    }
                  );
                doc
                  .fontSize(10)
                  .fill('#021c27')
                  .text(
                    'Student',
                    startLine3,
                    signatureHeight + 25,
                    {
                      columns: 1,
                      columnGap: 0,
                      height: 40,
                      width: lineSize,
                      align: 'center',
                    }
                  );

          doc.end();
        }
      });
      Admission.find({}, function(err, foundItems){
        if(err){
          console.log(err);
        }else{
          adminDetails = foundItems
          res.render("adminrequest", {studentList: adminDetails});
        }
      })
    }
  }else{
    Admission.updateOne({usn: usn}, {$set: {studyCert: false}}, function(err){
      if (err){
        console.log(err)
      }
    });
    Admission.find({}, function(err, foundItems){
      if(err){
        console.log(err);
      }else{
        adminDetails = foundItems
        res.render("adminrequest", {studentList: adminDetails});
      }
    })
  }
});


app.post("/viewmarks", function(req, res){
  var sem = req.body.viewsem;

  Mark.findOne({sem: sem, usn: loginDetails.usn}, function(err, foundItem){
    if (err){
      console.log(err);
    }else{
      res.render("viewmarks", {details: loginDetails, report: foundItem})
    }
  })
})


app.get("/newadmission", function(req, res){
  res.render("newadmission", {foundItem: loginDetails, studentList: adminDetails});
})


app.post("/newadmission", function(req, res){
  var usn = req.body.usn;
  var stat = req.body.stat;

  if (stat === "true"){
    Admission.updateOne({usn: usn}, {$set: {status: true}}, function(err){
      if (err){
        console.log(err)
      }
    });
    Admission.find({}, function(err, foundItems){
      if (err){
        console.log(err);
      }else{
        res.render("newadmission", {studentList: foundItems});
      }
    });
  }else{
    Admission.deleteOne({usn: usn}, function(err){
      if (err){
        console.log(err);
      }
    });
    Admission.find({}, function(err, foundItems){
      if (err){
        console.log(err);
      }else{
        res.render("newadmission", {studentList: foundItems});
      }
    });
  }
});

app.get("/addmarks", function(req, res){
  flag = 0;
  Admission.find({status: true}, function(err, foundItems){
    if (err){
      console.log(err);
    }else{
      res.render("addmarks", {details: foundItems})
    }
  })
})

app.post("/addmarks", function(req, res){
  var chcourse = req.body.chcourse;
  var changeusn = req.body.usn;
  if(chcourse == "all"){
    Admission.find({status: true}, function(err, foundItems){
      if (err){
        console.log(err);
      }else{
        res.render("addmarks", {details: foundItems})
      }
    })
  }else{
    Admission.find({course: chcourse, status: true}, function(err, foundItems){
      if (err){
        console.log(err);
      }else{
        res.render("addmarks", {details: foundItems})
      }
    })
  }
})

app.post("/changemarks", function(req, res){
  var changeusn = req.body.changeusn;
  var chsem = req.body.chsem;
  var subject1 = req.body.subject1;
  var subject2 = req.body.subject2;
  var subject3 = req.body.subject3;
  var subject4 = req.body.subject4;
  var subject5 = req.body.subject5;
  var sgpa = req.body.sgpa;
  var promsem = req.body.promsem;
  var promusn = req.body.promusn;
  if (subject1 != undefined || subject2 != undefined || subject3 != undefined || subject4 != undefined || subject5 != undefined || sgpa != undefined){
    temp_flag = 1;
  }else{
    temp_flag = 0;
  }
  if (flag == 0){
    tempusn = changeusn;
    flag = 1;
    Mark.find({usn: changeusn}, function(err, foundItems){
      if(err){
        console.log(err);
      }else{
        Admission.findOne({usn: changeusn}, function(err, foundItem){
          if(err){
            console.log(err);
          }else{
            changemarks_student = foundItem;
            changemarks_marks = foundItems;
            active = false;
            res.render("changemarks", {active: active, marks: changemarks_marks, details: changemarks_student});
          }
        });
      }
    });
  }else{
    if(promsem != undefined && promusn != undefined){

      if(promsem == "First"){

        const newmark = new Mark({
          usn: promusn,
          year: "First",
          sem: "Second",
          subject1: 0,
          subject2: 0,
          subject3: 0,
          subject4: 0,
          subject5: 0,
          sgpa: 0
        })
        newmark.save();

        Admission.updateOne({usn: promusn}, {$set: {semester: "Second", payment: 0}}, function(err){
          if(err){
            console.log(err);
          }
        })
        Mark.find({usn: promusn}, function(err, foundItems){
          if(err){
            console.log(err);
          }else{
            Admission.findOne({usn: promusn}, function(err, foundItem){
              if(err){
                console.log(err);
              }else{
                changemarks_student = foundItem;
                changemarks_marks = foundItems;
                Mark.findOne({sem: "First"}, function(err, foundItem){
                  if(err){
                    console.log(err);
                  }else{
                    active = true;
                    res.render("changemarks", {active: active, marks: changemarks_marks, details: changemarks_student, report: foundItem});
                  }
                })
              }
            });
          }
        });
      }else if(promsem == "Second"){

        const newmark = new Mark({
          usn: promusn,
          year: "Second",
          sem: "Third",
          subject1: 0,
          subject2: 0,
          subject3: 0,
          subject4: 0,
          subject5: 0,
          sgpa: 0
        })
        newmark.save();
        Admission.updateOne({usn: promusn}, {$set: {semester: "Third", year: "Second", payment: 0}}, function(err){
          if(err){
            console.log(err);
          }
        })
        Mark.find({usn: promusn}, function(err, foundItems){
          if(err){
            console.log(err);
          }else{
            Admission.findOne({usn: promusn}, function(err, foundItem){
              if(err){
                console.log(err);
              }else{
                changemarks_student = foundItem;
                changemarks_marks = foundItems;
                Mark.findOne({sem: "Second"}, function(err, foundItem){
                  if(err){
                    console.log(err);
                  }else{
                    active = true;
                    res.render("changemarks", {active: active, marks: changemarks_marks, details: changemarks_student, report: foundItem});
                  }
                })
              }
            });
          }
        });
      }else if(promsem == "Third"){

        const newmark = new Mark({
          usn: promusn,
          year: "Second",
          sem: "Fourth",
          subject1: 0,
          subject2: 0,
          subject3: 0,
          subject4: 0,
          subject5: 0,
          sgpa: 0
        })
        newmark.save();
        Admission.updateOne({usn: promusn}, {$set: {semester: "Fourth", payment: 0}}, function(err){
          if(err){
            console.log(err);
          }
        })
        Mark.find({usn: promusn}, function(err, foundItems){
          if(err){
            console.log(err);
          }else{
            Admission.findOne({usn: promusn}, function(err, foundItem){
              if(err){
                console.log(err);
              }else{
                changemarks_student = foundItem;
                changemarks_marks = foundItems;
                Mark.findOne({sem: "Third"}, function(err, foundItem){
                  if(err){
                    console.log(err);
                  }else{
                    active = true;
                    res.render("changemarks", {active: active, marks: changemarks_marks, details: changemarks_student, report: foundItem});
                  }
                })
              }
            });
          }
        });
      }else if(promsem == "Fourth"){

        const newmark = new Mark({
          usn: promusn,
          year: "Third",
          sem: "Fifth",
          subject1: 0,
          subject2: 0,
          subject3: 0,
          subject4: 0,
          subject5: 0,
          sgpa: 0
        })
        newmark.save();
        Admission.updateOne({usn: promusn}, {$set: {semester: "Fifth", year: "Third", payment: 0}}, function(err){
          if(err){
            console.log(err);
          }
        })
        Mark.find({usn: promusn}, function(err, foundItems){
          if(err){
            console.log(err);
          }else{
            Admission.findOne({usn: promusn}, function(err, foundItem){
              if(err){
                console.log(err);
              }else{
                changemarks_student = foundItem;
                changemarks_marks = foundItems;
                Mark.findOne({sem: "Fourth"}, function(err, foundItem){
                  if(err){
                    console.log(err);
                  }else{
                    active = true;
                    res.render("changemarks", {active: active, marks: changemarks_marks, details: changemarks_student, report: foundItem});
                  }
                })
              }
            });
          }
        });
      }else if(promsem == "Fifth"){

        const newmark = new Mark({
          usn: promusn,
          year: "Third",
          sem: "Sixth",
          subject1: 0,
          subject2: 0,
          subject3: 0,
          subject4: 0,
          subject5: 0,
          sgpa: 0
        })
        newmark.save();
        Admission.updateOne({usn: promusn}, {$set: {semester: "Sixth", payment: 0}}, function(err){
          if(err){
            console.log(err);
          }
        })
        Mark.find({usn: promusn}, function(err, foundItems){
          if(err){
            console.log(err);
          }else{
            Admission.findOne({usn: promusn}, function(err, foundItem){
              if(err){
                console.log(err);
              }else{
                changemarks_student = foundItem;
                changemarks_marks = foundItems;
                Mark.findOne({sem: "Fifth"}, function(err, foundItem){
                  if(err){
                    console.log(err);
                  }else{
                    active = true;
                    res.render("changemarks", {active: active, marks: changemarks_marks, details: changemarks_student, report: foundItem});
                  }
                })
              }
            });
          }
        });
      }else if(promsem == "Sixth"){

        const newmark = new Mark({
          usn: promusn,
          year: "Fourth",
          sem: "Seventh",
          subject1: 0,
          subject2: 0,
          subject3: 0,
          subject4: 0,
          subject5: 0,
          sgpa: 0
        })
        newmark.save();
        Admission.updateOne({usn: promusn}, {$set: {semester: "Seventh", year: "Fourth", payment: 0}}, function(err){
          if(err){
            console.log(err);
          }
        })
        Mark.find({usn: promusn}, function(err, foundItems){
          if(err){
            console.log(err);
          }else{
            Admission.findOne({usn: promusn}, function(err, foundItem){
              if(err){
                console.log(err);
              }else{
                changemarks_student = foundItem;
                changemarks_marks = foundItems;
                Mark.findOne({sem: "Sixth"}, function(err, foundItem){
                  if(err){
                    console.log(err);
                  }else{
                    active = true;
                    res.render("changemarks", {active: active, marks: changemarks_marks, details: changemarks_student, report: foundItem});
                  }
                })
              }
            });
          }
        });
      }else if(promsem == "Seventh"){

        const newmark = new Mark({
          usn: promusn,
          year: "Fourth",
          sem: "Eight",
          subject1: 0,
          subject2: 0,
          subject3: 0,
          subject4: 0,
          subject5: 0,
          sgpa: 0
        })
        newmark.save();
        Admission.updateOne({usn: promusn}, {$set: {semester: "Eight", payment: 0}}, function(err){
          if(err){
            console.log(err);
          }
        })
        Mark.find({usn: promusn}, function(err, foundItems){
          if(err){
            console.log(err);
          }else{
            console.log(foundItems)
            Admission.findOne({usn: promusn}, function(err, foundItem){
              if(err){
                console.log(err);
              }else{
                changemarks_student = foundItem;
                changemarks_marks = foundItems;
                Mark.findOne({sem: "Seventh"}, function(err, foundItem){
                  if(err){
                    console.log(err);
                  }else{
                    active = true;
                    res.render("changemarks", {active: active, marks: changemarks_marks, details: changemarks_student, report: foundItem});
                  }
                })
              }
            });
          }
        });
      }
    }else{
      if (temp_flag == 0){
        tempsem = chsem;
        Mark.findOne({usn: tempusn, sem: tempsem}, function(err, foundItem){
          if(err){
            console.log(err);
          }else{
            active = true;
            res.render("changemarks", {active: active, marks: changemarks_marks, details: changemarks_student, report: foundItem});
          }
        })
      }else{
        if (subject1 != ''){
          Mark.updateOne({usn: tempusn, sem: tempsem}, {$set: {subject1: subject1}}, function(err){
            if(err){
              console.log(err);
            }
          })
        }
        if (subject2 != ''){
          Mark.updateOne({usn: tempusn, sem: tempsem}, {$set: {subject2: subject2}}, function(err){
            if(err){
              console.log(err);
            }
          })
        }
        if (subject3 != ''){
          Mark.updateOne({usn: tempusn, sem: tempsem}, {$set: {subject3: subject3}}, function(err){
            if(err){
              console.log(err);
            }
          })
        }
        if (subject4 != ''){
          Mark.updateOne({usn: tempusn, sem: tempsem}, {$set: {subject4: subject4}}, function(err){
            if(err){
              console.log(err);
            }
          })
        }
        if (subject5 != ''){
          Mark.updateOne({usn: tempusn, sem: tempsem}, {$set: {subject5: subject5}}, function(err){
            if(err){
              console.log(err);
            }
          })
        }
        if (sgpa != ''){
          count = 0;
          newcgpa = 0;
          Mark.updateOne({usn: tempusn, sem: tempsem}, {$set: {sgpa: sgpa}}, function(err){
            if(err){
              console.log(err);
            }
          })
          Mark.find({usn: tempusn}, function(err, foundItems){
            if(err){
              console.log(err);
            }else{
              console.log(foundItems)
              foundItems.forEach(function(item){
                newcgpa = newcgpa + item.sgpa;
                console.log("in "+newcgpa)
                count++;
                console.log(count)
              })
              newcgpa = newcgpa/count;
              console.log(newcgpa)
              newcgpa = Math.round(newcgpa * 100) / 100;
              console.log(newcgpa)
              Admission.updateOne({usn: tempusn}, {$set: {cgpa: newcgpa}}, function(err){
                if(err){
                  console.log(err);
                }
              })
            }
          })
        }
        Mark.findOne({usn: tempusn, sem: tempsem}, function(err, foundItem){
          if(err){
            console.log(err);
          }else{
            active = true;
            res.render("changemarks", {active: active, marks: changemarks_marks, details: changemarks_student, report: foundItem});
          }
        })
      }
    }
  }
});

app.listen(3000, function() {
  console.log("Server running on port 3000");
})
