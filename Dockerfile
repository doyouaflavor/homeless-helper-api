FROM node:8.11.3-alpine

MAINTAINER SuJiaKuan <feabries@gmail.com>

ENV HOME /home/node

USER node

# Create project structure.
RUN mkdir ${HOME}/homeless-helper-api
WORKDIR ${HOME}/homeless-helper-api
COPY --chown=node:node package.json .
COPY --chown=node:node yarn.lock .
COPY --chown=node:node server server

# Install packages.
RUN yarn install && \
    yarn cache clean

ENTRYPOINT ["yarn"]
CMD ["docker-start"]
