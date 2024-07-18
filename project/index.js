import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
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
  res.render("rdfc"); // Corresponds to 'views/rdfc.ejs'
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
  const convert = req.body.data;
  const file_type = req.body.fileType;
  fs.writeFileSync("./convert.txt", convert);

  exec(`python3 convert.py ${file_type}`, (error) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res
        .status(500)
        .send("An error occurred while processing the RDF data.");
    }
    const final = fs.readFileSync("./output.txt");
    res.render("rdfc.ejs", {
      output: final,
    });
  });
});

app.post("/visualize", (req, res) => {
  const visualize = req.body.data;
  // Save the RDF code to a file
  fs.writeFileSync("./visualize.txt", visualize);

  // Execute the Python script with the input RDF file
  exec(`python3 visualize.py`, (error) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res
        .status(500)
        .send("An error occurred while processing the RDF data.");
    }

    const rdfGraphHtmlPath = path.join(__dirname, "views", "rdf_graph.html");
    const rdfGraphHtmlContent = fs.readFileSync(rdfGraphHtmlPath, "utf-8");

    // Extract the relevant parts of the HTML content for the EJS template
    const headContent = rdfGraphHtmlContent.match(
      /<head[^>]*>([\s\S]*?)<\/head>/i,
    )[1];
    const bodyContent = rdfGraphHtmlContent.match(
      /<body[^>]*>([\s\S]*?)<\/body>/i,
    )[1];

    // Render the EJS template with the extracted content
    res.render("rdf_graph.ejs", {
      rdfGraphContent: headContent,
      rdfGraphScript: bodyContent,
    });
  });
});

app.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
