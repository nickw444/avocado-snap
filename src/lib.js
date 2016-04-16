import fs from 'fs';
import path from 'path';
import Promise from 'bluebird';
import ffmpeg from 'fluent-ffmpeg'

Promise.promisifyAll(fs);

export async function sortedImages(imageDir) {
  let files = await fs.readdirAsync(imageDir);
  files = files.filter((filename) => filename.endsWith('.jpg'))
  let stat = files.map((file) => {
    return new Promise((resolve, reject) => {
      fs.statAsync(path.join(imageDir, file))
        .then((stats) => {
          resolve({file: file, stats: stats})
        })
        .catch(reject)
    })
  })
  let fileStats = await Promise.all(stat);
  let sortedFiles = fileStats.sort((a, b) => {
    return a.stats.ctime.getTime() - b.stats.ctime.getTime()
  });
  return sortedFiles;
}

export function generateTimelapse(inputPattern, outputFile) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPattern)
      .withInputFPS(15)
      .withSize('1280x960')
      .withVideoCodec('libx264')
      .outputFormat('mp4')
      .outputOptions('-pix_fmt yuv420p')
      .outputOptions('-preset ultrafast')
      .output(outputFile)
      .on('end', () => {
        resolve(outputFile)
      })
      .on('error', (err) => {
        reject(err)
      })
      .run()
  })
}
