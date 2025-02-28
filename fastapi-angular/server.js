const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, "dist/fastapi-angular/browser")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/fastapi-angular/browser", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
