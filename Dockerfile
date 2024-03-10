FROM node as base

FROM base as production
WORKDIR /app


COPY package.json . 

RUN npm install 

COPY . .

EXPOSE 3000
CMD ["npm","run","start"]