FROM node

ADD . /app
WORKDIR /app
RUN npm install

ENV PREFIX ""
ENV ADMIN_USERNAME ""
ENV ADMIN_PASSWORD ""
ENV NODE_ENV production
ENV TYPEORM_CONNECTION "postgres"
ENV TYPEORM_ENTITIES "dist/src/entities/*.js"
ENV TYPEORM_MIGRATIONS "dist/src/migration/*.js"
ENV TYPEORM_SUBSCRIBERS "dist/src/subscriber/*.js"
ENV TYPEORM_LOGGING "true"
ENV EXPRESS_TRUST_PROXY "loopback, linklocal, uniquelocal"

CMD [ "npm", "start" ]
