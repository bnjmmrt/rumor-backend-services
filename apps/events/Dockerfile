FROM public.ecr.aws/docker/library/node:20 as development

EXPOSE 5051

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["node", "dist/index.ts"]
