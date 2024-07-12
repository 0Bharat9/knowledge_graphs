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

app.get("/", async (req, res) => {
  res.render("index");
});

app.post("/new", (req, res) => {
  const code = req.body.rdf;

  // Save the RDF code to a file
  fs.writeFileSync("./input.rdf", code);

  // Execute the Python script with the input RDF file
  exec("python3 test.py", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res
        .status(500)
        .send("An error occurred while processing the RDF data.");
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);

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
