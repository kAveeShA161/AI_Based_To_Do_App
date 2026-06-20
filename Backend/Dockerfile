FROM node:22-alpine

# The AWS Lambda Web Adapter is used to run the application in AWS Lambda environment.
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:1.0.1 /lambda-adapter /opt/extensions/lambda-adapter

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --chown=node:node . .

ENV NODE_ENV=production

EXPOSE 8080
ENV PORT=8080

USER node

CMD ["npm", "start"]
