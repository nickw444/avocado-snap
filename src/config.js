import path from 'path';
import dotenv from 'dotenv';
import log from './log';

if (!process.env.NODE_ENV || process.env.NODE_ENV ==! 'production') {
  log.info("Loading .env file");
  dotenv.config();
}

module.exports = {
  uploadSecret: process.env.UPLOAD_SECRET,
  uploadsDir: path.resolve(path.join(__dirname, '../'), process.env.UPLOADS_DIR),
  timelapseFile: path.join(path.resolve(path.join(__dirname, '../'), process.env.UPLOADS_DIR), 'timelapse.mp4'),
}

log.info({config: module.exports }, "Started with config")
