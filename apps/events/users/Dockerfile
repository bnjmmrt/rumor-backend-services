# dev build
FROM public.ecr.aws/docker/library/node:20 as development

EXPOSE 50050

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN apt-get install git

RUN yarn --frozen-lockfile

COPY . .

RUN yarn build:auth

# prod build
FROM public.ecr.aws/docker/library/node:20 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN apt-get install git

RUN yarn install --production --frozen-lockfile

COPY . .

COPY --from=development /usr/src/app/dist ./dist

EXPOSE 50050

CMD ["node", "dist/apps/auth/main"]