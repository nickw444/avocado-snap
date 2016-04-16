import 'babel-polyfill';

import express from 'express';
import multer from 'multer';
import Promise from 'bluebird';
import fs from 'fs'
import path from 'path'
import leftpad from 'left-pad';
import {sortedImages, generateTimelapse} from './lib';
import config from './config';
import log from './log';
import bunyanMiddleware from 'bunyan-middleware';
Promise.promisifyAll(fs);

const app = express();
app.use(bunyanMiddleware({logger: log}))

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, config.uploadsDir) },
  filename: (req, file, cb) => {
    sortedImages(config.uploadsDir)
      .then((images) => {
        // Determine the next image sequence number
        const latest = images.pop();
        let seq = 0;
        if (latest) {
          [, seq] = latest.file.match(/IMG_(\d+).jpg/);
          seq = parseInt(seq) + 1;
        }
        seq = leftpad(seq, 6, 0);
        cb(null, `IMG_${seq}.jpg`)
      })
  }
})

const upload = multer({ storage: storage })


app.get('/', (req, res) => {
  res.sendFile('index.html', {root: __dirname})
});

app.get('/latest.jpg', async (req, res) => {
  let sortedFiles = await sortedImages(config.uploadsDir);
  const latest = sortedFiles.pop();

  if (latest) {
    res.sendFile(latest.file, {root: config.uploadsDir});
  }
  else {
    log.error("No files available to serve to the user.");
    res.status(404).send("No file found");
  }
})

app.get('/stream.mp4', async (req, res) => {
  let regenerate = false;
  try {
    const existingTimelapseStat = await fs.statAsync(config.timelapseFile);
    const diff = new Date().getTime() - existingTimelapseStat.mtime.getTime();
    if (diff > 60 * 60 * 1000) regenerate = true; //Older than 60 mins
  } catch (err) { // File probably doesn't exist. Regenerate it
    regenerate = true;
  }

  if (regenerate) {
    log.info("Regnerating timelapse video with ffmpeg");
    try {
      await generateTimelapse(path.join(config.uploadsDir, 'IMG_%06d.jpg'), config.timelapseFile);
    } catch (err) {
      log.error(err);
      return res.status(500).send("Error whilst generating timelapse video. Have you uploaded an image yet?");
    }
  }
  res.sendFile(config.timelapseFile)
})

function authRequired(req, res, next) {
  if (req.header('Authorization') !== config.uploadSecret)
    return res.status(403).send("Access denied");

  return next();
}

app.post('/', authRequired, upload.single('image'), (req, res) => {
  // Upload an image
  res.send("Thanks for uploading!");
})

app.listen(3000, () => {
  log.info('Avocado-snap listening on port 3000!');
});