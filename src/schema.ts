import { EntitySchema, Collection } from '@mikro-orm/core';

// A piece of Content can belong to many Archives
export class Content {
  id!: number;
  name!: string;
  type!: string;

  archives = new Collection<Archive>(this);
}

// An Archive contains many items of Content, and can also be treated as Content itself
export class Archive extends Content {
  items = new Collection<Content>(this);
}

// Video Archive
export class VideoArchive extends Archive {
  studioName?: string;
}


export const ContentSchema = new EntitySchema<Content>({
  class: Content,
  discriminatorColumn: 'type',
  discriminatorValue: 'content',
  properties: {
    id: { type: 'number', primary: true },
    name: { type: 'string' },
    type: { type: 'string' },
    archives: {
      kind: 'm:n',
      entity: () => 'Archive',
      mappedBy: 'items',
      owner: false
    }
  }
}); 

// MidEntity schema extending BaseSchema
export const ArchiveSchema = new EntitySchema<Archive, Content>({
  class: Archive,
  extends: ContentSchema,
  discriminatorValue: 'archive',
  properties: {
    items: {
      kind: 'm:n',
      entity: () => 'Content',
      owner: true,
      pivotTable: 'content_archive',
      joinColumn: 'archive_id',
      inverseJoinColumn: 'content_id'
    }
  }
});

// ParentEntity schema extending MidSchema
export const VideoArchiveSchema = new EntitySchema<VideoArchive, Archive>({
  class: VideoArchive,
  extends: ArchiveSchema,
  discriminatorValue: 'videoArchive',
  properties: {
    studioName: { type: 'string' },
  }
});
