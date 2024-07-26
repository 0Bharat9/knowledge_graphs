import express from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import { fileURLToPath } from "url"; // Import fileURLToPath from url module
import path from "path";

const __filename = fileURLToPath(import.meta.url); // Convert import.meta.url to filename
const __dirname = path.dirname(__filename); // Determine directory path from filename

const app = express();
const port = 3000;

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index"); // Corresponds to 'views/index.ejs'
});

app.get("/benefits", (req, res) => {
  res.render("benefits"); // Corresponds to 'views/benefits.ejs'
});

app.get("/use", (req, res) => {
  res.render("use"); // Corresponds to 'views/use.ejs'
});

app.get("/rdfc", (req, res) => {
  res.render("rdfc.ejs"); // Corresponds to 'views/rdfc.ejs'
});

app.get("/rdfv", (req, res) => {
  res.render("rdfv"); // Corresponds to 'views/rdfv.ejs'
});

app.get("/contact", (req, res) => {
  res.render("contact"); // Corresponds to 'views/contact.ejs'
});

app.get("/signup", (req, res) => {
  res.render("signup"); // Corresponds to 'views/signup.ejs'
});

app.post("/convert", (req, res) => {
  console.log("Request body:", req.body); // Log the request body

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

app.post("/visualize", (req, res) => {
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

      // Extract the relevant parts of the HTML content for the EJS template
      const headContent = stdout.match(/<head[^>]*>([\s\S]*?)<\/head>/i)[1];
      const bodyContent = stdout.match(/<body[^>]*>([\s\S]*?)<\/body>/i)[1];

      // Render the EJS template with the extracted content
      res.render("rdf_graph.ejs", {
        rdfGraphContent: headContent,
        rdfGraphScript: bodyContent,
      });
    },
  );

  child.stdin.write(visualize);
  child.stdin.end();
});

app.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
