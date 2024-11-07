import type { ExampleStrategy } from "~/types/example";
import generateExample from "~/utils/generateExample";
import type { MediaTypeObject } from "@omer-x/openapi-types/media-type";
import type { OperationObject } from "@omer-x/openapi-types/operation";
import type { RequestBodyObject } from "@omer-x/openapi-types/request-body";
import type { ZodType } from "zod";

type InjectorFunction = (schemaRefName: string) => { example?: unknown };

function extractSchemaName(ref: string): string | null {
  const match = ref.match(/#\/components\/schemas\/(.+)/);
  return match ? match[1] : null;
}

function injectExample(strategy: ExampleStrategy, storedSchemas: Record<string, ZodType>, schemaRefName: string) {
  if (strategy === "none") return {};
  const isStrict = strategy === "strict-full" || strategy === "strict-ignore-optionals";
  const ignoreOptionals = strategy === "ignore-optional" || strategy === "strict-ignore-optionals";
  const schemaName = extractSchemaName(schemaRefName);
  if (!schemaName) return {};
  if (schemaName in storedSchemas) {
    return {
      example: generateExample(storedSchemas[schemaName], ignoreOptionals, isStrict),
    };
  }
  return {};
}

function completeMediaTypeExample(mediaType: MediaTypeObject, injector: InjectorFunction) {
  if (mediaType.example || !mediaType.schema || !("$ref" in mediaType.schema)) return mediaType;
  return {
    ...mediaType,
    ...injector(mediaType.schema.$ref),
  } as MediaTypeObject;
}

function completeParameterExamples(parameters: OperationObject["parameters"]) {
  return parameters;
}

function completeRequestBodyExample(requestBody: OperationObject["requestBody"], injector: InjectorFunction) {
  if (!requestBody || !("content" in requestBody)) return requestBody;
  return {
    ...requestBody,
    content: Object.fromEntries(Object.entries(requestBody.content).map(([mimeType, mediaType]) => {
      return [mimeType, completeMediaTypeExample(mediaType, injector)] as const;
    })),
  } as RequestBodyObject;
}

function completeResponseExamples(responses: OperationObject["responses"]) {
  return responses;
}

export default function completeExamples(
  operation: OperationObject,
  exampleStrategy: ExampleStrategy,
  storedSchemas: Record<string, ZodType>,
) {
  if (exampleStrategy === "none") return operation;
  const injector = injectExample.bind(null, exampleStrategy, storedSchemas);
  return {
    ...operation,
    parameters: completeParameterExamples(operation.parameters),
    requestBody: completeRequestBodyExample(operation.requestBody, injector),
    responses: completeResponseExamples(operation.responses),
  } as OperationObject;
}
