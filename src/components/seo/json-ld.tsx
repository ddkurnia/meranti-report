type Schemas = Record<string, unknown> | Record<string, unknown>[];

interface JsonLdProps {
  schemas: Schemas;
}

export function JsonLd({ schemas }: JsonLdProps) {
  const schemaArray = Array.isArray(schemas) ? schemas : [schemas];

  return (
    <>
      {schemaArray.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
