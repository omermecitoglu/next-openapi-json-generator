import { omit } from "../utils/object";
import type { OpenApiDocument } from "@omer-x/openapi-types";

function countReferences(schemaName: string, source: string) {
  return (source.match(new RegExp(`"#/components/schemas/${schemaName}"`, "g")) ?? []).length;
}

export default function clearUnusedSchemas({
  paths,
  components,
}: Required<Pick<OpenApiDocument, "paths" | "components">>) {
  if (!components.schemas) return { paths, components };
  const stringifiedPaths = JSON.stringify(paths);
  const stringifiedSchemas = Object.fromEntries(Object.entries(components.schemas).map(([schemaName, schema]) => {
    return [schemaName, JSON.stringify(schema)];
  }));
  return {
    paths,
    components: {
      schemas: Object.fromEntries(Object.entries(components.schemas).filter(([schemaName]) => {
        const otherSchemas = omit(stringifiedSchemas, schemaName);
        return (
          countReferences(schemaName, stringifiedPaths) > 0 ||
          countReferences(schemaName, Object.values(otherSchemas).join("")) > 0
        );
      })),
    },
  };
}
