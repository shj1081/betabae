.PHONY: up down down-v restart dev install build clean \
        prisma-init prisma-generate prisma-migrate

# Docker commands
up:
	docker-compose -f infra-dev/docker-compose.yaml up -d

down:
	docker-compose -f infra-dev/docker-compose.yaml down

down-v:
	docker-compose -f infra-dev/docker-compose.yaml down -v

reset: down up

# NestJS backend path helper
BACKEND_PATH=app/backend

# NestJS commands
install:
	cd $(BACKEND_PATH) && yarn install

dev:
	cd $(BACKEND_PATH) && yarn start:dev

build:
	cd $(BACKEND_PATH) && yarn build

# Prisma commands
prisma-generate:
	cd $(BACKEND_PATH) && npx prisma generate

prisma-migrate:
	cd $(BACKEND_PATH) && npx prisma migrate dev


# Clean up
clean:
	docker-compose -f infra-dev/docker-compose.yaml down -v
	rm -rf $(BACKEND_PATH)/dist
	rm -rf $(BACKEND_PATH)/node_modules
