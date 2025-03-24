# Overview

Reproduction for: 

`state-pollution.test.ts` contains a single test that attempts to open and close 2 orm instances, with the second instance crashing.

An example STI schema of  `Content <- Archive <- VideoArchive`, and an `m:n` relationship between Archive and Content exhibits the problem. This structure might be used for managing content in S3, where a single Content file can belong to many Archives, and an Archive can contain many pieces of Content, as well as other Archives - i.e. a directory system for organizing S3 content. STI allows this index structure to be queried polymorphically without joins.

Specifically, when the first ORM is initialized with all 3 schema:

```
const ormLocal = await MikroORM.init({
  entities: [ContentSchema, ArchiveSchema, VideoArchiveSchema],
  ...
});
```

and the second ORM is initialized with only the first 2:

```
const ormLocal2 = await MikroORM.init({
  entities: [ContentSchema, ArchiveSchema],
  ...
});
```

the second orm init crashes with:

 `MetadataError: Entity 'VideoArchive' was not discovered, please make sure to provide it in 'entities' array when initializing the ORM (used in Content.VideoArchive_items__inverse)`

 The relationship `Content.VideoArchive_items__inverse` appears to have been retained from the first ORM instance.
