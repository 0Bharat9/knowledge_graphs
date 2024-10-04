import express from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import { fileURLToPath } from "url";
import path from "path";
import env from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
env.config();

const app = express();
const port = 4000;
const saltRounds = 10;

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // Proceed if the user is authenticated
  } else {
    res.redirect("/login"); // Redirect to login if the user is not authenticated
  }
}

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Middleware to attach user to `res.locals`
app.use((req, res, next) => {
  console.log("Session Data: ", req.session); // Debug session
  console.log("User Data: ", req.user); // Debug user
  res.locals.user = req.user; // Make `user` available in templates
  next();
});

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/benefits", (req, res) => {
  res.render("benefits");
});

app.get("/use", (req, res) => {
  res.render("use");
});

app.get("/rdfc", isAuthenticated, (req, res) => {
  res.render("rdfc.ejs");
});

app.get("/rdfv", isAuthenticated, (req, res) => {
  res.render("rdfv.ejs");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

// Convert route
app.post("/convert", isAuthenticated, (req, res) => {
  console.log("Request body:", req.body);
  const convert = req.body.data;
  const input_file_type = req.body.input_fileType;
  const output_file_type = req.body.output_fileType;

  if (!convert || !output_file_type) {
    return res.render("rdfc.ejs", {
      input: convert,
      output: "Please enter the data and file type",
    });
  }

  const child = exec(
    `python3 ./vis_con/convert.py ${output_file_type} ${input_file_type}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.render("rdfc.ejs", {
          input: convert,
          output: `exec error: ${error}`,
        });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res.render("rdfc.ejs", {
          input: convert,
          output: `stderr: ${stderr}`,
        });
      }

      res.render("rdfc.ejs", {
        input: convert,
        output: stdout,
      });
    },
  );

  child.stdin.write(convert);
  child.stdin.end();
});

// Visualization route
app.post("/visualize", isAuthenticated, (req, res) => {
  const visualize = req.body.data;

  if (!visualize) {
    return res.render("rdfv.ejs");
  }

  const child = exec(
    "python3 ./vis_con/visualize.py",
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.render("rdfv.ejs", {
          input: visualize,
          output: "unable to detect input data format",
        });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res
          .status(500)
          .send("An error occurred while processing the RDF data.");
      }

      const headContent = stdout.match(/<head[^>]*>([\s\S]*?)<\/head>/i)[1];
      const bodyContent = stdout.match(/<body[^>]*>([\s\S]*?)<\/body>/i)[1];

      res.render("rdf_graph.ejs", {
        rdfGraphContent: headContent,
        rdfGraphScript: bodyContent,
      });
    },
  );

  child.stdin.write(visualize);
  child.stdin.end();
});

// User registration route
app.post("/register", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body["confirm-password"];

  if (password !== confirmPassword) {
    res.send("Passwords do not match. Please try again.");
    return;
  }
  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log(err);
        } else {
          const result = await db.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
            [username, email, hash],
          );
          res.redirect("/login");
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// Passport strategy for login
passport.use(
  new Strategy({ usernameField: "email" }, async (email, password, cb) => {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        const match = await bcrypt.compare(password, storedHashedPassword);
        if (match) {
          return cb(null, user);
        } else {
          return cb(null, false, { message: "Incorrect password." });
        }
      } else {
        return cb(null, false, { message: "User not found." });
      }
    } catch (err) {
      return cb(err);
    }
  }),
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = result.rows[0];
    cb(null, user);
  } catch (err) {
    cb(err);
  }
});

// Login route
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
);

// Logout route
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/"); // Redirect to homepage after logout
  });
});

app.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
