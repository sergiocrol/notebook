import express from "express";
import fs from "fs/promises";
import path from "path";

interface Cell {
  id: string;
  content: string;
  type: "text" | "code";
}

export const createCellsRouter = (filename: string, dir: string) => {
  const router = express.Router();
  router.use(express.json());

  const fullPath = path.join(dir, filename);

  router.get("/cells", async (req, res) => {
    // When the user inits the project the first time, he needs to provide a filename,
    // so we need to check if that file exists, and if not, we can create it with a default list of cells
    try {
      const result = await fs.readFile(fullPath, "utf8");

      res.send(JSON.parse(result));
    } catch (e) {
      // if the file does not exist, it will throw an error, so we need to create it
      if (e.code === "ENOENT") {
        // Add code to create a file and add default cells
        await fs.writeFile(fullPath, "[]", "utf-8");
        res.send([]);
      } else {
        throw e;
      }
    }
  });

  router.post("/cells", async (req, res) => {
    const { cells }: { cells: Cell[] } = req.body;

    await fs.writeFile(fullPath, JSON.stringify(cells), "utf-8");

    res.send({ status: "ok" });
  });

  return router;
};
