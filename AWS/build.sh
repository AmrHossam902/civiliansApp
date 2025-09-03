docker build \
--build-arg NEXT_PUBLIC_URL=http://alb-1419133554.us-east-1.elb.amazonaws.com \
--build-arg FRONTEND_CONTAINER_PORT=80 \
-t civilians-frontend-prod \
../FrontEnd/.;


docker build \
-t civilians-backend-prod \
../graphql-api/.;