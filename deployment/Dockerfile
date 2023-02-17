FROM node:14.14.0
ARG npm_tag
ADD code/ /opt/code
# Bundle APP files
COPY . /opt/code
# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL info
WORKDIR /opt/code
ADD entry-point.sh /opt/code/
RUN chmod 777 /opt/code/entry-point.sh
RUN npm install
RUN npm run build:${npm_tag}
ENV TZ=Asia/Kolkata
# Expose the listening port of your app
ENV PORT 8080
EXPOSE 3000
CMD [ "./entry-point.sh" ]
