import maskWithReference from "./mask";
import type { MediaTypeObject } from "@omer-x/openapi-types/media-type";
import type { OperationObject } from "@omer-x/openapi-types/operation";
import type { ParameterObject } from "@omer-x/openapi-types/parameter";
import type { ReferenceObject } from "@omer-x/openapi-types/reference";
import type { RequestBodyObject } from "@omer-x/openapi-types/request-body";
import type { ResponseObject, ResponsesObject } from "@omer-x/openapi-types/response";
import type { SchemaObject } from "@omer-x/openapi-types/schema";
import type { ZodType } from "zod";

function maskSchema(storedSchemas: Record<string, ZodType>, schema?: SchemaObject) {
  if (!schema) return schema;
  return maskWithReference(schema, storedSchemas, true);
}

function maskParameterSchema(param: ParameterObject | ReferenceObject, storedSchemas: Record<string, ZodType>) {
  if ("$ref" in param) return param;
  return { ...param, schema: maskSchema(storedSchemas, param.schema) } as ParameterObject;
}

function maskContentSchema(storedSchemas: Record<string, ZodType>, bodyContent?: Record<string, MediaTypeObject>) {
  if (!bodyContent) return bodyContent;
  return Object.entries(bodyContent).reduce((collection, [contentType, content]) => ({
    ...collection,
    [contentType]: {
      ...content,
      schema: maskSchema(storedSchemas, content.schema),
    },
  }), {} as Record<string, MediaTypeObject>);
}

function maskRequestBodySchema(storedSchemas: Record<string, ZodType>, body?: RequestBodyObject | ReferenceObject) {
  if (!body || "$ref" in body) return body;
  return { ...body, content: maskContentSchema(storedSchemas, body.content) } as RequestBodyObject;
}

function maskResponseSchema(storedSchemas: Record<string, ZodType>, response: ResponseObject | ReferenceObject) {
  if ("$ref" in response) return response;
  return { ...response, content: maskContentSchema(storedSchemas, response.content) };
}

function maskSchemasInResponses(storedSchemas: Record<string, ZodType>, responses?: ResponsesObject) {
  if (!responses) return responses;
  return Object.entries(responses).reduce((collection, [key, response]) => ({
    ...collection,
    [key]: maskResponseSchema(storedSchemas, response),
  }), {} as ResponsesObject);
}

export default function maskOperationSchemas(operation: OperationObject, storedSchemas: Record<string, ZodType>) {
  return {
    ...operation,
    parameters: operation.parameters?.map(p => maskParameterSchema(p, storedSchemas)),
    requestBody: maskRequestBodySchema(storedSchemas, operation.requestBody),
    responses: maskSchemasInResponses(storedSchemas, operation.responses),
  } as OperationObject;
}
