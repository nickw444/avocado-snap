# Avocado Timelapse Server

## Dev
```
cp .env.example .env

npm install
npm start
```

## Building
```
# Babelify everything
npm run build
# Put on docker
docker build -t nickw444/avocado-snap .

# Push to docker
docker push nickw444/avocado-snap
```

## Running
```
docker pull nickw444/avocado-snap

docker run -it --rm --name avocado-snap -e UPLOAD_SECRET=<change me> -p 3000:3000 nickw444/avocado-snap
```

### Environment / Volumes
Uploads are by default stored in `/uploads`. You can mount this volume.

You must set environment variable `UPLOAD_SECRET`. 

### API Reference

#### GET /
Retreive the HTML formatted home page which contains the latest snapshot and a video of the snapshots.

#### POST /
Submit a new picture to the server. You must provide the `Authorization` header set to the same value as the environment variable `UPLOAD_SECRET`

#### GET /latest.jpg
Retrieve the newest uploaded image

#### GET /stream.mp4
Retreive the MP4 encoded timelapse. These are re-generated on demand, max once per hour.
