import type { Collection, Document, Filter, ObjectId } from "./deps.ts";

export type PaginateFilter<T> = Omit<Filter<T>, "_id">;

export enum SortOrder {
  ASCENDING = 1,
  DESCENDING = -1,
}

export interface PaginateOptions<T> {
  collection: Collection<T>;
  filter: PaginateFilter<T>;
  limit: number;
  projection?: Document;
  cursor?: ObjectId;
  order?: SortOrder;
}

export type CursorFilter<T> = PaginateFilter<T> & {
  _id?: { $gt: ObjectId } | { $lt: ObjectId };
};

export function paginate<T>(options: PaginateOptions<T>) {
  if (options.limit <= 0) {
    throw new Error("Limit must be greater than 0");
  }

  const order = options.order ?? SortOrder.ASCENDING;

  const filter: CursorFilter<T> = options.filter;
  if (options.cursor) {
    filter._id = order === SortOrder.ASCENDING
      ? { $gt: options.cursor }
      : { $lt: options.cursor };
  }

  return options.collection.find(filter, {
    limit: options.limit,
    projection: options.projection,
    sort: { _id: order },
  });
}
