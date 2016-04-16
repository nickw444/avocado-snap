FROM mhart/alpine-node:5

ENV UPLOADS_DIR="/uploads"
ENV NODE_ENV="production"

VOLUME "/uploads"

RUN apk add --no-cache ffmpeg

WORKDIR /build
ADD ["package.json", "."]
RUN npm install

ADD "build" "."


CMD node index.js