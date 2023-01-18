## Problem

Imagine that we need to display a list of uncompleted ToDo's on a website.

```ts
import { MongoClient } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import type { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";

const client = new MongoClient();
await client.connect(/* your connection uri */);

const db = client.database(/* database name */);

interface ToDo {
  readonly _id: ObjectId;
  readonly title: string;
  completed: boolean;
}

const collection = db.collection<ToDo>("todos");
const cursor = collection.find({ completed: false });

for await (const todo of cursor) {
  // ...
}
```

Obviously, it is unprofitable to search for all ToDo's:

- What if there are an infinite number of them?
- What if the user wants to see only the first 10 ToDo's?

## Solution

Why not send portions of found ToDo's as needed? That's exactly what this module
does.

## Usage

Import the paginate function to create a
[FindCursor](https://deno.land/x/mongo@v0.31.1/src/collection/commands/find.ts?source#L13).

```ts
import { paginate } from "https://deno.land/x/mongo_paginate@0.1.0/mod.ts";

const cursor = paginate({
  collection,
  filter: { completed: false },
  limit: 10,
});

const todos = await cursor.toArray();
```

If the user wants to see more ToDo's, include the last one from the previous
query.

```ts
const lastTodo = todos[todos.length - 1];

const nextCursor = paginate({
  collection,
  filter: { completed: false },
  limit: 10,
  cursor: lastTodo._id,
});

const nextTodos = await nextCursor.toArray();
```

You can also specify the projection or sort order for a better experience.

```ts
import { SortOrder } from "https://deno.land/x/mongo_paginate@0.1.0/mod.ts";

const cursor = paginate({
  collection,
  filter: { completed: false },
  limit: 10,
  projection: { completed: 0 },
  order: SortOrder.DESCENDING,
});

const recentTodos = await cursor.toArray();
```
