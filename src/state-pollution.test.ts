import { MikroORM } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { Content, ContentSchema, ArchiveSchema, VideoArchiveSchema } from './schema';

describe('pollution test', () => {
  it('should not pollute second orm', async () => {
    /*** ORM 1 ***/

    const ormLocal = await MikroORM.init({
      entities: [ContentSchema, ArchiveSchema, VideoArchiveSchema],
      dbName: ':memory:',
      driver: SqliteDriver,
      debug: ['query', 'query-params'],
      contextName: 'db-1',
      metadataCache: { enabled: false },
      allowGlobalContext: false
    });

    await ormLocal.schema.refreshDatabase();
    const em1 = ormLocal.em.fork();

    const content1 = new Content();
    content1.name = 'Content 1';
    await em1.persistAndFlush(content1);

    const foundEntity = await em1.findOne(Content, { name: 'Content 1' });
    expect(foundEntity).toBeDefined();
    expect(foundEntity?.name).toBe('Content 1');

    await ormLocal.close();
    console.log('Closed orm 1');

    /*** ORM 2 ***/

    const ormLocal2 = await MikroORM.init({
      entities: [ContentSchema, ArchiveSchema],
      dbName: ':memory:',
      driver: SqliteDriver,
      debug: ['query', 'query-params'],
      contextName: 'db-2',
      metadataCache: { enabled: false },
      allowGlobalContext: false
    });

    await ormLocal2.schema.refreshDatabase();
    const em2 = ormLocal2.em.fork();

    const content2 = new Content();
    content2.name = 'Content 2';
    await em2.persistAndFlush(content2);

    const foundEntity2 = await em2.findOne(Content, { name: 'Content 2' });
    expect(foundEntity2).toBeDefined();
    expect(foundEntity2?.name).toBe('Content 2');

    await ormLocal2.close();
    console.log('Closed orm 2');
  })
});
