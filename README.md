# Next OpenAPI JSON Generator

[![npm version](https://badge.fury.io/js/%40omer-x%2Fnext-openapi-json-generator.svg)](https://badge.fury.io/js/%40omer-x%2Fnext-openapi-json-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`Next OpenAPI JSON Generator` is an open-source Next.js plugin that extracts and generates OpenAPI JSON specifications from your route handlers defined using `@omer-x/next-openapi-route-handler`. It simplifies the process of generating and maintaining OpenAPI documentation by leveraging TypeScript and Zod schemas.

**Key Features:**
- **Automated OpenAPI Generation**: Automatically generates OpenAPI JSON specs from your route handlers.
- **TypeScript Integration**: Seamlessly integrates with TypeScript for strong type-checking.
- **Zod Schema Support**: Uses Zod schemas for validation and generates JSON schemas for OpenAPI.
- **Next.js Compatibility**: Works seamlessly with Next.js and integrates with other server-side libraries.

> **Note:** This package works in conjunction with [`Next OpenAPI Route Handler`](https://www.npmjs.com/package/@omer-x/next-openapi-route-handler) to extract the generated OpenAPI JSON.

## Requirements

To use `@omer-x/next-openapi-json-generator`, you'll need the following dependencies in your Next.js project:

- [TypeScript](https://www.typescriptlang.org/) >= v5
- [Next.js](https://nextjs.org/) >= v13
- [Zod](https://zod.dev/) >= v3
- [Next OpenAPI Route Handler](https://www.npmjs.com/package/@omer-x/next-openapi-route-handler)

## Installation

To install this package, along with its peer dependency, run:

```sh
npm install @omer-x/next-openapi-json-generator @omer-x/next-openapi-route-handler
```

## Usage

The `generateOpenApiSpec` function is used to extract and generate the OpenAPI JSON specification from your defined models. Here's a description of how to use it:

### Example

```typescript
import generateOpenApiSpec from "@omer-x/next-openapi-json-generator";
import { NewUserDTO, UserDTO, UserPatchDTO } from "../models/user";

const Page = async () => {
  const spec = await generateOpenApiSpec({
    UserDTO,
    NewUserDTO,
    UserPatchDTO,
  }, {
    // options
  });
  return <ReactSwagger spec={spec} />;
};

export default Page;
```

### Parameters

The `generateOpenApiSpec` function takes an object with the following properties:

| Property | Type                                       | Description                                                                        |
| -------- | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| models   | Record<string, [ZodType](https://zod.dev)> | An object where keys are model names and values are Zod schemas                    |
| options  | Object                                     | `(Optional)` An object to customize the functionality of the generator (see below) |

#### Options

| Property         | Type     | Description                                                                                                                                                                            |
| ---------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| include          | string[] | `(Optional)` An array of strings which specifies the routes will be included to the JSON output                                                                                        |
| exclude          | string[] | `(Optional)` An array of strings which specifies the routes will be excluded from the JSON output                                                                                      |
| routeDefinerName | string   | `(Optional)` Name of the function that was exported from the [`Next OpenAPI Route Handler`](https://www.npmjs.com/package/@omer-x/next-openapi-route-handler) (Default: `defineRoute`) |

### Result

The function returns a promise that resolves to an OpenAPI JSON specification.

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "User Service",
    "version": "1.0.0"
  },
  "paths": {
    "/users": {
      "get": {
        ...
      },
      "post": {
        ...
      }
    },
    "/users/{id}": {
      "get": {
        "operationId": "getUser",
        "summary": "Get a specific user by ID",
        "description": "Retrieve details of a specific user by their ID",
        "tags": [
          "Users"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "description": "ID of the user",
            "schema": {
              "type": "string",
              "description": "ID of the user"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "User details retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UserDTO"
                }
              }
            }
          },
          "404": {
            "description": "User not found"
          }
        }
      },
      "patch": {
        ...
      },
      "delete": {
        ...
      }
    }
  },
  "components": {
    "schemas": {
      "UserDTO": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "description": "Unique identifier of the user"
          },
          "name": {
            "type": "string",
            "description": "Display name of the user"
          },
          "email": {
            "type": "string",
            "description": "Email address of the user"
          },
          "password": {
            "type": "string",
            "maxLength": 72,
            "description": "Encrypted password of the user"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time",
            "description": "Creation date of the user"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "description": "Modification date of the user"
          }
        },
        "required": [
          "id",
          "name",
          "email",
          "password",
          "createdAt",
          "updatedAt"
        ],
        "additionalProperties": false,
        "description": "Represents the data of a user in the system."
      },
      "NewUserDTO": {
        ...
      },
      "UserPatchDTO": {
        ...
      }
    }
  }
}
```

[An example can be found here](https://github.com/omermecitoglu/example-user-service)

## Screenshots

| <a href="https://i.imgur.com/ru3muBc.png" target="_blank"><img src="https://i.imgur.com/ru3muBc.png" alt="screenshot-1"></a> | <a href="https://i.imgur.com/utHaZ6X.png" target="_blank"><img src="https://i.imgur.com/utHaZ6X.png" alt="screenshot-2"></a> | <a href="https://i.imgur.com/2f24kPE.png" target="_blank"><img src="https://i.imgur.com/2f24kPE.png" alt="screenshot-3"></a> | <a href="https://i.imgur.com/z3KIJQ1.png" target="_blank"><img src="https://i.imgur.com/z3KIJQ1.png" alt="screenshot-4"></a> |
|:--------------:|:--------------:|:--------------:|:--------------:|
| <a href="https://i.imgur.com/IFKXOiX.png" target="_blank"><img src="https://i.imgur.com/IFKXOiX.png" alt="screenshot-5"></a> | <a href="https://i.imgur.com/xzVjAPq.png" target="_blank"><img src="https://i.imgur.com/xzVjAPq.png" alt="screenshot-6"></a> | <a href="https://i.imgur.com/HrWuHOR.png" target="_blank"><img src="https://i.imgur.com/HrWuHOR.png" alt="screenshot-7"></a> |  |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
