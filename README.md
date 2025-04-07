# tribal-ffarm

This project was created using the [Ktor Project Generator](https://start.ktor.io).

Here are some useful links to get you started:

- [Ktor Documentation](https://ktor.io/docs/home.html)
- [Ktor GitHub page](https://github.com/ktorio/ktor)
- The [Ktor Slack chat](https://app.slack.com/client/T09229ZC6/C0A974TJ9). You'll need
  to [request an invite](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) to join.

## Features

Here's a list of features included in this project:

| Name                                                                   | Description                                                                        |
| ------------------------------------------------------------------------|------------------------------------------------------------------------------------ |
| [Routing](https://start.ktor.io/p/routing)                             | Provides a structured routing DSL                                                  |
| [Authentication](https://start.ktor.io/p/auth)                         | Provides extension point for handling the Authorization header                     |
| [Authentication Basic](https://start.ktor.io/p/auth-basic)             | Handles 'Basic' username / password authentication scheme                          |
| [Content Negotiation](https://start.ktor.io/p/content-negotiation)     | Provides automatic content conversion according to Content-Type and Accept headers |
| [kotlinx.serialization](https://start.ktor.io/p/kotlinx-serialization) | Handles JSON serialization using kotlinx.serialization library                     |
| [Sessions](https://start.ktor.io/p/ktor-sessions)                      | Adds support for persistent sessions through cookies or headers                    |
| [AutoHeadResponse](https://start.ktor.io/p/auto-head-response)         | Provides automatic responses for HEAD requests                                     |
| [Resources](https://start.ktor.io/p/resources)                         | Provides type-safe routing                                                         |
| [Status Pages](https://start.ktor.io/p/status-pages)                   | Provides exception handling for routes                                             |
| [Caching Headers](https://start.ktor.io/p/caching-headers)             | Provides options for responding with standard cache-control headers                |
| [Conditional Headers](https://start.ktor.io/p/conditional-headers)     | Skips response body, depending on ETag and LastModified headers                    |
| [Default Headers](https://start.ktor.io/p/default-headers)             | Adds a default set of headers to HTTP responses                                    |
| [Simple Cache](https://start.ktor.io/p/simple-cache)                   | Provides API for cache management                                                  |
| [Simple Memory Cache](https://start.ktor.io/p/simple-memory-cache)     | Provides memory cache for Simple Cache plugin                                      |
| [Call Logging](https://start.ktor.io/p/call-logging)                   | Logs client requests                                                               |
| [Call ID](https://start.ktor.io/p/callid)                              | Allows to identify a request/call.                                                 |
| [WebSockets](https://start.ktor.io/p/ktor-websockets)                  | Adds WebSocket protocol support for bidirectional client connections               |

## Building & Running

To build or run the project, use one of the following tasks:

| Task                          | Description                                                          |
| -------------------------------|---------------------------------------------------------------------- |
| `./gradlew test`              | Run the tests                                                        |
| `./gradlew build`             | Build everything                                                     |
| `buildFatJar`                 | Build an executable JAR of the server with all dependencies included |
| `buildImage`                  | Build the docker image to use with the fat JAR                       |
| `publishImageToLocalRegistry` | Publish the docker image locally                                     |
| `run`                         | Run the server                                                       |
| `runDocker`                   | Run using the local docker image                                     |

If the server starts successfully, you'll see the following output:

```
2024-12-04 14:32:45.584 [main] INFO  Application - Application started in 0.303 seconds.
2024-12-04 14:32:45.682 [main] INFO  Application - Responding at http://0.0.0.0:8080
```

## Database Setup

The application uses PostgreSQL as its primary database. Here's how to set it up:

### Prerequisites

1. PostgreSQL 12 or higher installed and running
2. A database created for the application

### Configuration

The database connection is configured in `backend/src/main/resources/application.yaml`. You need to set the following environment variables:

```bash
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

Default database configuration:
- Host: localhost
- Port: 5432
- Database name: tribal_farm
- Connection pool size: 3-10 connections
- Connection timeout: 30 seconds

### Development Setup

1. Install PostgreSQL
2. Create a database:
```sql
CREATE DATABASE tribal_farm;
```
3. Set environment variables for database credentials
4. Run the application

### Testing

The test suite uses H2 in-memory database, so no additional setup is required for running tests.
