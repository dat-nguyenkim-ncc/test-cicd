FROM git.bcgplatinion.io:4567/fintech-control-tower/gitlab-runner/node:14

WORKDIR /app
ARG Environment
#RUN npm install -g serverless

COPY . /app
RUN    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64-2.0.30.zip" -o "awscliv2.zip"
RUN    unzip awscliv2.zip
RUN    ./aws/install
RUN    yarn install && yarn build:$Environment
CMD     ["aws"]