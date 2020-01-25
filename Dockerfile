FROM node:11
RUN apt-get update -qq && apt-get install -y build-essential

EXPOSE 3000

ENV APP_HOME /app
RUN mkdir $APP_HOME
WORKDIR $APP_HOME

ADD yarn.lock package.json index.js $APP_HOME/
RUN yarn

ENV PORT 3000
CMD npm run start
