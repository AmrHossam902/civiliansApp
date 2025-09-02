docker build \
--build-arg NEXT_PUBLIC_API_URL=http://civilians-1929392670.us-east-1.elb.amazonaws.com \
--build-arg NEXT_PUBLIC_FRONTEND_URL=http://civilians-1929392670.us-east-1.elb.amazonaws.com \
-t civilians-frontend \
../FrontEnd/.;

docker build \
-t civilians-backend \
../graphql-api/.;