import answers from "./src/lib/answers.json" assert { type: "json" };
import { exec, spawn } from "child_process";
import path from "path";
import { mkdir } from "fs/promises";

const snippets = [2 ** -1, 2 ** 0, 2 ** 1, 2 ** 2, 2 ** 3, 2 ** 4];

const SONGS_FOLDER = "Media Downloads/heardle-edm";
const OUTPUT_FOLDER = "./src/songs";

try {
  await mkdir(OUTPUT_FOLDER);
} catch (e) {
  if (e.errno !== -17) throw e;
}

for (const answer of answers) {
  const tasks = [];
  for (const [snippet, length] of snippets.entries()) {
    try {
      await mkdir(path.join(OUTPUT_FOLDER, answer));
    } catch (e) {
      if (e.errno !== -17) throw e;
    }

    tasks.push(
      new Promise((resolve, reject) => {
        const proc = spawn(
          "convert",
          [
              path.join(process.env.HOME, SONGS_FOLDER, `${answer}.jpg`),
              "-resize",
              "256x256",
            path.join(OUTPUT_FOLDER, answer, `cover.png`),
          ],
          {
            stdio: "inherit",
          }
        );

        proc.on("close", (code) => {
          console.log({ code });
          if (code === 0) resolve();
          else reject();
        });
      })
    );

    tasks.push(
      new Promise((resolve, reject) => {
        const proc = spawn(
          "ffmpeg",
            [
              "-y",
            "-i",
                path.join(process.env.HOME, SONGS_FOLDER, `${answer}.m4a`),
            "-t",
                `00:00:${length}`,
                "-c:a",
                "libmp3lame",
                "-q:a",
            (snippet).toString(),
            path.join(OUTPUT_FOLDER, answer, `${snippet}.mp3`),
          ],
          {
            stdio: "inherit",
          }
        );

        proc.on("close", (code) => {
          console.log({ code });
          if (code === 0) resolve();
          else reject();
        });
      })
    );
  }
    await Promise.all(tasks);
}
